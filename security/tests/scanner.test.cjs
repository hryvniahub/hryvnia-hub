"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const { analyzeSql, analyzeSqlFiles, sanitizeEvidence, stripComments } = require("../scanners/sql.cjs");
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

test("report escapes Markdown, table delimiters, backslashes, newlines, and HTML in input values", () => {
  const punctuation = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
  const report = createReport({
    findings: [{
      id: "finding|id\n### injected",
      category: "SQL/RLS",
      severity: "HIGH",
      object: "table|name\\",
      status: "potential",
      description: `[link](javascript:alert(1)) <script>alert(1)</script> ${punctuation}`,
      evidence: "first line\r\n| second line",
      risk: "*bold* _italic_ `code`",
      recommendation: "# heading\n- list item"
    }],
    scannedFiles: [],
    sourceAvailable: true,
    generatedAt: "date|\\\n# injected"
  });
  report.coverage.reason = "first|second\\third\r\n|<script>";
  report.reviewedSinks = [{ file: "a|b", line: 1, rule: "<script>", reason: "\\|inject\nnext" }];

  const markdown = renderMarkdown(report);
  assert.ok(markdown.includes("| reason | first\\|second\\\\third<br>\\|\\<script\\> |"));
  assert.match(markdown, /### finding\\\|id<br>\\#\\#\\# injected — HIGH/);
  assert.ok(markdown.includes("- **Generated:** date\\|\\\\<br>\\# injected"));
  assert.match(markdown, /table\\\|name\\\\/);
  assert.ok(markdown.includes("\\[link\\]\\(javascript\\:alert\\(1\\)\\)"));
  assert.match(markdown, /first line<br>\\\| second line/);
  assert.ok(markdown.includes("\\<script\\>alert\\(1\\)\\<\\/script\\>"));
  assert.ok(markdown.includes(punctuation.split("").map(character => `\\${character}`).join("")));
  assert.ok(markdown.includes("| a\\|b | 1 | \\<script\\> | \\\\\\|inject<br>next |"));
  assert.equal((markdown.match(/^### /gm) || []).length, 1);
  assert.doesNotMatch(markdown, /<script>/);
  assert.doesNotMatch(markdown, /&lt;|&gt;/);
});

test("evidence sanitizer redacts ordinary SQL string and dollar-quoted literals", () => {
  assert.equal(
    sanitizeEvidence(`SELECT 'secret''value', "quoted""identifier", $tag$private text$tag$;`),
    `SELECT '[REDACTED]', "[REDACTED]", $$[REDACTED]$$;`
  );
});

test("evidence sanitizer handles long adversarial quote sequences without regex backtracking", () => {
  for (const adversarial of [
    `'${"''".repeat(40_000)}x`,
    `"${'""'.repeat(40_000)}x`,
    `'${"\\&".repeat(40_000)}x'`
  ]) {
    const sanitized = sanitizeEvidence(adversarial);
    if (adversarial.endsWith("'")) {
      assert.equal(sanitized, "'[REDACTED]'");
    } else {
      assert.equal(sanitized.length, 240);
      assert.equal(sanitized[0], adversarial[0]);
    }
  }
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
  function assertReadOnlySql(query) {
    const metaCommands = [];
    const sql = stripComments(query).replace(/^[ \t]*\\[^\r\n]*/gm, command => {
      metaCommands.push(command.trim());
      return command.trim() === "\\gset" ? ";" : "";
    });
    assert.deepEqual(metaCommands, [
      "\\gset", "\\if :audit_safe", "\\gset", "\\if :storage_readable", "\\else",
      "\\echo AUDIT_STORAGE_READ_REJECTED", "\\endif", "\\else", "\\echo AUDIT_IDENTITY_REJECTED", "\\endif"
    ]);
    // Consume entire tokens so quoted privilege names and semicolons are not SQL commands.
    const token = /\s+|'(?:''|\\.|[^'\\])*'|"(?:[^"]|"")*"|(\$[A-Za-z_0-9]*\$)[\s\S]*?\1|[A-Za-z_][A-Za-z_0-9$]*|[0-9]+|[^'"\s$]/gy;
    const statements = [[]];
    let offset = 0;
    while (offset < sql.length) {
      token.lastIndex = offset;
      const match = token.exec(sql);
      assert.ok(match, `Unrecognized SQL token at offset ${offset}`);
      offset = token.lastIndex;
      const value = match[0];
      if (/^\s/.test(value)) continue;
      if (value === ";") statements.push([]);
      else statements.at(-1).push(/^['"$]/.test(value) ? "[QUOTED]" : value.toUpperCase());
    }
    const nonempty = statements.filter(statement => statement.length);
    assert.deepEqual(nonempty[0], ["BEGIN", "READ", "ONLY"]);
    assert.deepEqual(nonempty.at(-1), ["ROLLBACK"]);
    for (const statement of nonempty.slice(1, -1)) {
      if (statement[0] === "SET") {
        assert.deepEqual(statement.slice(0, 2), ["SET", "LOCAL"]);
        assert.ok(["STATEMENT_TIMEOUT", "LOCK_TIMEOUT", "IDLE_IN_TRANSACTION_SESSION_TIMEOUT",
          "SEARCH_PATH"].includes(statement[2]));
        assert.equal(statement[3], "=");
        assert.equal(statement.length, 5);
        assert.equal(statement[4], statement[2] === "SEARCH_PATH" ? "PG_CATALOG" : "[QUOTED]");
      } else {
        assert.equal(statement[0], "SELECT");
        assert.ok(!statement.some(word => [
          "INSERT", "UPDATE", "DELETE", "TRUNCATE", "ALTER", "DROP", "CREATE", "MERGE",
          "COPY", "CALL", "DO", "GRANT", "REVOKE", "INTO", "COMMIT", "EXECUTE"
        ].includes(word)), "Catalog SELECT must not contain executable mutation or SELECT INTO");
        for (let index = 0; index < statement.length; index++) {
          if (["FROM", "JOIN"].includes(statement[index])
            && ["PUBLIC", "STORAGE"].includes(statement[index + 1]) && statement[index + 2] === ".") {
            assert.deepEqual(statement.slice(index, index + 4), ["FROM", "STORAGE", ".", "BUCKETS"],
              "Read only catalogs and the whitelisted bucket metadata table");
          }
        }
      }
    }
  }
  assertReadOnlySql(READ_ONLY_QUERY);
  for (const mutation of [
    "INSERT INTO public.messages DEFAULT VALUES;",
    "UPDATE public.messages SET body = 'changed';",
    "DELETE FROM public.messages;",
    "TRUNCATE public.messages;",
    "ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;",
    "DROP TABLE public.messages;",
    "WITH changed AS (DELETE FROM public.messages RETURNING *) SELECT * FROM changed;",
    "SELECT 1 INTO public.audit_copy;",
    "COPY public.messages TO STDOUT;",
    "CALL public.mutate();",
    "DO $$ BEGIN DELETE FROM public.messages; END $$;",
    "SELECT * FROM storage.objects;"
  ]) {
    assert.throws(() => assertReadOnlySql(READ_ONLY_QUERY.replace("ROLLBACK;", `${mutation}\nROLLBACK;`)),
      assert.AssertionError, mutation);
  }
  assert.throws(() => assertReadOnlySql(READ_ONLY_QUERY.replace("BEGIN READ ONLY;", "BEGIN READ WRITE;")),
    assert.AssertionError);
  assert.throws(() => assertReadOnlySql(READ_ONLY_QUERY.replace("\\gset", "\\! echo forbidden")),
    assert.AssertionError);
});

test("live catalog findings distinguish observed policy problems and reject service_role", () => {
  const tables = ["public.listings", "public.messages", "public.conversations", "public.favorites", "storage.objects", "storage.buckets"]
    .map((name, index) => ({ name, oid: index + 1, rls: true, forceRls: false, owner: "schema_owner" }));
  const roles = ["anon", "authenticated"].map(name => ({
    name, superuser: false, bypassRls: false, inherit: true, createRole: false, createDb: false, replication: false
  }));
  const snapshot = {
    version: 2,
    identity: {
      name: "catalog_audit", sessionUser: "catalog_audit", auditSafe: true,
      superuser: false, bypassRls: false, createRole: false, createDb: false, replication: false
    },
    roles, memberships: [], tables,
    storageBuckets: [{
      id: "listing-photos", name: "listing-photos", public: false,
      fileSizeLimit: 10485760, allowedMimeTypes: ["image/jpeg"]
    }],
    policies: [{
      name: "open_messages", table: "public.messages", command: "SELECT",
      roles: ["authenticated"], permissive: "PERMISSIVE", unconditional: true,
      usingExpression: "true", checkExpression: null,
      usingPresent: true, checkPresent: false, ownerUsing: false, ownerCheck: false
    }, {
      name: "unverified_owner", table: "storage.objects", command: "UPDATE",
      roles: ["authenticated"], permissive: "PERMISSIVE", unconditional: false,
      usingExpression: "bucket_id = 'listing-photos'", checkExpression: "owner_id IS NOT NULL",
      usingPresent: true, checkPresent: true, ownerUsing: false, ownerCheck: false
    }],
    functions: [{ name: "public.definer_fn()", oid: 100, definer: true, owner: "schema_owner", config: [] }],
    functionGrants: [], columnGrants: [], sequenceGrants: [], sequences: [], schemaGrants: [], defaultGrants: [],
    grants: [{ grantee: "anon", table: "public.messages", privilege: "TRUNCATE", grantable: false, grantor: "schema_owner" }],
    effectiveTablePrivileges: roles.flatMap(role => tables.flatMap(table =>
      ["SELECT", "INSERT", "UPDATE", "DELETE", "TRUNCATE", "REFERENCES", "TRIGGER"].map(privilege => ({
        role: role.name, table: table.name, privilege,
        allowed: role.name === "anon" && table.name === "public.messages" && privilege === "TRUNCATE",
        columnAllowed: false, owner: false
      })))),
    effectiveFunctionPrivileges: roles.map(role => ({ role: role.name, name: "public.definer_fn()", allowed: false })),
    effectiveSequencePrivileges: [],
    effectiveSchemaPrivileges: roles.flatMap(role => ["public", "storage"].map(schema => ({
      role: role.name, schema, usage: true, create: false
    })))
  };
  const findings = inspectSnapshot(snapshot);
  const finding = prefix => {
    const result = findings.find(item => item.id.startsWith(`${prefix}-`));
    assert.ok(result, `Expected ${prefix} from a valid catalog snapshot`);
    return result;
  };
  assert.equal(finding("LIVE-POLICY-003").severity, "HIGH");
  assert.equal(finding("LIVE-POLICY-003").status, "potential");
  assert.equal(finding("LIVE-POLICY-002").severity, "HIGH");
  assert.equal(finding("LIVE-POLICY-002").status, "potential");
  assert.equal(finding("LIVE-POLICY-002").category, "Storage Security");
  assert.equal(finding("LIVE-RPC-001").severity, "HIGH");
  assert.equal(finding("LIVE-GRANT-001").severity, "HIGH");
  assert.equal(finding("LIVE-GRANT-001").status, "confirmed");
  assert.equal(finding("LIVE-STORAGE-BUCKET").status, "confirmed");
  assert.match(finding("LIVE-POLICY-003").evidence, /USING: true; WITH CHECK: \(none\)/);
  assert.equal(findings.some(item => item.id.startsWith("LIVE-CONNECTION-001-")), false);

  const rlsDisabled = structuredClone(snapshot);
  rlsDisabled.tables.find(table => table.name === "public.messages").rls = false;
  assert.ok(inspectSnapshot(rlsDisabled).some(item =>
    item.id.startsWith("LIVE-RLS-001-") && item.severity === "CRITICAL" && item.status === "confirmed"));

  const ownerMissingCheck = structuredClone(snapshot);
  ownerMissingCheck.policies[1].ownerUsing = true;
  assert.ok(inspectSnapshot(ownerMissingCheck).some(item =>
    item.id.startsWith("LIVE-POLICY-002-") && item.severity === "HIGH"));
  ownerMissingCheck.policies[1].ownerCheck = true;
  assert.equal(inspectSnapshot(ownerMissingCheck).some(item => item.id.startsWith("LIVE-POLICY-002-")), false);

  const prohibited = structuredClone(snapshot);
  prohibited.identity.name = prohibited.identity.sessionUser = "service_role";
  const rejected = inspectSnapshot(prohibited);
  assert.equal(rejected.length, 1);
  assert.ok(rejected[0].id.startsWith("LIVE-CONNECTION-001-"));
  assert.equal(rejected[0].status, "not-run");
  let commandInvoked = false;
  const live = scanLiveDatabase({
    env: { SUPABASE_READONLY_DATABASE_URL: "postgresql://service_role:synthetic@example.test/postgres",
      SUPABASE_AUDIT_ENVIRONMENT: "test" },
    commandRunner: () => { commandInvoked = true; return { status: 0, stdout: JSON.stringify(snapshot) }; }
  });
  assert.equal(commandInvoked, false, "service_role must be rejected before starting psql");
  assert.equal(live.status, "NOT_RUN");
  assert.deepEqual(live.findings, []);
});

test("GitHub Actions retains existing checks and every npm run command is declared", () => {
  const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../package.json"), "utf8"));
  const workflow = fs.readFileSync(path.resolve(__dirname, "../../.github/workflows/security-audit.yml"), "utf8");
  const commands = [...workflow.matchAll(/^\s*run:\s*npm run ([A-Za-z0-9:_-]+)/gm)].map(match => match[1]);
  assert.ok(commands.length > 0);
  for (const command of commands) assert.ok(packageJson.scripts[command], `Missing package.json script: ${command}`);
  assert.equal((workflow.match(/run: npm run security:test/g) || []).length, 4);
  assert.equal((workflow.match(/run: npm test/g) || []).length, 4);
  assert.equal((workflow.match(/run: npm run check:app/g) || []).length, 4);
  assert.match(workflow, /name: Repository Scan/);
  assert.match(workflow, /name: Supabase Scan/);
  assert.match(workflow, /name: Full Security Audit/);
  assert.match(workflow, /Check Supabase structure/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /name: Protected Production Security Audit/);
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
      assert.equal(child.status, auditStatus, child.stderr);
      assert.equal(child.stderr, "");
      assert.match(child.stdout, new RegExp(`Security scan: ${result}`));
      const report = JSON.parse(fs.readFileSync(path.join(root, "security-report.json"), "utf8"));
      assert.equal(report.result, result);
      assert.equal(report.coverage.database, "NOT_RUN");
      assert.equal(fs.readFileSync(path.join(root, "security-report.md"), "utf8"), renderMarkdown(report));
    }
  }
});
