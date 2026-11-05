"use strict";

const { spawnSync } = require("node:child_process");

const READ_ONLY_QUERY = `BEGIN READ ONLY;
SELECT json_build_object(
  'identity', (SELECT json_build_object('name', r.rolname, 'superuser', r.rolsuper, 'bypassRls', r.rolbypassrls)
    FROM pg_roles r WHERE r.rolname = current_user),
  'roles', COALESCE((SELECT json_agg(json_build_object(
    'name', rolname, 'superuser', rolsuper, 'bypassRls', rolbypassrls
  )) FROM pg_roles WHERE rolname IN ('anon','authenticated','service_role')), '[]'::json),
  'tables', COALESCE((SELECT json_agg(json_build_object(
    'name', n.nspname || '.' || c.relname, 'rls', c.relrowsecurity, 'forceRls', c.relforcerowsecurity
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
    'grantee', grantee, 'table', table_schema || '.' || table_name, 'privilege', privilege_type
  )) FROM information_schema.role_table_grants
    WHERE grantee IN ('anon','authenticated','service_role','PUBLIC')
      AND table_schema IN ('public','storage')), '[]'::json),
  'functions', COALESCE((SELECT json_agg(json_build_object(
    'name', n.nspname || '.' || p.proname, 'definer', p.prosecdef,
    'searchPath', COALESCE(array_to_string(p.proconfig, ','), '')
  )) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname IN ('public','storage')), '[]'::json),
  'functionGrants', COALESCE((SELECT json_agg(json_build_object(
    'grantee', CASE WHEN acl.grantee = 0 THEN 'PUBLIC' ELSE grantee.rolname END,
    'name', n.nspname || '.' || p.proname, 'privilege', acl.privilege_type
  )) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    CROSS JOIN LATERAL aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) acl
    LEFT JOIN pg_roles grantee ON grantee.oid = acl.grantee
    WHERE n.nspname IN ('public','storage') AND acl.privilege_type = 'EXECUTE'
      AND (acl.grantee = 0 OR grantee.rolname IN ('anon','authenticated','service_role'))), '[]'::json),
  'buckets', COALESCE((SELECT json_agg(json_build_object(
    'name', id, 'public', public, 'fileSizeLimit', file_size_limit, 'allowedMimeTypes', allowed_mime_types
  ))
    FROM storage.buckets), '[]'::json)
);
COMMIT;`;

const REQUIRED_TABLES = new Set([
  "public.listings", "public.messages", "public.conversations", "public.favorites", "storage.objects"
]);

function inspectSnapshot(snapshot) {
  const findings = [];
  const add = (id, severity, object, description, evidence, risk, recommendation, status = "confirmed") => findings.push({
    id, category: object.startsWith("storage.") ? "Storage Security" : "Supabase Database Security",
    severity, status, object, description, evidence, risk, recommendation
  });
  const tables = new Map((snapshot.tables || []).map(table => [table.name, table]));
  for (const name of REQUIRED_TABLES) {
    const table = tables.get(name);
    if (!table) {
      findings.push({
        id: `LIVE-TABLE-${name.replace(/\W/g, "-")}`, category: name.startsWith("storage.") ? "Storage Security" : "SQL/RLS",
        severity: "INFO", status: "not-run", object: name,
        description: `The expected object ${name} was not present in the inspected catalog.`,
        evidence: "Catalog query returned no matching relation.",
        risk: "Policies and ownership for this expected object cannot be evaluated.",
        recommendation: "Confirm the deployed schema and application object names."
      });
      continue;
    }
    if (!table.rls) {
      add("LIVE-RLS-001", "CRITICAL", name, `Row-level security is disabled on ${name}.`,
        "pg_class.relrowsecurity = false",
        "Exposed API roles may access rows without row-level policy enforcement.",
        "Enable RLS and define operation-specific policies before exposing this relation.");
    }
    const policies = (snapshot.policies || []).filter(policy => policy.table === name);
    if (table.rls && !policies.length) {
      add("LIVE-RLS-002", "INFO", name, `RLS is enabled on ${name}, but no policy is present.`,
        "pg_policies returned no matching rows.",
        "Ordinary roles are generally denied by RLS; required application access may be unavailable.",
        "Verify the intended access model and deployed policy set.");
    }
    for (const policy of policies) {
      const exposedRole = (policy.roles || []).some(role => ["anon", "authenticated", "public"].includes(String(role).toLowerCase()));
      const writes = ["INSERT", "UPDATE", "DELETE", "ALL"].includes(policy.command);
      if (exposedRole && writes && policy.unconditional) {
        add("LIVE-POLICY-001", "HIGH", name, `Policy ${policy.name} permits an unconditional write.`,
          `${policy.command} policy for API roles has a true USING or WITH CHECK condition.`,
          "Any matching API role may be able to modify rows without an ownership predicate.",
          "Restrict the policy with an ownership predicate and verify both USING and WITH CHECK.");
      } else if (exposedRole && writes && (
        (policy.command === "INSERT" && !policy.ownerCheck)
        || (policy.command === "DELETE" && !policy.ownerUsing)
        || (["UPDATE", "ALL"].includes(policy.command) && (!policy.ownerUsing || !policy.ownerCheck))
      )) {
        add("LIVE-POLICY-002", "HIGH", name, `Policy ${policy.name} has no statically recognizable owner condition.`,
          `${policy.command} policy for API roles lacks a recognizable auth.uid ownership predicate.`,
          "Cross-user writes may be possible; static policy inspection cannot establish exploitability.",
          "Verify the condition protects both the existing row and new row values against auth.uid().",
          "potential");
      } else if (exposedRole && policy.command === "SELECT" && policy.unconditional && name !== "public.listings") {
        add("LIVE-POLICY-003", "HIGH", name, `Policy ${policy.name} permits unconditional reads of private data.`,
          "SELECT policy for API roles has a true condition.",
          "Users may be able to read other users' private records.",
          "Limit reads to conversation participants or the owning user as appropriate.");
      }
    }
  }

  const identity = snapshot.identity || {};
  for (const role of snapshot.roles || []) {
    if (role.bypassRls && ["anon", "authenticated"].includes(role.name)) {
      add("LIVE-RLS-003", "CRITICAL", `role ${role.name}`, `Application role ${role.name} has BYPASSRLS.`,
        "pg_roles.rolbypassrls = true.",
        "This application role can bypass row-level security policies.",
        "Remove BYPASSRLS from anon/authenticated and verify role attributes in the deployed database.");
    }
  }
  if (identity.name === "service_role") {
    add("LIVE-CONNECTION-001", "CRITICAL", "database connection", "The live scanner connected as service_role.",
      "The database identity is service_role; scan results were rejected.",
      "Service-role access bypasses row-level security and is prohibited for this scanner.",
      "Use a dedicated read-only database login instead.");
  }
  for (const fn of snapshot.functions || []) {
    if (!fn.definer) continue;
    const configuredPath = (fn.searchPath || "").match(/(?:^|,)search_path=(.*)$/i)?.[1]?.replaceAll('"', "").trim();
    const safePath = configuredPath !== undefined
      && (configuredPath === "" || configuredPath.split(",").every(schema => !/^(?:public|pg_temp|\$user)$/i.test(schema.trim())));
    if (!safePath) {
      add("LIVE-RPC-001", "HIGH", fn.name, `SECURITY DEFINER function ${fn.name} has no fixed search_path configuration.`,
        "pg_proc.prosecdef = true and no safe search_path was identified.",
        "An unsafe search path can permit object shadowing during privileged execution.",
        "Set a fixed trusted search_path and qualify referenced objects.");
    }
    if ((snapshot.functionGrants || []).some(grant =>
      grant.name === fn.name && ["anon", "public"].includes(String(grant.grantee).toLowerCase())
    )) {
      add("LIVE-RPC-002", "HIGH", fn.name, `SECURITY DEFINER function ${fn.name} is executable by anon or PUBLIC.`,
        "Function ACL grants EXECUTE to anon/PUBLIC.",
        "Anonymous callers may invoke the function with its owner's privileges.",
        "Revoke public execution unless required, grant only to intended roles, and enforce authorization inside the function.",
        "potential");
    }
  }
  for (const grant of snapshot.grants || []) {
    const role = String(grant.grantee).toLowerCase();
    const privilege = String(grant.privilege).toUpperCase();
    if (["anon", "public"].includes(role) && ["INSERT", "UPDATE", "DELETE", "TRUNCATE"].includes(privilege)) {
      add("LIVE-GRANT-001", "HIGH", grant.table, `Role ${role} has ${privilege} privilege on ${grant.table}.`,
        "Observed in information_schema.role_table_grants.",
        "Anonymous access may permit writes outside the intended application surface.",
        "Revoke unneeded privileges and rely on narrowly scoped policies for intended operations.");
    } else if (role === "authenticated" && ["ALL PRIVILEGES", "TRUNCATE"].includes(privilege)) {
      add("LIVE-GRANT-002", "MEDIUM", grant.table, `Role authenticated has broad ${privilege} privilege on ${grant.table}.`,
        "Observed in information_schema.role_table_grants.",
        "Broad privileges increase impact if a policy is missing or permissive.",
        "Grant only required table operations and review RLS for each operation.");
    }
  }
  for (const bucket of snapshot.buckets || []) {
    if (bucket.public && bucket.name === "listing-photos") {
      add("LIVE-STORAGE-001", "MEDIUM", "storage.objects/listing-photos", "The listing-photos bucket is publicly readable.",
        "storage.buckets.public = true",
        "Anyone with a file URL may read uploaded listing photographs.",
        "Confirm public photo access is intentional; otherwise make the bucket private and use scoped signed access.");
    }
    if (bucket.name === "listing-photos" && (!bucket.fileSizeLimit || !bucket.allowedMimeTypes?.length)) {
      add("LIVE-STORAGE-002", "MEDIUM", "storage.objects/listing-photos", "Photo upload size or MIME type restrictions are not configured.",
        `Catalog metadata: size limit ${bucket.fileSizeLimit ? "set" : "not set"}; MIME allow-list ${bucket.allowedMimeTypes?.length ? "set" : "not set"}.`,
        "Unrestricted uploads can increase storage abuse and allow unexpected file formats.",
        "Set a reasonable upload size limit and an allow-list of image MIME types.",
        "potential");
    }
  }
  return findings;
}

function scanLiveDatabase({ env = process.env, timeout = 60000 } = {}) {
  const connectionString = env.SUPABASE_READONLY_DATABASE_URL;
  if (!connectionString) {
    return { status: "NOT_RUN", findings: [], reason: "SUPABASE_READONLY_DATABASE_URL is not configured." };
  }
  if (!/^postgres(?:ql)?:\/\//i.test(connectionString) || /(?:^|\/)service_role(?:[:@/]|$)/i.test(connectionString)) {
    return { status: "NOT_RUN", findings: [], reason: "The configured database URL is invalid or uses the prohibited service_role identity." };
  }
  const result = spawnSync("psql", [
    "--no-psqlrc", "--quiet", "--tuples-only", "--no-align", "--set=ON_ERROR_STOP=1",
    "--dbname", connectionString, "--command", READ_ONLY_QUERY
  ], { encoding: "utf8", timeout, maxBuffer: 8 * 1024 * 1024 });
  if (result.error || result.status !== 0) {
    return { status: "NOT_RUN", findings: [], reason: "Read-only catalog inspection failed; connection details and command output were withheld." };
  }
  let snapshot;
  try { snapshot = JSON.parse(result.stdout.trim()); } catch {
    return { status: "NOT_RUN", findings: [], reason: "The read-only catalog query returned an invalid response; output was withheld." };
  }
  const findings = inspectSnapshot(snapshot);
  if (snapshot.identity?.name === "service_role") {
    return {
      status: "NOT_RUN",
      findings,
      reason: "Connection identity was service_role; live inspection was rejected."
    };
  }
  return { status: "PASS", findings, reason: "Catalog-only query completed inside a read-only transaction; no application rows were read." };
}

module.exports = { READ_ONLY_QUERY, inspectSnapshot, scanLiveDatabase };
