"use strict";

const { createHash } = require("node:crypto");
const { validateConfiguration } = require("../production-readiness.cjs");

const CONFIRMATION = "AUDIT SUPABASE PRODUCTION READ ONLY";
const MAX_ROWS = 10000;
const SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
const USER_SCHEMA = "n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'";
const QUERIES = Object.freeze({
  identity: `
    SELECT current_user AS role, session_user AS session_role, current_database() AS database,
      current_setting('transaction_read_only') AS read_only,
      r.rolsuper, r.rolbypassrls, r.rolcreaterole, r.rolcreatedb, r.rolreplication,
      EXISTS (SELECT 1 FROM pg_catalog.pg_roles other
        WHERE other.oid <> r.oid AND pg_catalog.pg_has_role(r.oid, other.oid, 'MEMBER')) AS memberships,
      (EXISTS (SELECT 1 FROM pg_catalog.pg_namespace n WHERE ${USER_SCHEMA}
          AND (n.nspowner = r.oid OR pg_catalog.has_schema_privilege(r.oid, n.oid, 'CREATE')))
       OR EXISTS (SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
          WHERE ${USER_SCHEMA} AND c.relkind IN ('r','p','v','m','f')
          AND (c.relowner = r.oid OR pg_catalog.has_table_privilege(r.oid, c.oid, 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
            OR pg_catalog.has_any_column_privilege(r.oid, c.oid, 'INSERT,UPDATE,REFERENCES')))
       OR EXISTS (SELECT 1 FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
          WHERE ${USER_SCHEMA} AND (p.proowner = r.oid
            OR (p.prosecdef AND pg_catalog.has_function_privilege(r.oid, p.oid, 'EXECUTE'))))
       OR EXISTS (SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
          WHERE ${USER_SCHEMA} AND c.relkind = 'S'
            AND pg_catalog.has_sequence_privilege(r.oid, c.oid, 'USAGE,UPDATE'))) AS unsafe_privileges
    FROM pg_catalog.pg_roles r WHERE r.rolname = current_user`,
  tables: `
    SELECT n.nspname AS schema, c.relname AS name, c.relrowsecurity AS rls,
      c.relforcerowsecurity AS force_rls, pg_catalog.pg_get_userbyid(c.relowner) AS owner
    FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE ${USER_SCHEMA} AND c.relkind IN ('r','p') ORDER BY n.nspname, c.relname LIMIT 10001`,
  policies: `
    SELECT schemaname AS schema, tablename AS name, policyname AS policy,
      permissive, roles, cmd, qual AS using_expression, with_check AS check_expression
    FROM pg_catalog.pg_policies ORDER BY schemaname, tablename, policyname LIMIT 10001`,
  roles: `
    SELECT rolname AS name, rolsuper, rolbypassrls, rolcreaterole, rolcreatedb, rolreplication
    FROM pg_catalog.pg_roles ORDER BY rolname LIMIT 10001`,
  grants: `
    SELECT n.nspname AS schema, c.relname AS name, r.rolname AS role,
      pg_catalog.has_table_privilege(r.oid, c.oid, 'SELECT') AS can_select,
      pg_catalog.has_table_privilege(r.oid, c.oid, 'INSERT') AS can_insert,
      pg_catalog.has_table_privilege(r.oid, c.oid, 'UPDATE') AS can_update,
      pg_catalog.has_table_privilege(r.oid, c.oid, 'DELETE') AS can_delete,
      pg_catalog.has_table_privilege(r.oid, c.oid, 'TRUNCATE') AS can_truncate,
      pg_catalog.has_any_column_privilege(r.oid, c.oid, 'SELECT') AS column_select,
      pg_catalog.has_any_column_privilege(r.oid, c.oid, 'INSERT') AS column_insert,
      pg_catalog.has_any_column_privilege(r.oid, c.oid, 'UPDATE') AS column_update,
      c.relacl::text AS acl
    FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    CROSS JOIN pg_catalog.pg_roles r
    WHERE ${USER_SCHEMA} AND c.relkind IN ('r','p','v','m','f')
      AND r.rolname IN ('anon','authenticated')
    ORDER BY n.nspname, c.relname, r.rolname LIMIT 10001`,
  schemas: `
    SELECT n.nspname AS schema, r.rolname AS role, n.nspacl::text AS acl,
      pg_catalog.has_schema_privilege(r.oid, n.oid, 'USAGE') AS can_use,
      pg_catalog.has_schema_privilege(r.oid, n.oid, 'CREATE') AS can_create
    FROM pg_catalog.pg_namespace n CROSS JOIN pg_catalog.pg_roles r
    WHERE ${USER_SCHEMA} AND r.rolname IN ('anon','authenticated')
    ORDER BY n.nspname, r.rolname LIMIT 10001`,
  functions: `
    SELECT n.nspname AS schema, p.proname AS name,
      pg_catalog.pg_get_function_identity_arguments(p.oid) AS arguments,
      p.prosecdef AS definer, p.proconfig AS config, p.proacl::text AS acl,
      EXISTS (SELECT 1 FROM pg_catalog.pg_roles r WHERE r.rolname = 'anon'
        AND pg_catalog.has_function_privilege(r.oid, p.oid, 'EXECUTE')) AS anon_execute,
      EXISTS (SELECT 1 FROM pg_catalog.aclexplode(COALESCE(p.proacl, pg_catalog.acldefault('f', p.proowner))) a
        WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE') AS public_execute
    FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE ${USER_SCHEMA} AND p.prokind IN ('f','p')
    ORDER BY n.nspname, p.proname, p.oid LIMIT 10001`,
  buckets: `
    SELECT id, name, public, file_size_limit, allowed_mime_types
    FROM storage.buckets ORDER BY id LIMIT 10001`
});

function connectionOptions(config) {
  const target = validateConfiguration(config);
  const url = new URL(config.SUPABASE_READONLY_DATABASE_URL.trim());
  return {
    target,
    options: {
      host: url.hostname, port: url.port ? Number(url.port) : 5432,
      database: target.database, user: "sherlock_audit", password: decodeURIComponent(url.password),
      ssl: { rejectUnauthorized: true, servername: target.host },
      connectionTimeoutMillis: 5000, query_timeout: 6000,
      application_name: "sherlock-production-audit",
      options: "-c default_transaction_read_only=on -c search_path=pg_catalog -c statement_timeout=5000 -c lock_timeout=2000 -c idle_in_transaction_session_timeout=10000"
    }
  };
}

function safeError(error) {
  const codes = {
    "42501": "permission_denied", "42P01": "metadata_missing", "42703": "metadata_incompatible",
    "57014": "query_timeout", "28P01": "authentication_failed",
    ECONNREFUSED: "connection_refused", ETIMEDOUT: "connection_timeout",
    ENOTFOUND: "host_unreachable", DEPTH_ZERO_SELF_SIGNED_CERT: "tls_verification_failed",
    UNABLE_TO_VERIFY_LEAF_SIGNATURE: "tls_verification_failed"
  };
  return codes[error?.code] || "database_operation_failed";
}

function evaluateMetadata(metadata, target) {
  const findings = [];
  function add(rule, severity, object, description, evidence) {
    const hash = createHash("sha1").update(`${rule}:${object}:${description}`).digest("hex").slice(0, 8);
    findings.push({
      id: `${rule}-${hash}`, severity, object, description, evidence,
      risk: "Deployed metadata indicates a security risk; exploitability requires separate authorization review.",
      recommendation: "Review and remediate through the normal change process; this auditor never changes database state.",
      status: "potential"
    });
  }
  const relation = row => `${JSON.stringify(row.schema)}.${JSON.stringify(row.name)}`;
  for (const row of metadata.tables || []) {
    if (row.schema === "public" && !row.rls) {
      add("RLS-001", "HIGH", relation(row), "Exposed public table has RLS disabled.", "pg_class.relrowsecurity=false");
    } else if (row.schema === "public" && row.rls && metadata.policies
      && !metadata.policies.some(policy => policy.schema === row.schema && policy.name === row.name)) {
      add("RLS-002", "INFO", relation(row), "RLS is enabled but no deployed policies were found.", "pg_class / pg_policies");
    }
  }
  for (const row of metadata.roles || []) {
    if (row.rolbypassrls || row.rolsuper) {
      add("RLS-003", ["anon", "authenticated"].includes(row.name) ? "CRITICAL" : "HIGH",
        `role ${JSON.stringify(row.name)}`, "Role can bypass RLS.", "pg_roles: superuser or BYPASSRLS");
    }
  }
  for (const row of metadata.grants || []) {
    if (row.role === "anon" && (row.can_insert || row.can_update || row.can_delete || row.can_truncate
      || row.column_insert || row.column_update || (["auth", "storage", "vault", "extensions"].includes(row.schema)
        && (row.can_select || row.column_select)))) {
      add("GRANT-001", row.can_truncate ? "HIGH" : "MEDIUM", `${relation(row)} / anon`,
        "Anonymous role has effective write or internal-table privileges.",
        `pg_catalog privilege checks: truncate=${row.can_truncate}, insert=${row.can_insert || row.column_insert}, update=${row.can_update || row.column_update}, delete=${row.can_delete}`);
    } else if (row.role === "authenticated" && row.can_truncate) {
      add("GRANT-002", "MEDIUM", `${relation(row)} / authenticated`,
        "Authenticated role has effective TRUNCATE privilege.", "has_table_privilege: TRUNCATE=true");
    }
  }
  for (const row of metadata.schemas || []) {
    if (row.role === "anon" && (row.can_create || (row.can_use && ["auth", "storage", "vault", "extensions"].includes(row.schema)))) {
      add("GRANT-005", row.can_create ? "HIGH" : "MEDIUM", `schema ${JSON.stringify(row.schema)}`,
        "Anonymous role has schema CREATE or internal-schema USAGE.", "pg_catalog.has_schema_privilege");
    }
  }
  for (const row of metadata.functions || []) {
    if (!row.definer) continue;
    const object = `${relation(row)}(${row.arguments})`;
    const setting = (row.config || []).find(value => value.startsWith("search_path="));
    if (setting === undefined) {
      add("RPC-001", "HIGH", object, "SECURITY DEFINER function has no fixed search_path.", "pg_proc.proconfig: search_path absent");
    } else if (/(?:^|[,\s"])(?:public|pg_temp|\$user)(?:$|[,\s"])/i.test(setting.slice("search_path=".length))) {
      add("RPC-003", "HIGH", object, "SECURITY DEFINER search_path contains a potentially writable schema.", "pg_proc.proconfig: unsafe search_path");
    }
    if (row.anon_execute || row.public_execute) {
      add("RPC-004", "HIGH", object, "SECURITY DEFINER function is executable by anon or PUBLIC.",
        "pg_catalog.has_function_privilege / effective PUBLIC ACL");
    }
  }
  for (const row of metadata.policies || []) {
    const object = `${relation(row)} / policy ${JSON.stringify(row.policy)}`;
    const using = row.using_expression;
    const check = row.check_expression ?? (["UPDATE", "ALL"].includes(row.cmd) ? using : undefined);
    const expressions = [row.using_expression, row.check_expression].filter(value => typeof value === "string");
    if (expressions.some(value => /^\s*\(*\s*true\s*\)*\s*$/i.test(value))) {
      const anonymousWrite = row.roles.some(role => ["anon", "public"].includes(role))
        && ["INSERT", "UPDATE", "ALL"].includes(row.cmd);
      add("POLICY-001", anonymousWrite ? "HIGH" : "MEDIUM", object,
        "RLS policy contains an unconditional expression.", "pg_policies: unconditional USING or WITH CHECK");
    }
    if (expressions.some(value => /\bOR\s+\(*\s*true\s*\)*(?:\s*(?:$|\bOR\b))|\btrue\s*\)*\s+OR\b/i.test(value))) {
      add("POLICY-004", row.roles.some(role => ["anon", "authenticated", "public"].includes(role)) ? "HIGH" : "MEDIUM",
        object, "RLS policy contains an unconditional OR branch.", "pg_policies: OR true");
    }
    const highRisk = row.schema === "public"
      && ["conversations", "conversation_reads", "favorites", "listings", "messages"].includes(row.name)
      || row.schema === "storage" && row.name === "objects";
    const ownerRestricted = expression => typeof expression === "string" && !/\bOR\b/i.test(expression)
      && /auth\.uid\s*\(\s*\)/i.test(expression)
      && (row.schema === "storage"
        ? /\bowner(?:_id)?\b|storage\.foldername\s*\(/i.test(expression)
        : /auth\.uid\s*\(\s*\)\s*(?:=|IS NOT DISTINCT FROM)\s*\(?\s*(?:[\w"]+\s*\.\s*)?"?(?:user_id|owner_id|created_by)\b|\b(?:user_id|owner_id|created_by)"?\s*(?:=|IS NOT DISTINCT FROM)\s*\(?\s*auth\.uid\s*\(\s*\)/i.test(expression));
    if (highRisk && ["INSERT", "UPDATE", "DELETE", "ALL"].includes(row.cmd)
      && row.roles.some(role => ["anon", "authenticated", "public"].includes(role))) {
      const ownerUsing = ownerRestricted(using);
      const ownerCheck = ownerRestricted(check);
      const protectedWrite = row.cmd === "INSERT" ? ownerCheck : row.cmd === "DELETE" ? ownerUsing : ownerUsing && ownerCheck;
      if (!protectedWrite) add("POLICY-002", ["UPDATE", "ALL"].includes(row.cmd) && !ownerCheck ? "HIGH" : "MEDIUM",
        object, "Write policy lacks a statically identifiable owner restriction in the required clauses.",
        "pg_policies: independent USING / WITH CHECK inspection with PostgreSQL fallback");
    }
  }
  const policyGroups = new Map();
  for (const row of metadata.policies || []) {
    if (row.permissive !== "PERMISSIVE") continue;
    const key = JSON.stringify([row.schema, row.name, row.cmd, [...row.roles].sort()]);
    policyGroups.set(key, [...(policyGroups.get(key) || []), row]);
  }
  for (const group of policyGroups.values()) {
    if (group.length > 1) add("POLICY-003", "LOW", relation(group[0]),
      "Multiple permissive policies target the same operation and roles.", "pg_policies: permissive policies combine with OR");
  }
  for (const row of metadata.buckets || []) {
    if (row.public) add("STORAGE-LIVE-001", "MEDIUM", `bucket ${JSON.stringify(row.id)}`,
      "Storage bucket permits public downloads.", "storage.buckets.public=true");
  }
  const missingBuckets = metadata.buckets ? target.buckets.filter(id => !metadata.buckets.some(row => row.id === id)) : [];
  const missingRoles = metadata.roles ? ["anon", "authenticated"].filter(name => !metadata.roles.some(row => row.name === name)) : [];
  const storagePolicies = metadata.policies?.filter(row => row.schema === "storage" && row.name === "objects");
  if (storagePolicies?.length === 0) add("STORAGE-001", "INFO", "storage.objects",
    "No deployed Storage policies were found.", "pg_policies: no policies for storage.objects");
  findings.sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity) || a.id.localeCompare(b.id));
  return { findings, missingBuckets, missingRoles };
}

async function auditProduction({ config = process.env, confirmation, clientFactory } = {}) {
  const coverage = Object.fromEntries(["connection", "identity", ...Object.keys(QUERIES).filter(key => key !== "identity")].map(key => [key, "NOT_RUN"]));
  const errors = [];
  const metadata = {};
  let target;
  let client;
  let transaction = false;
  let verified = false;
  if (confirmation !== CONFIRMATION) {
    errors.push({ component: "authorization", reason: "explicit_confirmation_required" });
  } else {
    try {
      const connection = connectionOptions(config);
      target = connection.target;
      const factory = clientFactory || (options => new (require("pg").Client)(options));
      client = factory(connection.options);
      client.on("error", () => {
        errors.push({ component: "connection", reason: "database_connection_lost" });
      });
      await client.connect();
      coverage.connection = "CHECKED";
      await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
      transaction = true;
      const { rows } = await client.query(QUERIES.identity);
      const identity = rows[0];
      if (rows.length !== 1 || !identity || identity.role !== "sherlock_audit"
        || identity.session_role !== "sherlock_audit" || identity.database !== target.database
        || identity.read_only !== "on" || ["rolsuper", "rolbypassrls", "rolcreaterole", "rolcreatedb", "rolreplication", "memberships", "unsafe_privileges"]
          .some(key => identity[key] !== false)) {
        errors.push({ component: "identity", reason: "audit_role_or_readonly_guard_failed" });
      } else {
        coverage.identity = "CHECKED";
        for (const [component, sql] of Object.entries(QUERIES)) {
          if (component === "identity") continue;
          await client.query("SAVEPOINT sherlock_metadata");
          try {
            const result = await client.query(sql);
            metadata[component] = result.rows.slice(0, MAX_ROWS);
            coverage[component] = result.rows.length > MAX_ROWS ? "PARTIAL" : "CHECKED";
            if (coverage[component] === "PARTIAL") errors.push({ component, reason: "metadata_row_limit" });
          } catch (error) {
            errors.push({ component, reason: safeError(error) });
            await client.query("ROLLBACK TO SAVEPOINT sherlock_metadata");
          }
          await client.query("RELEASE SAVEPOINT sherlock_metadata");
        }
        verified = true;
      }
    } catch (error) {
      errors.push({ component: !target ? "configuration" : !transaction ? "connection" : "metadata", reason: !target ? "invalid_production_configuration" : safeError(error) });
    } finally {
      if (client) {
        if (transaction) {
          try { await client.query("ROLLBACK"); }
          catch (error) { errors.push({ component: "transaction", reason: safeError(error) }); }
        }
        try { await client.end(); }
        catch (error) { errors.push({ component: "connection_close", reason: safeError(error) }); }
      }
    }
  }
  const evaluated = evaluateMetadata(metadata, target || { buckets: [] });
  for (const bucket of evaluated.missingBuckets) errors.push({ component: "buckets", reason: "expected_bucket_missing", object: bucket });
  for (const role of evaluated.missingRoles) errors.push({ component: "roles", reason: "expected_role_missing", object: role });
  if (metadata.tables && !metadata.tables.some(row => row.schema === "storage" && row.name === "objects")) {
    errors.push({ component: "policies", reason: "storage_objects_metadata_missing" });
  }
  if (metadata.tables?.some(row => row.schema === "storage" && row.name === "buckets" && row.rls)) {
    errors.push({ component: "buckets", reason: "bucket_rls_prevents_proving_full_visibility" });
  }
  const complete = verified && errors.length === 0 && Object.values(coverage).every(value => value === "CHECKED");
  const blocked = evaluated.findings.some(finding => ["HIGH", "CRITICAL"].includes(finding.severity));
  return {
    generatedAt: new Date().toISOString(), mode: "production-metadata", result: blocked ? "FAIL" : complete ? "PASS" : "INCOMPLETE",
    assessment: "Live PostgreSQL and Storage metadata only; no application data, RPC, file downloads, Auth API or runtime access tests.",
    target: target ? { host: target.host, database: target.database, buckets: target.buckets } : undefined,
    coverage, errors, counts: Object.fromEntries(SEVERITIES.map(severity => [severity, evaluated.findings.filter(row => row.severity === severity).length])),
    findings: evaluated.findings,
    metadataCounts: Object.fromEntries(Object.entries(metadata).map(([key, rows]) => [key, rows.length]))
  };
}

module.exports = { auditProduction, connectionOptions, evaluateMetadata, QUERIES, CONFIRMATION };
