"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { analyzeSql, analyzeSqlFiles, stripComments } = require("../scanners/sql.cjs");
const { scanRepository } = require("../scanners/repository.cjs");
const { inspectSnapshot, READ_ONLY_QUERY, scanLiveDatabase } = require("../scanners/supabase-live.cjs");
const { collectSqlFiles, run } = require("../cli.cjs");
const { createReport, renderMarkdown } = require("../reports/report.cjs");

test("comment stripping works independently and preserves SQL and line offsets", () => {
  const sql = "-- ignored\nSELECT '/* literal */', $$-- literal$$; /* ignored */\nALTER ROLE anon BYPASSRLS;";
  assert.equal(
    stripComments(sql),
    `${" ".repeat("-- ignored".length)}\nSELECT '/* literal */', $$-- literal$$; ${" ".repeat("/* ignored */".length)}\nALTER ROLE anon BYPASSRLS;`
  );
});

test("flags each BYPASSRLS role statement once with the expected severity", () => {
  const { findings } = analyzeSql(`
    CREATE ROLE anon WITH BYPASSRLS;
    ALTER ROLE "authenticated" BYPASSRLS;
    CREATE ROLE auditor BYPASSRLS;
    ALTER ROLE ordinary NOBYPASSRLS;
  `);
  assert.deepEqual(
    findings.map(({ object, severity, status }) => ({ object, severity, status })).sort((a, b) => a.object.localeCompare(b.object)),
    [
      { object: "role anon", severity: "CRITICAL", status: "potential" },
      { object: "role auditor", severity: "HIGH", status: "potential" },
      { object: "role authenticated", severity: "CRITICAL", status: "potential" }
    ]
  );
  assert.ok(findings.every(finding => finding.id.startsWith("RLS-003-")));
});

test("ignores BYPASSRLS statements in comments and SQL literals", () => {
  const { findings } = analyzeSql(`
    -- ALTER ROLE anon BYPASSRLS;
    /* CREATE ROLE authenticated BYPASSRLS; */
    SELECT 'ALTER ROLE anon BYPASSRLS;';
    SELECT $$CREATE ROLE authenticated BYPASSRLS;$$;
    SELECT $body$ALTER ROLE auditor BYPASSRLS;$body$;
  `);
  assert.deepEqual(findings, []);
});

test("BYPASSRLS evidence points to its migration and line", () => {
  const { findings } = analyzeSqlFiles([
    { source: "001.sql", sql: "SELECT 1;" },
    { source: "002.sql", sql: "-- role change\nALTER ROLE anon BYPASSRLS;" }
  ]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].evidence, "002.sql:2: ALTER ROLE anon BYPASSRLS;");
});

test("flags public tables without RLS without claiming confirmation", () => {
  const { findings } = analyzeSql("CREATE TABLE public.listings (id bigint primary key);");
  assert.equal(findings[0].severity, "HIGH");
  assert.equal(findings[0].status, "potential");
  assert.match(findings[0].description, /without a matching ENABLE ROW LEVEL SECURITY/);
});

test("flags a public write policy with an unconditional check", () => {
  const sql = `
    CREATE TABLE public.favorites (user_id uuid);
    ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
    CREATE POLICY everyone_can_change_favorites ON public.favorites
      FOR INSERT TO anon WITH CHECK (true);
  `;
  const finding = analyzeSql(sql).findings.find(item => item.id.startsWith("POLICY-001"));
  assert.equal(finding.severity, "HIGH");
  assert.equal(finding.status, "potential");
  assert.match(finding.evidence, /with_check/);
});

test("flags unconditional reads of private conversation data", () => {
  const sql = `
    CREATE TABLE public.messages (id bigint);
    ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
    CREATE POLICY read_everything ON public.messages
      FOR SELECT TO authenticated USING (true);
  `;
  const finding = analyzeSql(sql).findings.find(item => item.id.startsWith("POLICY-004"));
  assert.equal(finding.severity, "HIGH");
  assert.equal(finding.status, "potential");
  assert.match(finding.description, /unconditional SELECT/);
});

test("flags anon grants of destructive privileges", () => {
  const { findings } = analyzeSql("GRANT DELETE, TRUNCATE ON TABLE public.listings TO anon;");
  assert.equal(findings[0].severity, "HIGH");
  assert.equal(findings[0].object, "public.listings");
});

test("flags application roles configured to bypass row-level security", () => {
  const { findings } = analyzeSql("CREATE ROLE anon BYPASSRLS;");
  assert.equal(findings[0].id.startsWith("RLS-003"), true);
  assert.equal(findings[0].severity, "CRITICAL");
});

test("detects definer functions without a fixed search_path", () => {
  const sql = `
    CREATE OR REPLACE FUNCTION public.read_secret()
    RETURNS text LANGUAGE sql SECURITY DEFINER
    AS $$ SELECT 'safe-to-redact' $$;
  `;
  const finding = analyzeSql(sql).findings.find(item => item.id.startsWith("RPC-001"));
  assert.equal(finding.severity, "HIGH");
  assert.doesNotMatch(finding.evidence, /safe-to-redact/);
});

test("does not interpret comments or string contents as SQL grants or policies", () => {
  const sql = `
    -- GRANT ALL ON public.listings TO anon;
    SELECT 'CREATE POLICY everyone ON public.listings USING (true);';
  `;
  assert.deepEqual(analyzeSql(sql).findings, []);
});

test("an enabled RLS table with a scoped owner policy is not reported as missing RLS", () => {
  const sql = `
    CREATE TABLE public.listings (user_id uuid);
    ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
    CREATE POLICY owner_update ON public.listings
      FOR UPDATE TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  `;
  const { findings } = analyzeSql(sql);
  assert.equal(findings.some(item => item.id.startsWith("RLS-001")), false);
  assert.equal(findings.some(item => item.id.startsWith("POLICY-002")), false);
});

test("joins migration context so RLS enabled in a later file is recognized", () => {
  const { findings } = analyzeSqlFiles([
    { source: "supabase/migrations/001_tables.sql", sql: "CREATE TABLE public.listings (user_id uuid);" },
    { source: "supabase/migrations/002_rls.sql", sql: "ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;" }
  ]);
  assert.equal(findings.some(item => item.id.startsWith("RLS-001")), false);
});

test("report differentiates incomplete coverage from a static pass", () => {
  const report = createReport({ findings: [], scannedFiles: [], sourceAvailable: false, generatedAt: "fixed" });
  assert.equal(report.result, "NOT_RUN");
  assert.equal(report.coverage.database, "NOT_RUN");
  assert.match(renderMarkdown(report), /not evidence that deployed Supabase configuration is secure/i);
});

test("repository scan detects credential literals without including secret values in evidence", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "security-repository-secrets-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const secret = "a-private-token-that-must-not-leak";
  fs.writeFileSync(path.join(root, "config.js"), [
    `const SUPABASE_SERVICE_ROLE_KEY = "${secret}";`,
    `const SUPABASE_ANON_KEY = "sb_publishable_public_value";`
  ].join("\n"));

  const { findings } = scanRepository({ root, runNpmAudit: false });
  const exposed = findings.find(item => item.id.startsWith("SECRET-005"));
  assert.ok(exposed);
  assert.equal(exposed.status, "potential");
  assert.doesNotMatch(JSON.stringify(exposed), new RegExp(secret));
  assert.equal(findings.some(item => item.description.includes("public_value")), false);
});

test("repository scan detects XSS sinks and unverified client writes as potential findings", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "security-repository-js-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "client.js"), [
    'const db = window.supabase.createClient(url, key);',
    "element.innerHTML = userInput;",
    'db.from("listings").update(payload);'
  ].join("\n"));

  const { findings } = scanRepository({ root, runNpmAudit: false });
  assert.ok(findings.some(item => item.id.startsWith("XSS-001") && item.status === "potential"));
  assert.ok(findings.some(item => item.id.startsWith("AUTH-001") && item.category === "Authentication"));
});

test("live scan is NOT_RUN without a read-only database URL and never prints credentials", () => {
  assert.equal(scanLiveDatabase({ env: {} }).status, "NOT_RUN");
  assert.equal(scanLiveDatabase({ env: { SUPABASE_READONLY_DATABASE_URL: "https://service_role:secret@example.test" } }).status, "NOT_RUN");
  assert.match(READ_ONLY_QUERY, /^BEGIN READ ONLY;/);
  assert.match(READ_ONLY_QUERY, /pg_policies/);
  assert.doesNotMatch(READ_ONLY_QUERY, /\b(?:INSERT|UPDATE|DELETE|TRUNCATE|ALTER|DROP)\b/i);
  assert.doesNotMatch(READ_ONLY_QUERY, /SELECT\s+\*\s+FROM\s+public\./i);
});

test("live catalog findings distinguish observed policy problems and reject service_role", () => {
  const findings = inspectSnapshot({
    identity: { name: "postgres", superuser: false, bypassRls: false },
    tables: [{ name: "public.messages", rls: true }, { name: "storage.objects", rls: true }],
    policies: [{
      name: "open_messages", table: "public.messages", command: "SELECT",
      roles: ["authenticated"], permissive: "PERMISSIVE", unconditional: true
    }],
    functions: [{ name: "public.definer_fn", definer: true, searchPath: "" }],
    grants: [{ grantee: "anon", table: "public.messages", privilege: "DELETE" }],
    buckets: [{ name: "listing-photos", public: true }]
  });
  assert.ok(findings.some(item => item.id === "LIVE-POLICY-003" && item.status === "confirmed"));
  assert.ok(findings.some(item => item.id === "LIVE-RPC-001"));
  assert.ok(findings.some(item => item.id === "LIVE-GRANT-001"));
  assert.ok(findings.some(item => item.id === "LIVE-STORAGE-001"));

  const prohibited = inspectSnapshot({
    identity: { name: "service_role" }, tables: [], policies: [], functions: [], grants: [], buckets: []
  });
  assert.ok(prohibited.some(item => item.id === "LIVE-CONNECTION-001"));
});

test("GitHub Actions retains existing checks and every npm run command is declared", () => {
  const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../package.json"), "utf8"));
  const workflow = fs.readFileSync(path.resolve(__dirname, "../../.github/workflows/security-audit.yml"), "utf8");
  const commands = [...workflow.matchAll(/^\s*run:\s*npm run ([A-Za-z0-9:_-]+)/gm)].map(match => match[1]);
  assert.ok(commands.length > 0);
  for (const command of commands) assert.ok(packageJson.scripts[command], `Missing package.json script: ${command}`);
  assert.equal((workflow.match(/run: npm run security:test/g) || []).length, 3);
  assert.equal((workflow.match(/run: npm test/g) || []).length, 3);
  assert.equal((workflow.match(/run: npm run check:app/g) || []).length, 3);
  assert.match(workflow, /name: Repository Scan/);
  assert.match(workflow, /name: Supabase Scan/);
  assert.match(workflow, /name: Full Security Audit/);
  assert.match(workflow, /Check Supabase structure/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /schedule:/);
  assert.doesNotMatch(workflow, /--no-audit/);
});

test("CLI run scans nested SQL sources and writes matching reports", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "security-scanner-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const migrations = path.join(root, "supabase", "migrations");
  const nested = path.join(migrations, "nested");
  fs.mkdirSync(nested, { recursive: true });
  fs.writeFileSync(path.join(migrations, "001.sql"), "SELECT 1;");
  fs.writeFileSync(path.join(nested, "002.sql"), "-- role change\nALTER ROLE anon BYPASSRLS;");
  fs.writeFileSync(path.join(migrations, "ignored.txt"), "ALTER ROLE authenticated BYPASSRLS;");

  assert.deepEqual(collectSqlFiles(migrations), [
    path.join(migrations, "001.sql"),
    path.join(nested, "002.sql")
  ]);
  const { report, written } = run({ root });
  assert.equal(report.result, "FAIL");
  assert.deepEqual(report.scannedFiles, ["supabase/migrations/001.sql", "supabase/migrations/nested/002.sql"]);
  assert.equal(report.findings.length, 2);
  assert.equal(report.counts.CRITICAL, 1);
  assert.equal(report.findings[0].evidence, "supabase/migrations/nested/002.sql:2: ALTER ROLE anon BYPASSRLS;");
  assert.deepEqual(JSON.parse(fs.readFileSync(written.jsonPath, "utf8")), report);
  assert.equal(fs.readFileSync(written.markdownPath, "utf8"), renderMarkdown(report));
});

test("CLI audit and report preserve exit codes and generate reports for SQL input", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "security-cli-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const sources = path.join(root, "sql");
  fs.mkdirSync(sources);
  const sqlPath = path.join(sources, "roles.sql");
  const cli = path.resolve(__dirname, "../cli.cjs");
  for (const { sql, result, auditStatus } of [
    { sql: "ALTER ROLE anon BYPASSRLS;", result: "FAIL", auditStatus: 1 },
    { sql: "SELECT 1;", result: "NOT_RUN", auditStatus: 0 },
    { sql: null, result: "NOT_RUN", auditStatus: 0 }
  ]) {
    if (sql === null) fs.unlinkSync(sqlPath);
    else fs.writeFileSync(sqlPath, sql);
    for (const command of ["audit", "report"]) {
      for (const name of ["security-report.md", "security-report.json"]) {
        fs.rmSync(path.join(root, name), { force: true });
      }
      const child = spawnSync(process.execPath, [cli, command, "--sql-dir=sql"], { cwd: root, encoding: "utf8" });
      assert.ifError(child.error);
      assert.equal(child.signal, null);
      assert.equal(child.status, command === "audit" ? auditStatus : 0, child.stderr);
      assert.equal(child.stderr, "");
      assert.match(child.stdout, new RegExp(`Security scan: ${result}`));
      const report = JSON.parse(fs.readFileSync(path.join(root, "security-report.json"), "utf8"));
      assert.equal(report.result, result);
      assert.equal(report.coverage.database, "NOT_RUN");
      assert.equal(fs.readFileSync(path.join(root, "security-report.md"), "utf8"), renderMarkdown(report));
    }
  }
});
