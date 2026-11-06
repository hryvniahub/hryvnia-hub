"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { EventEmitter } = require("node:events");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { auditProduction, connectionOptions, evaluateMetadata, QUERIES, CONFIRMATION } = require("../scanners/supabase-live.cjs");
const { runProduction } = require("../cli.cjs");
const { analyzeSql } = require("../scanners/sql.cjs");

const config = {
  SUPABASE_READONLY_DATABASE_URL: "postgresql://sherlock_audit:synthetic-password@production.invalid:6543/postgres?sslmode=verify-full",
  SUPABASE_PRODUCTION_HOST: "production.invalid",
  SUPABASE_PRODUCTION_DATABASE: "postgres",
  SUPABASE_PRODUCTION_STORAGE_BUCKETS: "listing-photos"
};
const identity = {
  role: "sherlock_audit", session_role: "sherlock_audit", database: "postgres", read_only: "on",
  rolsuper: false, rolbypassrls: false, rolcreaterole: false, rolcreatedb: false,
  rolreplication: false, memberships: false, unsafe_privileges: false
};

function fixture(overrides = {}) {
  return {
    identity: [identity],
    tables: [
      { schema: "public", name: "listings", rls: true, force_rls: false, owner: "app_owner" },
      { schema: "storage", name: "objects", rls: true, force_rls: false, owner: "storage_owner" },
      { schema: "storage", name: "buckets", rls: false, force_rls: false, owner: "storage_owner" }
    ],
    policies: [
      { schema: "public", name: "listings", policy: "owner", roles: ["authenticated"], cmd: "UPDATE", permissive: "PERMISSIVE",
        using_expression: "(auth.uid() = user_id)", check_expression: null },
      { schema: "storage", name: "objects", policy: "owner", roles: ["authenticated"], cmd: "INSERT", permissive: "PERMISSIVE",
        using_expression: null, check_expression: "(auth.uid() = owner)" }
    ],
    roles: [{ name: "anon" }, { name: "authenticated" }],
    grants: [], schemas: [], functions: [],
    buckets: [{ id: "listing-photos", name: "listing-photos", public: false, file_size_limit: null, allowed_mime_types: null }],
    ...overrides
  };
}

function mockDatabase({ rows = fixture(), failures = {}, connectError, endError } = {}) {
  const calls = [];
  let options;
  const client = new EventEmitter();
  client.connect = async () => { calls.push("CONNECT"); if (connectError) throw connectError; };
  client.end = async () => { calls.push("END"); if (endError) throw endError; };
  client.query = async sql => {
    calls.push(sql);
    const component = Object.keys(QUERIES).find(key => QUERIES[key] === sql);
    if (failures[component]) throw failures[component];
    return { rows: component ? rows[component] || [] : [] };
  };
  return { calls, client, get options() { return options; },
    clientFactory(value) { options = value; return client; } };
}

test("live auditor connects using strict TLS, bounded timeouts and a dedicated role", async () => {
  const database = mockDatabase();
  const report = await auditProduction({ config, confirmation: CONFIRMATION, clientFactory: database.clientFactory });
  assert.equal(report.result, "PASS");
  assert.equal(report.mode, "production-metadata");
  assert.ok(Object.values(report.coverage).every(value => value === "CHECKED"));
  assert.equal(database.options.host, "production.invalid");
  assert.equal(database.options.port, 6543);
  assert.equal(database.options.user, "sherlock_audit");
  assert.equal(database.options.password, "synthetic-password");
  assert.deepEqual(database.options.ssl, { rejectUnauthorized: true, servername: "production.invalid" });
  assert.equal(database.options.connectionTimeoutMillis, 5000);
  assert.equal(database.options.query_timeout, 6000);
  assert.match(database.options.options, /default_transaction_read_only=on/);
  assert.match(database.options.options, /statement_timeout=5000/);
  assert.match(database.options.options, /lock_timeout=2000/);
  assert.equal(database.calls[1], "BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
  assert.equal(database.calls[2], QUERIES.identity);
  assert.deepEqual(database.calls.slice(-2), ["ROLLBACK", "END"]);
});

test("production authorization and configuration fail closed before creating a client", async () => {
  let created = false;
  const clientFactory = () => { created = true; throw new Error("should not connect"); };
  for (const options of [
    { config, confirmation: undefined },
    { config, confirmation: "true" },
    { config: { ...config, SUPABASE_PRODUCTION_HOST: "different.invalid" }, confirmation: CONFIRMATION },
    { config: { ...config, SUPABASE_READONLY_DATABASE_URL: config.SUPABASE_READONLY_DATABASE_URL.replace("verify-full", "disable") }, confirmation: CONFIRMATION }
  ]) {
    const report = await auditProduction({ ...options, clientFactory });
    assert.equal(report.result, "INCOMPLETE");
    assert.ok(Object.values(report.coverage).every(value => value === "NOT_RUN"));
  }
  assert.equal(created, false);
});

test("connection failures are INCOMPLETE, sanitized and cleaned up", async () => {
  const secretError = Object.assign(new Error(`failure ${config.SUPABASE_READONLY_DATABASE_URL}`), { code: "28P01" });
  const database = mockDatabase({ connectError: secretError });
  const report = await auditProduction({ config, confirmation: CONFIRMATION, clientFactory: database.clientFactory });
  assert.equal(report.result, "INCOMPLETE");
  assert.equal(report.coverage.connection, "NOT_RUN");
  assert.equal(report.errors[0].reason, "authentication_failed");
  assert.deepEqual(database.calls, ["CONNECT", "END"]);
  assert.doesNotMatch(JSON.stringify(report), /synthetic-password|postgresql:|failure /);
});

test("unsafe role or transaction identity prevents every metadata query", async () => {
  for (const change of [
    { role: "administrator" }, { session_role: "administrator" }, { database: "other" },
    { read_only: "off" }, { rolsuper: true }, { rolbypassrls: true }, { rolcreatedb: true },
    { rolcreaterole: true }, { rolreplication: true }, { memberships: true }, { unsafe_privileges: true },
    { rolsuper: undefined }
  ]) {
    const database = mockDatabase({ rows: fixture({ identity: [{ ...identity, ...change }] }) });
    const report = await auditProduction({ config, confirmation: CONFIRMATION, clientFactory: database.clientFactory });
    assert.equal(report.result, "INCOMPLETE", JSON.stringify(change));
    assert.equal(report.coverage.identity, "NOT_RUN");
    assert.equal(database.calls.some(sql => sql === QUERIES.tables), false);
    assert.deepEqual(database.calls.slice(-2), ["ROLLBACK", "END"]);
  }
});

test("individual metadata permission, missing relation and timeout errors recover using savepoints", async () => {
  const failures = {
    policies: Object.assign(new Error("secret policy text"), { code: "42501" }),
    buckets: Object.assign(new Error("secret relation text"), { code: "42P01" }),
    functions: Object.assign(new Error("secret timeout text"), { code: "57014" })
  };
  const database = mockDatabase({ failures });
  const report = await auditProduction({ config, confirmation: CONFIRMATION, clientFactory: database.clientFactory });
  assert.equal(report.result, "INCOMPLETE");
  for (const component of Object.keys(failures)) assert.equal(report.coverage[component], "NOT_RUN");
  assert.equal(report.coverage.grants, "CHECKED");
  assert.equal(report.coverage.schemas, "CHECKED");
  assert.deepEqual(report.errors.map(error => error.reason), ["permission_denied", "query_timeout", "metadata_missing"]);
  assert.equal(database.calls.filter(sql => sql === "ROLLBACK TO SAVEPOINT sherlock_metadata").length, 3);
  assert.doesNotMatch(JSON.stringify(report), /secret policy|secret relation|secret timeout/);
});

test("HIGH findings remain FAIL when another metadata query is NOT_RUN", async () => {
  const database = mockDatabase({
    rows: fixture({ tables: [{ schema: "public", name: "listings", rls: false }] }),
    failures: { buckets: Object.assign(new Error("denied"), { code: "42501" }) }
  });
  const report = await auditProduction({ config, confirmation: CONFIRMATION, clientFactory: database.clientFactory });
  assert.equal(report.result, "FAIL");
  assert.equal(report.coverage.buckets, "NOT_RUN");
  assert.ok(report.findings.some(row => row.id.startsWith("RLS-001-") && row.severity === "HIGH"));
});

test("missing required roles, buckets or Storage table cannot become PASS", async () => {
  for (const overrides of [
    { roles: [{ name: "anon" }] },
    { buckets: [] },
    { tables: [{ schema: "public", name: "listings", rls: true }] },
    { tables: [{ schema: "storage", name: "objects", rls: true }, { schema: "storage", name: "buckets", rls: true }] }
  ]) {
    const database = mockDatabase({ rows: fixture(overrides) });
    const report = await auditProduction({ config, confirmation: CONFIRMATION, clientFactory: database.clientFactory });
    assert.equal(report.result, "INCOMPLETE", JSON.stringify(overrides));
    assert.ok(report.errors.length > 0);
  }
});

test("metadata caps and connection cleanup failures cannot become PASS", async () => {
  const database = mockDatabase({ rows: fixture({ grants: Array.from({ length: 10001 }, () => ({ role: "authenticated" })) }) });
  const report = await auditProduction({ config, confirmation: CONFIRMATION, clientFactory: database.clientFactory });
  assert.equal(report.result, "INCOMPLETE");
  assert.equal(report.coverage.grants, "PARTIAL");
  assert.equal(report.metadataCounts.grants, 10000);
  const failing = mockDatabase({ endError: new Error("private driver message") });
  const incomplete = await auditProduction({ config, confirmation: CONFIRMATION, clientFactory: failing.clientFactory });
  assert.equal(incomplete.result, "INCOMPLETE");
  assert.doesNotMatch(JSON.stringify(incomplete), /private driver message/);
});

test("metadata rules inspect effective grants, exact overloads, RLS roles and Storage", () => {
  const data = fixture({
    tables: [{ schema: "public", name: "listings", rls: false }],
    roles: [{ name: "anon", rolbypassrls: true }, { name: "authenticated", rolsuper: true }],
    grants: [
      { schema: "public", name: "listings", role: "anon", can_truncate: true },
      { schema: "public", name: "listings", role: "authenticated", can_truncate: true },
      { schema: "public", name: "other", role: "anon", column_update: true }
    ],
    schemas: [{ schema: "auth", role: "anon", can_use: true }],
    functions: [
      { schema: "public", name: "f", arguments: "integer", definer: true, config: ["search_path="], anon_execute: false },
      { schema: "public", name: "f", arguments: "text", definer: true, config: ['search_path="public"'], anon_execute: true },
      { schema: "public", name: "g", arguments: "", definer: true, config: null, public_execute: true }
    ],
    buckets: [{ id: "listing-photos", public: true }]
  });
  const { findings } = evaluateMetadata(data, { buckets: ["listing-photos"] });
  for (const rule of ["RLS-001", "RLS-003", "GRANT-001", "GRANT-002", "GRANT-005", "RPC-001", "RPC-003", "RPC-004", "STORAGE-LIVE-001"]) {
    assert.ok(findings.some(row => row.id.startsWith(`${rule}-`)), rule);
  }
  assert.equal(findings.filter(row => row.id.startsWith("RLS-003") && row.severity === "CRITICAL").length, 2);
  assert.equal(findings.some(row => row.object.endsWith("(integer)")), false);
  assert.ok(findings.some(row => row.object.endsWith("(text)") && row.id.startsWith("RPC-004")));
  assert.ok(findings.every(row => row.status === "potential" && row.evidence && row.recommendation && row.risk));
});

test("live auditor preserves EXECUTE findings for anon and PUBLIC SECURITY DEFINER grants", () => {
  const { findings } = evaluateMetadata(fixture({
    functions: [
      { schema: "public", name: "anon_callable", arguments: "integer", definer: true,
        config: ["search_path=pg_catalog"], anon_execute: true, public_execute: false },
      { schema: "public", name: "public_callable", arguments: "text", definer: true,
        config: ["search_path=pg_catalog"], anon_execute: false, public_execute: true },
      { schema: "public", name: "private_callable", arguments: "uuid", definer: true,
        config: ["search_path=pg_catalog"], anon_execute: false, public_execute: false }
    ]
  }), { buckets: ["listing-photos"] });
  const executeFindings = findings.filter(row => row.id.startsWith("RPC-004-"));
  assert.equal(executeFindings.length, 2);
  assert.ok(executeFindings.some(row => row.object.endsWith('"anon_callable"(integer)')));
  assert.ok(executeFindings.some(row => row.object.endsWith('"public_callable"(text)')));
  assert.ok(executeFindings.every(row => row.severity === "HIGH"));
  assert.ok(!executeFindings.some(row => row.object.endsWith("private_callable(uuid)")));

  const staticFinding = analyzeSql(`
    CREATE FUNCTION public.static_callable(value integer) RETURNS integer
      LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog AS $$ SELECT value $$;
    GRANT EXECUTE ON FUNCTION public.static_callable(integer) TO anon;
  `).findings.find(row => row.id.startsWith("RPC-004-"));
  assert.ok(staticFinding);
  assert.equal(staticFinding.severity, "HIGH");
});

test("policy clauses and fallback are checked independently and Storage policies are included", () => {
  const base = { schema: "public", name: "listings", cmd: "UPDATE", roles: ["authenticated"], permissive: "PERMISSIVE" };
  const data = fixture({ policies: [
    { ...base, policy: "safe", using_expression: "(auth.uid() = user_id)", check_expression: null },
    { ...base, policy: "unsafe", using_expression: "(auth.uid() = user_id)", check_expression: "published" },
    { ...base, schema: "storage", name: "objects", policy: "unrestricted", using_expression: "true", check_expression: "true OR auth.uid() = owner", roles: ["anon"] }
  ] });
  const { findings } = evaluateMetadata(data, { buckets: ["listing-photos"] });
  assert.equal(findings.some(row => row.object.includes('"safe"') && row.id.startsWith("POLICY-002")), false);
  assert.ok(findings.some(row => row.object.includes('"unsafe"') && row.id.startsWith("POLICY-002") && row.severity === "HIGH"));
  assert.ok(findings.some(row => row.object.includes('"storage"') && row.id.startsWith("POLICY-001") && row.severity === "HIGH"));
  assert.ok(findings.some(row => row.object.includes('"storage"') && row.id.startsWith("POLICY-004") && row.severity === "HIGH"));
  assert.ok(findings.some(row => row.id.startsWith("POLICY-003")));
});

test("all database reads are fixed metadata SELECTs with no user data, RPC, DDL or DML", async () => {
  const allowedRelations = new Set(["pg_roles", "pg_namespace", "pg_class", "pg_proc", "pg_policies"]);
  const allowedCatalogFunctions = new Set(["aclexplode", "acldefault"]);
  for (const [component, sql] of Object.entries(QUERIES)) {
    assert.match(sql, /^\s*SELECT\b/);
    const withoutLiterals = sql.replace(/'(?:''|[^'])*'/g, "''");
    assert.doesNotMatch(withoutLiterals, /\b(?:INSERT|UPDATE|DELETE|TRUNCATE|CREATE|ALTER|DROP|CALL|DO|COPY)\b/i);
    assert.doesNotMatch(sql, /pg_get_functiondef|pg_authid|prosrc|storage\.objects/i);
    for (const match of sql.matchAll(/\b(?:FROM|JOIN)\s+([a-z_]+)\.([a-z_]+)/gi)) {
      assert.ok(match[1] === "pg_catalog" && (allowedRelations.has(match[2]) || allowedCatalogFunctions.has(match[2]))
        || component === "buckets" && match[0].endsWith("storage.buckets"), match[0]);
    }
  }
  const database = mockDatabase();
  await auditProduction({ config, confirmation: CONFIRMATION, clientFactory: database.clientFactory });
  for (const sql of database.calls.filter(value => !["CONNECT", "END"].includes(value))) {
    assert.ok(Object.values(QUERIES).includes(sql) || [
      "BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY", "ROLLBACK",
      "SAVEPOINT sherlock_metadata", "RELEASE SAVEPOINT sherlock_metadata"
    ].includes(sql), sql);
  }
});

test("live reports stay separate from offline reports and contain no connection credentials", async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sherlock-live-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "security-report.json"), "offline unchanged");
  const database = mockDatabase();
  const { report, written } = await runProduction({ config, confirmation: CONFIRMATION, reportDir: root, clientFactory: database.clientFactory });
  assert.equal(report.result, "PASS");
  assert.equal(fs.readFileSync(path.join(root, "security-report.json"), "utf8"), "offline unchanged");
  for (const file of Object.values(written)) {
    assert.doesNotMatch(fs.readFileSync(file, "utf8"), /synthetic-password|postgresql:\/\/|SUPABASE_READONLY_DATABASE_URL/);
  }
  assert.equal(fs.statSync(written.jsonPath).mode & 0o777, 0o600);
});

test("CLI refuses unconfirmed Production execution without connecting and exits 2", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "sherlock-cli-live-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cli = path.resolve(__dirname, "../cli.cjs");
  const child = spawnSync(process.execPath, [cli, "production-audit"], {
    cwd: root, encoding: "utf8", env: { ...process.env, ...config, SHERLOCK_PRODUCTION_CONFIRMATION: "" }
  });
  assert.equal(child.status, 2);
  assert.match(child.stdout, /INCOMPLETE/);
  assert.match(child.stderr, /explicit_confirmation_required/);
  assert.doesNotMatch(`${child.stdout}${child.stderr}`, /synthetic-password|postgresql:\/\//);
  const report = JSON.parse(fs.readFileSync(path.join(root, "supabase-production-report.json"), "utf8"));
  assert.equal(report.coverage.connection, "NOT_RUN");
});

test("connection options never pass a raw URL or weaken TLS verification to the driver", () => {
  const { options } = connectionOptions(config);
  assert.equal(options.connectionString, undefined);
  assert.equal(options.ssl.rejectUnauthorized, true);
  assert.equal(options.options.includes("search_path=pg_catalog"), true);
});
