"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { READ_ONLY_QUERY, inspectSnapshot, scanLiveDatabase } = require("../scanners/supabase-live.cjs");
const { getExitCode, run: runCli } = require("../cli.cjs");

const URL = "postgresql://catalog_audit:p%40ss%3Aword@db.example.test:5432/postgres?sslmode=verify-full";
const env = { SUPABASE_READONLY_DATABASE_URL: URL, SUPABASE_AUDIT_ENVIRONMENT: "test" };
const TABLE_PRIVILEGES = ["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER"];

function snapshot() {
  const tables = ["public.listings", "public.messages", "public.conversations", "public.favorites", "storage.objects", "storage.buckets"]
    .map((name, i) => ({ name, oid: 100 + i, rls: true, forceRls: false, owner: "schema_owner" }));
  const roles = ["anon", "authenticated"].map(name => ({
    name, superuser: false, bypassRls: false, inherit: true, createRole: false, createDb: false, replication: false
  }));
  return {
    version: 2,
    identity: {
      name: "catalog_audit", sessionUser: "catalog_audit", auditSafe: true,
      superuser: false, bypassRls: false, createRole: false, createDb: false, replication: false
    },
    roles, memberships: [], tables, policies: [], grants: [], columnGrants: [], sequenceGrants: [], sequences: [],
    schemaGrants: [], defaultGrants: [], functions: [], functionGrants: [], storageBuckets: [{
      id: "listing-photos", name: "listing-photos", public: false,
      fileSizeLimit: 10485760, allowedMimeTypes: ["image/jpeg", "image/png"]
    }],
    effectiveTablePrivileges: roles.flatMap(role => tables.flatMap(table => TABLE_PRIVILEGES.map(privilege => ({
      role: role.name, table: table.name, privilege, allowed: false, columnAllowed: false, owner: false
    })))),
    effectiveFunctionPrivileges: [],
    effectiveSequencePrivileges: [],
    effectiveSchemaPrivileges: roles.flatMap(role => ["public", "storage"].map(schema => ({
      role: role.name, schema, usage: true, create: false
    })))
  };
}

function run(value = snapshot(), options = {}) {
  return scanLiveDatabase({
    env, commandRunner: () => ({ status: 0, stdout: JSON.stringify(value) }), ...options
  });
}

function addFunction(value, name, overrides = {}) {
  value.functions.push({ name, oid: 1000 + value.functions.length, definer: true, owner: "owner", config: ["search_path="], ...overrides });
  for (const role of ["anon", "authenticated"]) value.effectiveFunctionPrivileges.push({ role, name, allowed: false });
}

test("live hardening: absent URL never invokes a process", () => {
  let calls = 0;
  const result = scanLiveDatabase({ env: {}, commandRunner: () => { calls++; } });
  assert.equal(result.status, "NOT_RUN");
  assert.equal(calls, 0);
});

test("live hardening: environment declaration is mandatory", () => {
  for (const environment of [undefined, "", "Production", "prod"]) {
    let calls = 0;
    const result = run(snapshot(), {
      env: { ...env, SUPABASE_AUDIT_ENVIRONMENT: environment }, commandRunner: () => { calls++; }
    });
    assert.equal(result.status, "NOT_RUN");
    assert.equal(calls, 0);
    assert.match(result.reason, /explicitly declared/);
  }
});

test("live hardening: Production requires exact endpoint, database, identity, inventory and typed confirmation", () => {
  const productionEnv = {
    SUPABASE_READONLY_DATABASE_URL: "postgresql://sherlock_audit:p%40ss%3Aword@prod.example.test:5432/postgres?sslmode=verify-full",
    SUPABASE_AUDIT_ENVIRONMENT: "production",
    SUPABASE_EXPECTED_PRODUCTION_HOST: "prod.example.test",
    SUPABASE_EXPECTED_PRODUCTION_DATABASE: "postgres",
    SUPABASE_EXPECTED_PRODUCTION_BUCKETS: "listing-photos",
    SUPABASE_PRODUCTION_TARGET_CONFIRMATION: "PRODUCTION prod.example.test/postgres"
  };
  for (const patch of [
    { SUPABASE_PRODUCTION_TARGET_CONFIRMATION: "PRODUCTION wrong.example.test/postgres" },
    { SUPABASE_EXPECTED_PRODUCTION_HOST: "wrong.example.test" },
    { SUPABASE_EXPECTED_PRODUCTION_DATABASE: "other" },
    { SUPABASE_EXPECTED_PRODUCTION_BUCKETS: "" },
    { SUPABASE_READONLY_DATABASE_URL: productionEnv.SUPABASE_READONLY_DATABASE_URL.replace("sherlock_audit", "service_role") },
    { SUPABASE_READONLY_DATABASE_URL: productionEnv.SUPABASE_READONLY_DATABASE_URL.replace("sslmode=verify-full", "sslmode=disable") }
  ]) {
    let calls = 0;
    const result = run(snapshot(), {
      env: { ...productionEnv, ...patch },
      commandRunner: () => { calls++; }
    });
    assert.equal(result.status, "NOT_RUN");
    assert.equal(calls, 0);
    assert.doesNotMatch(JSON.stringify(result), /p%40ss|wrong\.example/);
  }
});

test("live hardening: unsafe URL schemes, credentials and connection overrides never run", () => {
  const urls = [
    "https://catalog_audit:secret@db.example.test/postgres",
    "postgresql://service_role:secret@db.example.test/postgres",
    "postgresql://%73ervice_role:secret@db.example.test/postgres",
    "postgresql://postgres:secret@db.example.test/postgres",
    "postgresql://postgres.project:secret@db.example.test/postgres",
    "postgresql://supabase_admin:secret@db.example.test/postgres",
    "postgresql://anon:secret@db.example.test/postgres",
    "postgresql://authenticated:secret@db.example.test/postgres",
    "postgresql://catalog_audit:secret@db.example.test/postgres?options=-c%20role=postgres",
    "postgresql://catalog_audit:secret@db.example.test/postgres?service=production",
    "postgresql://catalog_audit:secret@db.example.test/postgres?host=production",
    "postgresql://catalog_audit:secret@db.example.test/postgres?password=other",
    "postgresql://catalog_audit:secret@db.example.test/postgres?sslmode=require",
    "postgresql://catalog_audit:secret@db.example.test/postgres?sslmode=verify-ca",
    "postgresql://catalog_audit:secret@db.example.test/postgres?sslmode=disable",
    "postgresql://catalog_audit:secret@db.example.test/postgres?sslmode=verify-full&sslmode=disable",
    "postgresql://catalog_audit:secret@db.example.test/postgres?SSLMODE=verify-full",
    "postgresql://catalog_audit:secret@db.example.test/postgres#fragment",
    "postgresql://catalog_audit:secret@db.example.test/",
    "postgresql://catalog_audit:secret@db.example.test/postgres%3Fhost=production",
    "postgresql://catalog_audit:secret@db.example.test,evil.test/postgres",
    "postgresql://catalog_audit:secret@%2Frun%2Fpostgresql/postgres",
    "postgresql://catalog_audit:secret@db.example.test:0/postgres",
    "postgresql://catalog_audit:secret@db.example.test:70000/postgres",
    "postgresql://catalog_audit:secret%00@db.example.test/postgres",
    "postgresql://catalog_audit:secret%0A@db.example.test/postgres",
    "postgresql://catalog_audit:secret%@db.example.test/postgres",
    "not-a-url"
  ];
  for (const url of urls) {
    let calls = 0;
    const result = run(snapshot(), {
      env: { ...env, SUPABASE_READONLY_DATABASE_URL: url }, commandRunner: () => { calls++; }
    });
    assert.equal(result.status, "NOT_RUN", url);
    assert.equal(calls, 0, url);
    assert.doesNotMatch(JSON.stringify(result), /secret|evil\.test|db\.example\.test/);
  }
});

test("live hardening: password/URL never enter argv or SQL, PG and PSQL environment is scrubbed", () => {
  let calls = 0;
  const result = run(snapshot(), {
    env: {
      ...env, PATH: "/usr/bin", PGHOST: "production", PGUSER: "postgres", PGDATABASE: "production",
      PGPASSWORD: "inherited", PGOPTIONS: "-c role=postgres", PGSERVICE: "production",
      PGSERVICEFILE: "evil", PGPASSFILE: "evil", PGSSLROOTCERT: "evil", PGTARGETSESSIONATTRS: "read-write",
      PSQLRC: "evil", PSQL_ECHO: "all", PSQL_HISTORY: "evil", SUPABASE_SERVICE_ROLE_KEY: "dummy"
    },
    commandRunner(command, args, options) {
      calls++;
      assert.equal(command, "psql");
      assert.deepEqual(args, ["-X", "-w", "-q", "-t", "-A", "--set=ON_ERROR_STOP=1"]);
      assert.equal(options.input, READ_ONLY_QUERY);
      assert.equal(options.env.PGPASSWORD, "p@ss:word");
      assert.equal(options.env.PGUSER, "catalog_audit");
      assert.equal(options.env.PGHOST, "db.example.test");
      assert.equal(options.env.PGDATABASE, "postgres");
      assert.equal(options.env.PGSSLMODE, "verify-full");
      assert.equal(options.env.PGPASSFILE, "/dev/null");
      assert.equal(options.env.PGSERVICEFILE, "/dev/null");
      assert.equal(options.env.PGSYSCONFDIR, "/dev/null");
      assert.equal(options.env.PGCONNECT_TIMEOUT, "10");
      assert.match(options.env.PGOPTIONS, /default_transaction_read_only=on/);
      for (const key of ["PGSERVICE", "PGSSLROOTCERT", "PGTARGETSESSIONATTRS", "PSQLRC", "PSQL_ECHO", "PSQL_HISTORY",
        "SUPABASE_READONLY_DATABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) assert.equal(options.env[key], undefined);
      assert.equal(options.env.PATH, "/usr/bin");
      assert.doesNotMatch(JSON.stringify(args) + options.input, /p@ss|p%40ss|postgresql:\/\//);
      return { status: 0, stdout: JSON.stringify(snapshot()) };
    }
  });
  assert.equal(calls, 1);
  assert.equal(result.status, "PASS");
  assert.equal(result.coverage.livePostgres, "PASS");
  assert.equal(result.coverage.liveStorage, "PASS");
});

test("live hardening: TLS defaults to verify-full and only literal loopback can disable it", () => {
  for (const host of ["localhost", "127.0.0.1", "[::1]", "db.example.test"]) {
    let calls = 0;
    const suffix = host === "db.example.test" ? "" : "?sslmode=disable";
    run(snapshot(), {
      env: { ...env, SUPABASE_READONLY_DATABASE_URL: `postgres://catalog_audit:password@${host}/postgres${suffix}` },
      commandRunner(command, args, options) {
        calls++;
        assert.equal(options.env.PGSSLMODE, suffix ? "disable" : "verify-full");
        return { status: 0, stdout: JSON.stringify(snapshot()) };
      }
    });
    assert.equal(calls, 1, host);
  }
});

test("live hardening: catalog snapshot is gated inside the same read-only session", () => {
  assert.match(READ_ONLY_QUERY, /^BEGIN READ ONLY;/);
  const guard = READ_ONLY_QUERY.indexOf("\\if :audit_safe");
  const catalog = READ_ONLY_QUERY.indexOf("SELECT json_build_object(");
  assert.ok(guard > 0 && catalog > guard);
  const preflight = READ_ONLY_QUERY.slice(0, guard);
  for (const pattern of [
    /current_user = session_user/, /rolsuper/, /rolbypassrls/, /rolcreaterole/, /rolcreatedb/, /rolreplication/,
    /pg_auth_members/, /pg_shdepend/, /has_database_privilege/, /has_schema_privilege/,
    /has_table_privilege/, /has_any_column_privilege/, /has_sequence_privilege/,
    /p\.prosecdef/, /has_function_privilege/, /has_database_privilege\(r\.oid, current_database\(\), 'CREATE'\)/,
    /has_database_privilege\(r\.oid, current_database\(\), 'TEMP'\)/,
    /NOT \(n\.nspname = 'storage' AND c\.relname = 'buckets'\)/,
    /has_table_privilege\(r\.oid, c\.oid, 'SELECT'\)/,
    /has_any_column_privilege\(r\.oid, c\.oid, 'SELECT'\)/,
    /SET LOCAL statement_timeout/, /SET LOCAL lock_timeout/, /SET LOCAL search_path = pg_catalog/
  ]) assert.match(preflight, pattern);
  assert.equal((READ_ONLY_QUERY.match(/BEGIN READ ONLY/g) || []).length, 1);
  assert.match(READ_ONLY_QUERY, /\\else\n\\echo AUDIT_IDENTITY_REJECTED\n\\endif\nROLLBACK;/);
  assert.match(READ_ONLY_QUERY, /FROM storage\.buckets b/);
  assert.match(READ_ONLY_QUERY, /has_column_privilege\(current_user, c\.oid, a\.attname, 'SELECT'\)/);
  assert.doesNotMatch(READ_ONLY_QUERY, /\b(?:FROM|JOIN)\s+(?:public|storage)\.(?!buckets\b)/i);
  assert.doesNotMatch(READ_ONLY_QUERY, /SELECT\s+\*\s+FROM\s+storage\.buckets/i);
  assert.doesNotMatch(READ_ONLY_QUERY, /^\s*(?:INSERT|UPDATE|DELETE|TRUNCATE|ALTER|DROP|CREATE|GRANT|REVOKE|CALL|DO|COPY)\b/im);
  assert.doesNotMatch(READ_ONLY_QUERY, /\\(?:connect|c |!|include|i |o |copy)/i);
  assert.doesNotMatch(READ_ONLY_QUERY, /\b(?:CALL|DO)\b/i);
  assert.match(READ_ONLY_QUERY, /pg_get_function_identity_arguments/);
  assert.match(READ_ONLY_QUERY, /aclexplode/);
  assert.match(READ_ONLY_QUERY, /pg_has_role/);
});

test("live hardening: rejected preflight is NOT_RUN with dedicated-role remediation", () => {
  const result = run(snapshot(), { commandRunner: () => ({ status: 0, stdout: "AUDIT_IDENTITY_REJECTED\n" }) });
  assert.equal(result.status, "NOT_RUN");
  assert.deepEqual(result.findings, []);
  assert.match(result.reason, /PUBLIC TEMP/);
  assert.match(result.reason, /SECURITY DEFINER/);
});

test("live hardening: exceptions, command output, credentials and malformed JSON are withheld", () => {
  for (const commandRunner of [
    () => { throw new Error(URL); },
    () => ({ status: 1, stdout: URL, stderr: URL }),
    () => ({ status: 0, stdout: URL }),
    () => ({ status: 0, stdout: JSON.stringify(snapshot()) + "\n" + URL }),
    () => ({ status: null, error: new Error(URL), stdout: URL }),
    () => ({ status: 0, stdout: null }),
    () => undefined
  ]) {
    const result = run(snapshot(), { commandRunner });
    assert.equal(result.status, "NOT_RUN");
    assert.deepEqual(result.findings, []);
    assert.doesNotMatch(JSON.stringify(result), /db\.example|p%40ss|postgresql:\/\//);
  }
});

test("live hardening: malformed or incomplete snapshots cannot produce a pass", () => {
  const malformed = [null, [], {}, true, "data", { ...snapshot(), identity: null }, { ...snapshot(), version: 0 }];
  for (const key of [
    "roles", "memberships", "tables", "policies", "grants", "columnGrants", "sequenceGrants",
    "sequences", "schemaGrants", "defaultGrants", "functions", "functionGrants",
    "effectiveTablePrivileges", "effectiveFunctionPrivileges", "effectiveSchemaPrivileges",
    "effectiveSequencePrivileges", "storageBuckets"
  ]) {
    const value = snapshot();
    delete value[key];
    malformed.push(value, { ...snapshot(), [key]: null }, { ...snapshot(), [key]: [null] });
  }
  const partial = snapshot();
  partial.effectiveTablePrivileges.pop();
  malformed.push(partial);
  const duplicate = snapshot();
  duplicate.tables.push({ ...duplicate.tables[0] });
  malformed.push(duplicate);
  const badType = snapshot();
  badType.tables[0].rls = "false";
  malformed.push(badType);
  const foreignTable = snapshot();
  foreignTable.grants.push({ grantee: "PUBLIC", table: "public.invented", privilege: "SELECT" });
  malformed.push(foreignTable);
  const missingSchema = snapshot();
  missingSchema.effectiveSchemaPrivileges = [];
  malformed.push(missingSchema);
  for (const value of malformed) {
    assert.equal(run(value).status, "NOT_RUN");
    assert.deepEqual(run(value).coverage, { livePostgres: "NOT_RUN", liveStorage: "NOT_RUN" });
    assert.ok(inspectSnapshot(value).every(finding => finding.status === "not-run"));
  }
});

test("live hardening: privileged or unverified identities are rejected even in successful snapshots", () => {
  for (const patch of [
    { name: "postgres", sessionUser: "postgres" },
    { name: "service_role", sessionUser: "service_role" },
    { name: "supabase_admin", sessionUser: "supabase_admin" },
    { superuser: true }, { bypassRls: true }, { createRole: true }, { createDb: true }, { replication: true },
    { auditSafe: false }, { auditSafe: undefined }, { sessionUser: "different_user" }, { bypassRls: undefined }
  ]) {
    const value = snapshot();
    Object.assign(value.identity, patch);
    const result = run(value);
    assert.equal(result.status, "NOT_RUN");
    assert.deepEqual(result.findings, []);
  }
  const member = snapshot();
  member.memberships.push({ member: "catalog_audit", role: "writer", inherit: false, admin: false });
  assert.equal(run(member).status, "NOT_RUN");
});

test("live hardening: all catalog tables including Storage are evaluated and IDs are unique", () => {
  const value = snapshot();
  value.tables[0].rls = false;
  value.tables[1].rls = false;
  value.tables.push({ name: "public.extra", oid: 999, rls: false, forceRls: false, owner: "owner" });
  for (const role of value.roles) for (const privilege of TABLE_PRIVILEGES) value.effectiveTablePrivileges.push({
    role: role.name, table: "public.extra", privilege, allowed: false, columnAllowed: false, owner: false
  });
  const result = run(value);
  assert.equal(result.status, "FAIL");
  const rls = result.findings.filter(f => f.id.startsWith("LIVE-RLS-001-"));
  assert.equal(rls.length, 3);
  assert.equal(new Set(result.findings.map(f => f.id)).size, result.findings.length);
  assert.ok(rls.some(f => f.object === "public.extra"));
  assert.ok(result.findings.some(f => f.id.startsWith("LIVE-STORAGE-BUCKET-")));
  assert.equal(result.coverage.liveStorage, "PASS");
});

test("live hardening: insufficient bucket SELECT and failed TLS remain NOT_RUN without exposing errors", () => {
  const insufficient = run(snapshot(), {
    commandRunner: () => ({ status: 0, stdout: "AUDIT_STORAGE_READ_REJECTED\n" })
  });
  assert.equal(insufficient.status, "NOT_RUN");
  assert.deepEqual(insufficient.coverage, { livePostgres: "NOT_RUN", liveStorage: "NOT_RUN" });

  const tlsFailure = scanLiveDatabase({
    env: {
      SUPABASE_READONLY_DATABASE_URL: "postgresql://sherlock_audit:secret@prod.example.test:5432/postgres?sslmode=verify-full",
      SUPABASE_AUDIT_ENVIRONMENT: "production",
      SUPABASE_EXPECTED_PRODUCTION_HOST: "prod.example.test",
      SUPABASE_EXPECTED_PRODUCTION_DATABASE: "postgres",
      SUPABASE_EXPECTED_PRODUCTION_BUCKETS: "listing-photos",
      SUPABASE_PRODUCTION_TARGET_CONFIRMATION: "PRODUCTION prod.example.test/postgres"
    },
    commandRunner: () => ({ status: 1, stdout: "", stderr: "certificate verify failed: secret" })
  });
  assert.equal(tlsFailure.status, "NOT_RUN");
  assert.doesNotMatch(JSON.stringify(tlsFailure), /secret|certificate/);
});

test("live hardening: Production storage inventory mismatch does not produce a Storage PASS", () => {
  const productionEnv = {
    SUPABASE_READONLY_DATABASE_URL: "postgresql://sherlock_audit:secret@prod.example.test:5432/postgres?sslmode=verify-full",
    SUPABASE_AUDIT_ENVIRONMENT: "production",
    SUPABASE_EXPECTED_PRODUCTION_HOST: "prod.example.test",
    SUPABASE_EXPECTED_PRODUCTION_DATABASE: "postgres",
    SUPABASE_EXPECTED_PRODUCTION_BUCKETS: "listing-photos,private-documents",
    SUPABASE_PRODUCTION_TARGET_CONFIRMATION: "PRODUCTION prod.example.test/postgres"
  };
  const result = scanLiveDatabase({
    env: productionEnv,
    commandRunner: () => {
      const live = snapshot();
      live.identity.name = live.identity.sessionUser = "sherlock_audit";
      return { status: 0, stdout: JSON.stringify(live) };
    }
  });
  assert.equal(result.coverage.livePostgres, "PASS");
  assert.equal(result.coverage.liveStorage, "NOT_RUN");
  assert.equal(result.status, "NOT_RUN");
  assert.ok(result.findings.some(item => item.id === "LIVE-STORAGE-INVENTORY-001"));
});

test("live hardening: Production bucket settings and full policy expressions are retained", () => {
  const productionEnv = {
    SUPABASE_READONLY_DATABASE_URL: "postgresql://sherlock_audit:secret@prod.example.test:5432/postgres?sslmode=verify-full",
    SUPABASE_AUDIT_ENVIRONMENT: "production",
    SUPABASE_EXPECTED_PRODUCTION_HOST: "prod.example.test",
    SUPABASE_EXPECTED_PRODUCTION_DATABASE: "postgres",
    SUPABASE_EXPECTED_PRODUCTION_BUCKETS: "listing-photos",
    SUPABASE_PRODUCTION_TARGET_CONFIRMATION: "PRODUCTION prod.example.test/postgres"
  };
  const result = scanLiveDatabase({
    env: productionEnv,
    commandRunner: () => {
      const live = snapshot();
      live.identity.name = live.identity.sessionUser = "sherlock_audit";
      live.policies.push({
        name: "owner_insert", table: "storage.objects", command: "INSERT", roles: ["authenticated"],
        permissive: "PERMISSIVE", usingExpression: null, checkExpression: "auth.uid() = owner_id",
        usingPresent: false, checkPresent: true, ownerUsing: false, ownerCheck: true, unconditional: false
      });
      return { status: 0, stdout: JSON.stringify(live) };
    }
  });
  assert.equal(result.status, "PASS");
  assert.equal(result.coverage.livePostgres, "PASS");
  assert.equal(result.coverage.liveStorage, "PASS");
  assert.deepEqual(result.metadata.storageBuckets[0], snapshot().storageBuckets[0]);
  assert.equal(result.metadata.policies[0].checkExpression, "auth.uid() = owner_id");
});

test("live hardening: successful Production audit remains separate from absent migrations", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "security-live-no-migrations-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const productionEnv = {
    SUPABASE_READONLY_DATABASE_URL: "postgresql://sherlock_audit:secret@prod.example.test:5432/postgres?sslmode=verify-full",
    SUPABASE_AUDIT_ENVIRONMENT: "production",
    SUPABASE_EXPECTED_PRODUCTION_HOST: "prod.example.test",
    SUPABASE_EXPECTED_PRODUCTION_DATABASE: "postgres",
    SUPABASE_EXPECTED_PRODUCTION_BUCKETS: "listing-photos",
    SUPABASE_PRODUCTION_TARGET_CONFIRMATION: "PRODUCTION prod.example.test/postgres"
  };
  const liveSnapshot = snapshot();
  liveSnapshot.identity.name = liveSnapshot.identity.sessionUser = "sherlock_audit";
  const { report } = runCli({
    root, mode: "supabase", live: true, env: productionEnv,
    liveOptions: { commandRunner: () => ({ status: 0, stdout: JSON.stringify(liveSnapshot) }) }
  });
  assert.equal(report.coverage.migrations, "NOT_RUN");
  assert.equal(report.coverage.livePostgres, "PASS");
  assert.equal(report.coverage.liveStorage, "PASS");
  assert.equal(report.result, "NOT_RUN");
  assert.equal(report.liveAudit.role, "sherlock_audit");
  assert.equal(getExitCode(report, ["--require-live-complete"]), 0);
  assert.equal(getExitCode(report, ["--require-complete"]), 2);
  assert.equal(getExitCode({ ...report, coverage: { ...report.coverage, liveStorage: "NOT_RUN" } },
    ["--require-live-complete"]), 2);
});

test("live hardening: PUBLIC DML grants alone are not confirmed attacks when RLS is enabled", () => {
  const value = snapshot();
  value.grants.push({ grantee: "PUBLIC", table: "public.messages", privilege: "DELETE" });
  value.effectiveTablePrivileges.find(r => r.role === "anon" && r.table === "public.messages" && r.privilege === "DELETE").allowed = true;
  const result = run(value);
  assert.notEqual(result.status, "FAIL");
  assert.equal(result.findings.some(f => f.id.startsWith("LIVE-GRANT")), false);
});

test("live hardening: inherited effective privileges detect RLS-bypassing TRUNCATE and ownership", () => {
  const value = snapshot();
  value.memberships.push({ member: "authenticated", role: "legacy_writer", inherit: true, admin: false });
  value.effectiveTablePrivileges.find(r => r.role === "authenticated" && r.table === "public.messages" && r.privilege === "TRUNCATE").allowed = true;
  const write = value.effectiveTablePrivileges.find(r => r.role === "anon" && r.table === "public.messages" && r.privilege === "UPDATE");
  Object.assign(write, { columnAllowed: true, owner: true });
  const result = run(value);
  assert.equal(result.status, "FAIL");
  assert.ok(result.findings.some(f => f.id.startsWith("LIVE-GRANT-001-") && /authenticated/.test(f.description)));
  assert.ok(result.findings.some(f => f.id.startsWith("LIVE-GRANT-002-") && /anon/.test(f.description)));
  value.tables.find(t => t.name === "public.messages").forceRls = true;
  assert.equal(run(value).findings.some(f => f.id.startsWith("LIVE-GRANT-002-")), false);
});

test("live hardening: policy text heuristics remain potential including restrictive true conditions", () => {
  const value = snapshot();
  for (const name of ["first_policy", "second_policy"]) value.policies.push({
    name, table: "public.messages", command: "ALL", roles: ["authenticated"], permissive: "RESTRICTIVE",
    usingExpression: "true", checkExpression: "true",
    usingPresent: true, checkPresent: true, ownerUsing: false, ownerCheck: false, unconditional: true
  });
  value.policies.push({
    name: "reads", table: "public.messages", command: "SELECT", roles: ["public"], permissive: "PERMISSIVE",
    usingExpression: "true", checkExpression: null,
    usingPresent: true, checkPresent: false, ownerUsing: false, ownerCheck: false, unconditional: true
  });
  const policies = run(value).findings.filter(f => f.id.startsWith("LIVE-POLICY"));
  assert.equal(policies.length, 3);
  assert.ok(policies.every(f => f.status === "potential"));
  assert.equal(new Set(policies.map(f => f.id)).size, 3);
});

test("live hardening: effective function grants distinguish overloads and honor schema USAGE", () => {
  const value = snapshot();
  addFunction(value, "public.lookup(integer)");
  addFunction(value, "public.lookup(text)");
  value.memberships.push({ member: "anon", role: "rpc_group", inherit: true, admin: false });
  value.functionGrants.push({
    grantee: "rpc_group", name: "public.lookup(text)", privilege: "EXECUTE",
    grantable: false, grantor: "owner"
  });
  value.effectiveFunctionPrivileges.find(r => r.role === "anon" && r.name === "public.lookup(text)").allowed = true;
  const result = run(value);
  const executable = result.findings.filter(f => f.id.startsWith("LIVE-RPC-002-"));
  assert.equal(executable.length, 1);
  assert.equal(executable[0].object, "public.lookup(text)");
  value.effectiveSchemaPrivileges.find(r => r.role === "anon" && r.schema === "public").usage = false;
  assert.equal(run(value).findings.some(f => f.id.startsWith("LIVE-RPC-002-")), false);
});

test("live hardening: arbitrary search_path schemas are not assumed trusted", () => {
  const value = snapshot();
  addFunction(value, "public.unfixed()", { config: [] });
  addFunction(value, "public.untrusted()", { config: ["search_path=custom_schema"] });
  addFunction(value, "public.public_path()", { config: ["search_path=public, pg_catalog"] });
  addFunction(value, "public.temp_path()", { config: ["search_path=pg_catalog, pg_temp"] });
  addFunction(value, "public.safe()", { config: ["search_path=pg_catalog"] });
  const findings = run(value).findings.filter(f => f.id.startsWith("LIVE-RPC-001-"));
  assert.equal(findings.length, 4);
  assert.equal(findings.some(f => f.object === "public.safe()"), false);
});

test("live hardening: missing expected tables or API roles are explicit NOT_RUN coverage", () => {
  const value = snapshot();
  value.tables = value.tables.filter(t => t.name !== "storage.objects");
  value.effectiveTablePrivileges = value.effectiveTablePrivileges.filter(r => r.table !== "storage.objects" && r.role !== "anon");
  value.roles = value.roles.filter(r => r.name !== "anon");
  value.effectiveSchemaPrivileges = value.effectiveSchemaPrivileges.filter(r => r.role !== "anon");
  const result = run(value);
  assert.equal(result.status, "NOT_RUN");
  assert.ok(result.findings.some(f => f.object === "storage.objects" && f.status === "not-run"));
  assert.ok(result.findings.some(f => f.object === "role anon" && f.status === "not-run"));
});
