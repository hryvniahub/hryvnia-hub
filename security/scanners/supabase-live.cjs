"use strict";

const { spawnSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const { isIP } = require("node:net");

// A dedicated audit login must own nothing, have no memberships or write/DDL
// privileges (including PUBLIC TEMP), and cannot execute any SECURITY DEFINER.
// Read-only transactions alone do not make privileged connections safe.
const SAFE_IDENTITY = `EXISTS (
  SELECT 1 FROM pg_catalog.pg_roles r
  WHERE r.rolname = current_user AND current_user = session_user
    AND r.rolcanlogin AND NOT (r.rolsuper OR r.rolbypassrls OR r.rolcreaterole OR r.rolcreatedb OR r.rolreplication)
    AND r.rolname !~* '^(postgres([._].*)?|supabase.*|service_role|anon|authenticated|admin|root)$'
    AND NOT EXISTS (SELECT 1 FROM pg_catalog.pg_auth_members m WHERE m.member = r.oid)
    AND NOT EXISTS (SELECT 1 FROM pg_catalog.pg_shdepend d
      WHERE d.refclassid = 'pg_catalog.pg_authid'::regclass AND d.refobjid = r.oid AND d.deptype = 'o')
    AND NOT pg_catalog.has_database_privilege(r.oid, current_database(), 'CREATE,TEMP')
    AND NOT EXISTS (SELECT 1 FROM pg_catalog.pg_namespace n
      WHERE pg_catalog.has_schema_privilege(r.oid, n.oid, 'CREATE'))
    AND NOT EXISTS (SELECT 1 FROM pg_catalog.pg_class c
      WHERE c.relkind IN ('r','p','v','m','f') AND (
        pg_catalog.has_table_privilege(r.oid, c.oid, 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
        OR pg_catalog.has_any_column_privilege(r.oid, c.oid, 'INSERT,UPDATE,REFERENCES')))
    AND NOT EXISTS (SELECT 1 FROM pg_catalog.pg_class c WHERE c.relkind = 'S'
      AND pg_catalog.has_sequence_privilege(r.oid, c.oid, 'USAGE,UPDATE'))
    AND NOT EXISTS (SELECT 1 FROM pg_catalog.pg_proc p
      WHERE p.prosecdef AND pg_catalog.has_schema_privilege(r.oid, p.pronamespace, 'USAGE')
        AND pg_catalog.has_function_privilege(r.oid, p.oid, 'EXECUTE'))
)`;

// psql evaluates the guard before issuing the catalog snapshot in this same
// transaction/session. Only PostgreSQL catalogs are read, never bucket/app rows.
const READ_ONLY_QUERY = `BEGIN READ ONLY;
SET LOCAL statement_timeout = '10s';
SET LOCAL lock_timeout = '2s';
SET LOCAL idle_in_transaction_session_timeout = '10s';
SET LOCAL search_path = pg_catalog;
SELECT ${SAFE_IDENTITY} AS audit_safe
\\gset
\\if :audit_safe
SELECT json_build_object(
  'version', 1,
  'identity', (SELECT json_build_object(
    'name', r.rolname, 'sessionUser', session_user, 'auditSafe', true,
    'superuser', r.rolsuper, 'bypassRls', r.rolbypassrls, 'createRole', r.rolcreaterole,
    'createDb', r.rolcreatedb, 'replication', r.rolreplication
  ) FROM pg_roles r WHERE r.rolname = current_user),
  'roles', COALESCE((SELECT json_agg(json_build_object(
    'name', rolname, 'superuser', rolsuper, 'bypassRls', rolbypassrls
  )) FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role')), '[]'::json),
  'memberships', COALESCE((SELECT json_agg(json_build_object(
    'member', member.rolname, 'role', parent.rolname, 'inherit', member.rolinherit,
    'admin', m.admin_option
  )) FROM pg_auth_members m JOIN pg_roles member ON member.oid = m.member
    JOIN pg_roles parent ON parent.oid = m.roleid), '[]'::json),
  'tables', COALESCE((SELECT json_agg(json_build_object(
    'name', n.nspname || '.' || c.relname, 'oid', c.oid, 'rls', c.relrowsecurity,
    'forceRls', c.relforcerowsecurity, 'owner', pg_get_userbyid(c.relowner)
  )) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind IN ('r','p') AND n.nspname IN ('public','storage')), '[]'::json),
  'policies', COALESCE((SELECT json_agg(json_build_object(
    'name', p.policyname, 'table', p.schemaname || '.' || p.tablename, 'command', p.cmd,
    'roles', p.roles, 'permissive', p.permissive,
    'usingPresent', p.qual IS NOT NULL, 'checkPresent', p.with_check IS NOT NULL,
    'ownerUsing', COALESCE(p.qual ~* 'auth[.]uid[[:space:]]*[(][[:space:]]*[)]' AND p.qual ~* '(user_id|owner_id|created_by|sender_id|recipient_id|buyer_id|seller_id|owner|foldername)', false),
    'ownerCheck', COALESCE(p.with_check ~* 'auth[.]uid[[:space:]]*[(][[:space:]]*[)]' AND p.with_check ~* '(user_id|owner_id|created_by|sender_id|recipient_id|buyer_id|seller_id|owner|foldername)', false),
    'unconditional', COALESCE(p.qual ~* '^[[:space:]()]*true[[:space:]()]*$', false)
      OR COALESCE(p.with_check ~* '^[[:space:]()]*true[[:space:]()]*$', false)
  )) FROM pg_policies p WHERE p.schemaname IN ('public','storage')), '[]'::json),
  'grants', COALESCE((SELECT json_agg(json_build_object(
    'grantee', CASE WHEN acl.grantee = 0 THEN 'PUBLIC' ELSE pg_get_userbyid(acl.grantee) END,
    'table', n.nspname || '.' || c.relname, 'privilege', acl.privilege_type
  )) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    CROSS JOIN LATERAL aclexplode(COALESCE(c.relacl, acldefault('r', c.relowner))) acl
    WHERE c.relkind IN ('r','p') AND n.nspname IN ('public','storage')), '[]'::json),
  'functions', COALESCE((SELECT json_agg(json_build_object(
    'name', n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
    'oid', p.oid, 'definer', p.prosecdef, 'owner', pg_get_userbyid(p.proowner),
    'config', COALESCE(p.proconfig, ARRAY[]::text[])
  )) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname IN ('public','storage')), '[]'::json),
  'functionGrants', COALESCE((SELECT json_agg(json_build_object(
    'grantee', CASE WHEN acl.grantee = 0 THEN 'PUBLIC' ELSE pg_get_userbyid(acl.grantee) END,
    'name', n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
    'privilege', acl.privilege_type
  )) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) acl
    WHERE n.nspname IN ('public','storage')), '[]'::json),
  'effectiveTablePrivileges', COALESCE((SELECT json_agg(json_build_object(
    'role', r.rolname, 'table', n.nspname || '.' || c.relname, 'privilege', priv.name,
    'allowed', has_table_privilege(r.oid, c.oid, priv.name),
    'columnAllowed', CASE WHEN priv.name IN ('SELECT','INSERT','UPDATE','REFERENCES')
      THEN has_any_column_privilege(r.oid, c.oid, priv.name) ELSE false END,
    'owner', pg_has_role(r.oid, c.relowner, 'USAGE')
  )) FROM pg_roles r CROSS JOIN pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    CROSS JOIN unnest(ARRAY['SELECT','INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER']) priv(name)
    WHERE r.rolname IN ('anon','authenticated') AND c.relkind IN ('r','p')
      AND n.nspname IN ('public','storage')), '[]'::json),
  'effectiveFunctionPrivileges', COALESCE((SELECT json_agg(json_build_object(
    'role', r.rolname,
    'name', n.nspname || '.' || p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')',
    'allowed', has_function_privilege(r.oid, p.oid, 'EXECUTE')
  )) FROM pg_roles r CROSS JOIN pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE r.rolname IN ('anon','authenticated') AND n.nspname IN ('public','storage')), '[]'::json),
  'effectiveSchemaPrivileges', COALESCE((SELECT json_agg(json_build_object(
    'role', r.rolname, 'schema', n.nspname,
    'usage', has_schema_privilege(r.oid, n.oid, 'USAGE'),
    'create', has_schema_privilege(r.oid, n.oid, 'CREATE')
  )) FROM pg_roles r CROSS JOIN pg_namespace n
    WHERE r.rolname IN ('anon','authenticated') AND n.nspname IN ('public','storage')), '[]'::json)
);
\\else
\\echo AUDIT_IDENTITY_REJECTED
\\endif
ROLLBACK;`;

const REQUIRED_TABLES = new Set([
  "public.listings", "public.messages", "public.conversations", "public.favorites", "storage.objects"
]);
const PROHIBITED_IDENTITY = /^(?:postgres(?:[._].*)?|supabase.*|service_role|anon|authenticated|admin|root)$/i;
const ARRAY_FIELDS = [
  "roles", "memberships", "tables", "policies", "grants", "functions", "functionGrants",
  "effectiveTablePrivileges", "effectiveFunctionPrivileges", "effectiveSchemaPrivileges"
];
const string = value => typeof value === "string" && value.length > 0;
const bool = value => typeof value === "boolean";
const record = value => value !== null && typeof value === "object" && !Array.isArray(value);
const strings = value => Array.isArray(value) && value.every(string);
const TABLE_PRIVILEGES = ["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER"];

function safeIdentity(identity) {
  return record(identity) && string(identity.name) && !PROHIBITED_IDENTITY.test(identity.name)
    && identity.sessionUser === identity.name && identity.auditSafe === true
    && ["superuser", "bypassRls", "createRole", "createDb", "replication"].every(key => identity[key] === false);
}

function validSnapshot(snapshot) {
  if (!record(snapshot) || snapshot.version !== 1 || !safeIdentity(snapshot.identity)
    || !ARRAY_FIELDS.every(key => Array.isArray(snapshot[key]) && snapshot[key].every(record))) return false;
  const checks = {
    roles: r => string(r.name) && bool(r.superuser) && bool(r.bypassRls),
    memberships: r => string(r.member) && string(r.role) && bool(r.inherit) && bool(r.admin),
    tables: r => string(r.name) && Number.isInteger(r.oid) && r.oid > 0
      && bool(r.rls) && bool(r.forceRls) && string(r.owner),
    policies: r => string(r.name) && string(r.table) && ["SELECT", "INSERT", "UPDATE", "DELETE", "ALL"].includes(r.command)
      && strings(r.roles) && ["PERMISSIVE", "RESTRICTIVE"].includes(r.permissive)
      && ["usingPresent", "checkPresent", "ownerUsing", "ownerCheck", "unconditional"].every(key => bool(r[key])),
    grants: r => string(r.grantee) && string(r.table) && TABLE_PRIVILEGES.includes(r.privilege),
    functions: r => string(r.name) && /\([^]*\)$/.test(r.name) && Number.isInteger(r.oid) && r.oid > 0
      && bool(r.definer) && string(r.owner) && Array.isArray(r.config) && r.config.every(string),
    functionGrants: r => string(r.grantee) && string(r.name) && r.privilege === "EXECUTE",
    effectiveTablePrivileges: r => ["anon", "authenticated"].includes(r.role) && string(r.table)
      && TABLE_PRIVILEGES.includes(r.privilege) && bool(r.allowed) && bool(r.columnAllowed) && bool(r.owner),
    effectiveFunctionPrivileges: r => ["anon", "authenticated"].includes(r.role) && string(r.name) && bool(r.allowed),
    effectiveSchemaPrivileges: r => ["anon", "authenticated"].includes(r.role) && string(r.schema) && bool(r.usage) && bool(r.create)
  };
  if (!Object.entries(checks).every(([key, check]) => snapshot[key].every(check))) return false;
  const unique = (rows, key) => new Set(rows.map(key)).size === rows.length;
  if (!unique(snapshot.tables, r => r.name) || !unique(snapshot.functions, r => r.name)
    || !unique(snapshot.roles, r => r.name)
    || !unique(snapshot.policies, r => JSON.stringify([r.table, r.name]))
    || !unique(snapshot.effectiveTablePrivileges, r => JSON.stringify([r.role, r.table, r.privilege]))
    || !unique(snapshot.effectiveFunctionPrivileges, r => JSON.stringify([r.role, r.name]))
    || !unique(snapshot.effectiveSchemaPrivileges, r => JSON.stringify([r.role, r.schema]))) return false;
  if (snapshot.memberships.some(r => r.member === snapshot.identity.name)) return false;
  const tableNames = new Set(snapshot.tables.map(r => r.name));
  const functionNames = new Set(snapshot.functions.map(r => r.name));
  if (snapshot.policies.some(r => !tableNames.has(r.table)) || snapshot.grants.some(r => !tableNames.has(r.table))
    || snapshot.functionGrants.some(r => !functionNames.has(r.name))
    || snapshot.effectiveTablePrivileges.some(r => !tableNames.has(r.table))
    || snapshot.effectiveFunctionPrivileges.some(r => !functionNames.has(r.name))) return false;
  if (snapshot.roles.some(r => !["anon", "authenticated", "service_role"].includes(r.name))) return false;
  const roles = snapshot.roles.filter(r => ["anon", "authenticated"].includes(r.name));
  if (["effectiveTablePrivileges", "effectiveFunctionPrivileges", "effectiveSchemaPrivileges"]
    .some(key => snapshot[key].some(row => !roles.some(role => role.name === row.role)))) return false;
  return roles.every(role =>
    snapshot.tables.every(table => TABLE_PRIVILEGES.every(privilege =>
      snapshot.effectiveTablePrivileges.some(r => r.role === role.name && r.table === table.name && r.privilege === privilege)))
    && snapshot.functions.every(fn =>
      snapshot.effectiveFunctionPrivileges.some(r => r.role === role.name && r.name === fn.name))
    && [...new Set([...snapshot.tables.map(r => r.name.split(".")[0]), ...snapshot.functions.map(r => r.name.split(".")[0])])]
      .every(schema => snapshot.effectiveSchemaPrivileges.some(r => r.role === role.name && r.schema === schema)));
}

function inspectSnapshot(snapshot) {
  const findings = [];
  const add = (code, severity, object, description, evidence, risk, recommendation, status = "potential", discriminator = "") => {
    const suffix = createHash("sha256").update(JSON.stringify([object, discriminator])).digest("hex").slice(0, 16);
    findings.push({
      id: `${code}-${suffix}`, category: object.startsWith("storage.") ? "Storage Security" : "Supabase Database Security",
      severity, status, object, description, evidence, risk, recommendation
    });
  };
  if (!validSnapshot(snapshot)) {
    add("LIVE-CONNECTION-001", "INFO", "database connection", "Catalog snapshot or audit identity was not verified.",
      "Missing, malformed, incomplete or prohibited audit identity/catalog metadata; output withheld.",
      "Live database coverage is unavailable.", "Use the dedicated restricted audit login and the current catalog-only query.", "not-run");
    return findings;
  }
  const tables = new Map(snapshot.tables.map(table => [table.name, table]));
  for (const name of REQUIRED_TABLES) {
    if (!tables.has(name)) add("LIVE-TABLE", "INFO", name, `Expected catalog object ${name} was not present.`,
      "Catalog query returned no matching relation.", "This object's policies cannot be evaluated.",
      "Confirm deployed schema and application object names.", "not-run");
  }
  for (const table of snapshot.tables) {
    const name = table.name;
    if (!table.rls) add("LIVE-RLS-001", "CRITICAL", name, `Row-level security is disabled on ${name}.`,
      "pg_class.relrowsecurity = false.", "Roles with table privileges are not restricted by RLS.",
      "Enable RLS and define appropriate operation-specific policies.", "confirmed");
    const policies = snapshot.policies.filter(policy => policy.table === name);
    if (table.rls && !policies.length) add("LIVE-RLS-002", "INFO", name, `RLS is enabled on ${name}, but no policy is present.`,
      "pg_policies returned no matching rows.", "Ordinary roles are generally denied by RLS.",
      "Verify the intended access model and deployed policy set.", "confirmed");
    for (const policy of policies) {
      // Memberships, restrictive policy composition and grants determine actual
      // access. Textual owner/unconditional checks never prove exploitability.
      const exposedRole = policy.roles.some(role => ["anon", "authenticated", "public"].includes(role.toLowerCase()))
        || snapshot.memberships.some(m => policy.roles.includes(m.role));
      const writes = ["INSERT", "UPDATE", "DELETE", "ALL"].includes(policy.command);
      if (exposedRole && writes && policy.unconditional) {
        add("LIVE-POLICY-001", "HIGH", name, `Policy ${policy.name} has an unconditional write condition.`,
          `${policy.command}; ${policy.permissive}; true USING or WITH CHECK condition detected.`,
          "Cross-user writes may be possible, depending on effective grants and all applicable policies.",
          "Review policy composition, ownership conditions and effective grants.", "potential", policy.name);
      } else if (exposedRole && writes && (
        (policy.command === "INSERT" && !policy.ownerCheck)
        || (policy.command === "DELETE" && !policy.ownerUsing)
        || (["UPDATE", "ALL"].includes(policy.command) && (!policy.ownerUsing || !policy.ownerCheck))
      )) {
        add("LIVE-POLICY-002", "HIGH", name, `Policy ${policy.name} has no statically recognizable owner condition.`,
          `${policy.command} condition did not match the auth.uid ownership heuristic.`,
          "Authorization may use other valid mechanisms; catalog heuristics cannot establish exploitability.",
          "Review both existing-row and new-row authorization.", "potential", policy.name);
      } else if (exposedRole && policy.command === "SELECT" && policy.unconditional && name !== "public.listings") {
        add("LIVE-POLICY-003", "HIGH", name, `Policy ${policy.name} has an unconditional read condition.`,
          `${policy.permissive} SELECT condition includes true.`,
          "Unintended reads may be possible, depending on effective grants and all applicable policies.",
          "Review intended visibility and restrictive policies.", "potential", policy.name);
      }
    }
  }
  for (const role of snapshot.roles) {
    if (["anon", "authenticated"].includes(role.name) && (role.bypassRls || role.superuser)) {
      add("LIVE-RLS-003", "CRITICAL", `role ${role.name}`, `Application role ${role.name} can bypass RLS.`,
        "pg_roles reports BYPASSRLS or SUPERUSER.", "RLS cannot constrain this role.",
        "Remove privileged role attributes.", "confirmed");
    }
  }
  const schemaUsage = (role, object) => snapshot.effectiveSchemaPrivileges.some(
    r => r.role === role && r.schema === object.split(".")[0] && r.usage);
  for (const schema of snapshot.effectiveSchemaPrivileges) {
    if (schema.create) add("LIVE-SCHEMA-001", "HIGH", schema.schema, `Role ${schema.role} can create schema objects.`,
      "has_schema_privilege(..., CREATE) = true (including inherited/PUBLIC grants).",
      "API callers may create objects if a SQL execution surface is available.",
      "Revoke unneeded schema CREATE privileges.", "potential", schema.role);
  }
  for (const fn of snapshot.functions) {
    if (!fn.definer) continue;
    const configuredPath = fn.config.find(value => value.startsWith("search_path="))?.slice("search_path=".length);
    if (configuredPath === undefined || !configuredPath.split(",").every(schema => ["", "pg_catalog"].includes(schema.trim().replaceAll('"', "")))) {
      add("LIVE-RPC-001", "HIGH", fn.name, `SECURITY DEFINER function ${fn.name} lacks a demonstrably trusted search_path.`,
        "pg_proc.proconfig has no empty/pg_catalog-only search_path.",
        "Object shadowing may affect privileged execution; function bodies were not inspected.",
        "Use an empty or trusted fixed search_path and qualify referenced objects.");
    }
    for (const grant of snapshot.effectiveFunctionPrivileges.filter(r => r.name === fn.name && r.allowed && schemaUsage(r.role, r.name))) {
      add("LIVE-RPC-002", "HIGH", fn.name, `Role ${grant.role} can execute SECURITY DEFINER function ${fn.name}.`,
        "has_function_privilege(..., EXECUTE) and schema USAGE are true, including inherited/PUBLIC privileges.",
        "The routine runs with owner privileges; catalog access alone cannot verify internal authorization.",
        "Verify authorization inside the routine and revoke unnecessary execution rights.", "potential", grant.role);
    }
  }
  for (const grant of snapshot.effectiveTablePrivileges) {
    if ((!grant.allowed && !grant.columnAllowed) || !schemaUsage(grant.role, grant.table)) continue;
    const table = tables.get(grant.table);
    if (grant.privilege === "TRUNCATE") {
      add("LIVE-GRANT-001", "HIGH", grant.table, `Role ${grant.role} has effective TRUNCATE privilege.`,
        "has_table_privilege includes inherited and PUBLIC grants.", "TRUNCATE is not constrained by RLS.",
        "Revoke TRUNCATE from API roles and their parent roles.", "confirmed", `${grant.role}:TRUNCATE`);
    } else if (["INSERT", "UPDATE", "DELETE"].includes(grant.privilege) && (!table.rls || (grant.owner && !table.forceRls))) {
      add("LIVE-GRANT-002", "HIGH", grant.table, `Role ${grant.role} has effective ${grant.privilege} without enforced RLS.`,
        "Effective table/column privileges and ownership were evaluated by PostgreSQL.",
        "Role can modify rows without row-level restrictions.", "Remove unnecessary privileges and enforce RLS.",
        "confirmed", `${grant.role}:${grant.privilege}`);
    }
  }
  for (const role of ["anon", "authenticated"]) {
    if (!snapshot.roles.some(r => r.name === role)) add("LIVE-ROLE", "INFO", `role ${role}`, `Role ${role} was absent from the catalog.`,
      "No matching pg_roles row.", "Effective privileges for this role cannot be evaluated.",
      "Confirm deployed API role names.", "not-run");
  }
  add("LIVE-STORAGE-NOT-RUN", "INFO", "storage.buckets", "Bucket configuration was not inspected.",
    "Catalog-only mode deliberately does not read storage.buckets application metadata.",
    "Public bucket flags, size limits and MIME restrictions are not covered.",
    "Review bucket settings separately through an explicitly authorized read-only process.", "not-run");
  return findings;
}

function connectionOptions(connectionString) {
  const url = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname || !url.username || url.hash) throw new Error("invalid");
  const username = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  const database = decodeURIComponent(url.pathname.slice(1));
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (PROHIBITED_IDENTITY.test(username) || !/^[a-z0-9_.-]+$/i.test(username) || !/^[a-z0-9_.-]+$/i.test(database)
    || (!isIP(hostname) && !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(hostname))
    || (url.port && (!/^\d+$/.test(url.port) || Number(url.port) < 1 || Number(url.port) > 65535))
    || /[\u0000\r\n]/.test(password)) throw new Error("invalid");
  if ([...url.searchParams.keys()].some(key => key !== "sslmode") || url.searchParams.getAll("sslmode").length > 1) throw new Error("invalid");
  const loopback = ["localhost", "127.0.0.1", "[::1]", "::1"].includes(url.hostname.toLowerCase());
  const sslmode = url.searchParams.get("sslmode") || "verify-full";
  if (!(loopback ? ["disable", "verify-full"] : ["verify-full"]).includes(sslmode)) throw new Error("invalid");
  return {
    PGHOST: hostname, PGPORT: url.port || "5432", PGDATABASE: database,
    PGUSER: username, PGPASSWORD: password, PGSSLMODE: sslmode
  };
}

function scanLiveDatabase({ env = process.env, timeout = 60000, commandRunner = spawnSync } = {}) {
  const notRun = reason => ({ status: "NOT_RUN", findings: [], reason });
  if (!env.SUPABASE_READONLY_DATABASE_URL) return notRun("SUPABASE_READONLY_DATABASE_URL is not configured.");
  if (!["development", "test", "staging"].includes(env.SUPABASE_AUDIT_ENVIRONMENT)) {
    return notRun("Live inspection requires SUPABASE_AUDIT_ENVIRONMENT=development, test or staging and that environment's dedicated audit URL; production is prohibited.");
  }
  let connection;
  try { connection = connectionOptions(env.SUPABASE_READONLY_DATABASE_URL); } catch {
    return notRun("Database URL rejected: use a dedicated audit login, PostgreSQL URL, no connection options other than sslmode, and verify-full TLS outside loopback.");
  }
  // Never inherit libpq service files, startup SQL options, password files or
  // psql configuration. Credentials exist only in the child process environment.
  const childEnv = Object.fromEntries(Object.entries(env).filter(([key]) =>
    !/^(?:PG|PSQL)/i.test(key) && !/^SUPABASE_/i.test(key)));
  Object.assign(childEnv, connection, {
    PGCONNECT_TIMEOUT: "10", PGPASSFILE: "/dev/null", PGSERVICEFILE: "/dev/null",
    PGSYSCONFDIR: "/dev/null", PGAPPNAME: "catalog-only-security-audit",
    PGOPTIONS: "-c default_transaction_read_only=on -c statement_timeout=10000 -c lock_timeout=2000"
  });
  let result;
  try {
    result = commandRunner("psql", ["-X", "-w", "-q", "-t", "-A", "--set=ON_ERROR_STOP=1"], {
      input: READ_ONLY_QUERY, env: childEnv, encoding: "utf8", timeout, maxBuffer: 8 * 1024 * 1024,
      windowsHide: true
    });
  } catch {
    return notRun("Read-only catalog inspection failed; connection details and command output were withheld.");
  }
  if (!result || result.error || result.status !== 0 || typeof result.stdout !== "string") {
    return notRun("Read-only catalog inspection failed; connection details and command output were withheld.");
  }
  if (result.stdout.trim() === "AUDIT_IDENTITY_REJECTED") {
    return notRun("Audit identity rejected before inspection: require a dedicated login with no privileged attributes, memberships, ownership, effective write/DDL rights (including PUBLIC TEMP), or executable SECURITY DEFINER routines.");
  }
  let snapshot;
  try { snapshot = JSON.parse(result.stdout.trim()); } catch {
    return notRun("The catalog query returned invalid data; output was withheld.");
  }
  if (!validSnapshot(snapshot)) return notRun("The catalog snapshot was incomplete, malformed, or lacked a verified restricted identity; output was withheld.");
  const findings = inspectSnapshot(snapshot);
  const blocking = findings.some(finding => finding.status !== "not-run" && ["CRITICAL", "HIGH"].includes(finding.severity));
  return {
    status: blocking ? "FAIL" : findings.some(finding => finding.status === "not-run") ? "NOT_RUN" : "PASS",
    findings,
    coverage: { database: blocking ? "FAIL" : "PASS", storage: "NOT_RUN", storageBuckets: "NOT_RUN" },
    reason: "Catalog-only inspection completed in a guarded read-only transaction. Bucket settings and application authorization behavior were NOT_RUN; no application rows were read."
  };
}

module.exports = { READ_ONLY_QUERY, inspectSnapshot, scanLiveDatabase };
