"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { test } = require("node:test");
const YAML = require("yaml");
const { scanJavaScript, scanHtml } = require("../scanners/javascript.cjs");
const { scanRepository } = require("../scanners/repository.cjs");
const { createReport, renderMarkdown } = require("../reports/report.cjs");

const app = fs.readFileSync(path.resolve(__dirname, "../../app.js"), "utf8");
const escaper = app.slice(app.indexOf("function escapeHtml("), app.indexOf("\nconst LISTING_RATES_KEY"));
const scan = code => scanJavaScript(code, "fixture.tsx");
const high = code => scan(code).findings.filter(item => item.severity === "HIGH");

test("AST ignores comments, regex and fixture strings, but never excludes executable test code", () => {
  const result = scan('// node.innerHTML = input;\nconst fixture = "node.innerHTML = input;";\nnode.innerHTML = input;');
  assert.deepEqual(result.findings.map(item => [item.line, item.rule, item.severity]), [[3, "XSS-001", "HIGH"]]);
});

test("JS/TS detects multiline, computed and compound DOM sinks without trusting suppression comments", () => {
  for (const code of [
    'el["innerHTML"] =\n location.hash;',
    "el.innerHTML += input;",
    "el.outerHTML = input;",
    'el.insertAdjacentHTML("beforeend", input);',
    "document.write(input);",
    "el.srcdoc = input;",
    "eval(input);",
    "new Function(input);",
    'el.setAttribute("onclick", input);',
    "range.createContextualFragment(input);",
    "// security-ignore HIGH\nconst el: HTMLElement = node;\nel.innerHTML = input;",
    "const render = () => <div/>;\nnode.innerHTML = input;"
  ]) assert.ok(high(code).length > 0, code);
});

test("constant HTML and exact locally verified escaper do not raise a false alarm", () => {
  for (const code of [
    'node.innerHTML = "";',
    'node.innerHTML = `<span>static</span>`;',
    escaper + '\nnode.innerHTML = `<p>${escapeHtml(input)}</p>`;',
    escaper + '\nnode.innerHTML = `<p title="${escapeHtml(input)}">hello</p>`;'
  ]) {
    assert.deepEqual(high(code), [], code);
    assert.equal(scan(code).reviewedSinks.length, 1);
  }
});

test("sanitizer names, shadowing, reassignment, contexts and split markup cannot hide HIGH", () => {
  for (const code of [
    'function escapeHtml(x) { return x; }\nnode.innerHTML = escapeHtml(input);',
    escaper + '\nfunction render(escapeHtml) { node.innerHTML = escapeHtml(input); }',
    escaper + '\nescapeHtml = x => x;\nnode.innerHTML = escapeHtml(input);',
    escaper + '\nconst String = x => x;\nnode.innerHTML = escapeHtml(input);',
    escaper + '\nnode.innerHTML = `<a href="${escapeHtml(input)}">link</a>`;',
    escaper + '\nnode.innerHTML = `<p onclick="${escapeHtml(input)}">hello</p>`;',
    escaper + '\nnode.innerHTML = `<p onclick="x > ${escapeHtml(input)}">hello</p>`;',
    escaper + '\nnode.innerHTML = `<p title=${escapeHtml(input)}>hello</p>`;',
    escaper + '\nnode.innerHTML = `<script>${escapeHtml(input)}</script>`;',
    escaper + '\nnode.innerHTML = `${flag ? \'<p onclick="\' : ""}${escapeHtml(input)}">`;',
    escaper + '\n(function escapeHtml() { node.innerHTML = escapeHtml(input); })();',
    escaper + '\nString.prototype.replace = function() { return this; };\nnode.innerHTML = escapeHtml(input);',
    escaper + '\nnode.innerHTML = `<meta http-equiv="refresh" content="${escapeHtml(input)}">`;',
    escaper + '\nwith (attacker) { node.innerHTML = escapeHtml(input); }'
  ]) assert.ok(high(code).length > 0, code);
});

test("HTML inline JS preserves offsets and string fixtures do not become script", () => {
  const result = scanHtml('<html>\n<script>\nconst s = "x.innerHTML = input";\nx.innerHTML = input;\n</script>', "index.html");
  assert.deepEqual(result.findings.map(item => [item.line, item.rule]), [[4, "XSS-001"]]);
});

test("HTML inline JS accepts browser script end tags without losing sinks or authentication signals", () => {
  for (const closing of [
    "</script\t\n bar>",
    "</ScRiPt bar>",
    "</SCRIPT/>",
    "</script\f\r bar=value>",
    '</script data-note="quoted > value">',
    "</script data-note='quoted > value'>",
    '</script data-note = "quoted > value"other=value>',
    '</script bare"quote>',
    '</script bar=bare"quote>'
  ]) {
    const result = scanHtml(`<html>\n<ScRiPt>\nx.innerHTML = input;\nconst db = createClient(url, key);\ndb.update(payload);\n${closing}`, "index.html");
    assert.deepEqual(result.findings.map(item => [item.line, item.rule]), [[3, "XSS-001"]], closing);
    assert.deepEqual(result.authSignals, { client: true, writes: true, getUser: false }, closing);
  }
});

test("HTML script end-tag attributes cannot inject scanned scripts or swallow following scripts", () => {
  for (const closing of [
    '</script data-note="> <script>db.auth.getUser();</script>">',
    "</ScRiPt data-note='> <script>db.auth.getUser();</script>'>",
    '</script bare"quote>'
  ]) {
    const html = `<script>const db = createClient(url, key); db.update(payload);${closing}\n<script>x.innerHTML = input;</script>`;
    const result = scanHtml(html, "index.html");
    assert.deepEqual(result.findings.map(item => [item.line, item.rule]), [[2, "XSS-001"]], closing);
    assert.deepEqual(result.authSignals, { client: true, writes: true, getUser: false }, closing);
  }
  for (const closing of ["</scripture>", "</script\u00a0>", '</script data-note="unterminated >']) {
    const result = scanHtml(`<script>x.innerHTML = input;${closing}`, "index.html");
    assert.deepEqual(result.findings, [], closing);
    assert.deepEqual(result.authSignals, { client: false, writes: false, getUser: false }, closing);
  }
});

function reviewedRepository(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "security-review-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "app.js"), app);
  fs.copyFileSync(path.resolve(__dirname, "../../index.html"), path.join(root, "index.html"));
  return root;
}

test("manual DOM dispositions bind exact finding identity and whole source/template content", t => {
  const root = reviewedRepository(t);
  const result = scanRepository({ root, runNpmAudit: false });
  const unproven = scanJavaScript(app, "app.js").findings;
  assert.equal(result.reviewedFindings.length, 36);
  assert.equal(result.findings.filter(item => /^XSS-/.test(item.id)).length, 0);
  for (const finding of unproven) {
    const review = result.reviewedFindings.find(item =>
      item.file === "app.js" && item.rule === finding.rule && item.line === finding.line
      && item.contextHash === finding.contextHash);
    assert.ok(review, `${finding.rule}:${finding.line}`);
    assert.ok(review.reason.length > 50);
    assert.deepEqual(Object.keys(review.sourceHashes).sort(), ["app.js", "index.html"]);
  }
  const report = createReport({ findings: result.findings, reviewedFindings: result.reviewedFindings });
  assert.match(renderMarkdown(report), /Manually reviewed DOM findings/);
  assert.match(renderMarkdown(report), /not AST proofs/);
  assert.equal(report.reviewedFindings.length, 36);
});

test("new and changed genuine sinks and changed helpers/templates fail closed", t => {
  const root = reviewedRepository(t);
  for (const changed of [
    app + "\nnode.innerHTML = location.hash;",
    app.replace("button.innerHTML = button.dataset.originalHtml;", "button.innerHTML = location.hash;"),
    app.replace(escaper, 'function escapeHtml(value = "") { return String(value); }\n')
  ]) {
    assert.notEqual(changed, app);
    fs.writeFileSync(path.join(root, "app.js"), changed);
    const result = scanRepository({ root, runNpmAudit: false });
    assert.equal(result.reviewedFindings.length, 0);
    assert.ok(result.findings.some(item => item.id.startsWith("XSS-001") && item.severity === "HIGH"));
    assert.equal(createReport({ findings: result.findings }).result, "FAIL");
  }
  fs.writeFileSync(path.join(root, "app.js"), app);
  fs.appendFileSync(path.join(root, "index.html"), "\n<!-- template changed -->");
  const result = scanRepository({ root, runNpmAudit: false });
  assert.equal(result.reviewedFindings.length, 0);
  assert.equal(result.findings.filter(item => /^XSS-/.test(item.id)).length, 36);
});

test("reviewed application never suppresses executable test sinks or private assignments", t => {
  const root = reviewedRepository(t);
  fs.mkdirSync(path.join(root, "tests"));
  fs.writeFileSync(path.join(root, "tests/check.cjs"),
    'node.innerHTML = location.hash;\n' + "SUPABASE_SERVICE_ROLE_KEY" + ' = "' + "x".repeat(24) + '";');
  const result = scanRepository({ root, runNpmAudit: false });
  assert.equal(result.reviewedFindings.length, 36);
  for (const rule of ["XSS-001", "SECRET-005"]) {
    assert.ok(result.findings.some(item => item.object === "tests/check.cjs" && item.id.startsWith(rule) && item.severity === "HIGH"));
  }
});

test("authentication signal ignores fixture strings/comments but retains executable test writes", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "security-auth-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const calls = 'const db = window.supabase.createClient(url, key);\ndb.from("listings").update(payload);';
  fs.writeFileSync(path.join(root, "test.cjs"), `const fixture = ${JSON.stringify(calls)};\n/* ${calls} */`);
  assert.ok(!scanRepository({ root, runNpmAudit: false }).findings.some(item => item.id.startsWith("AUTH-001")));
  fs.appendFileSync(path.join(root, "test.cjs"), "\n" + calls);
  assert.ok(scanRepository({ root, runNpmAudit: false }).findings.some(item => item.id.startsWith("AUTH-001")));
});

test("successful INFO audit outcome stays visible without vulnerability counts or hiding coverage", () => {
  const report = createReport({
    findings: [
      { id: "DEPS-003", severity: "INFO", category: "Dependencies", status: "informational",
        description: "npm audit reported no known dependency vulnerabilities.", evidence: "zero vulnerabilities", risk: "Not a security guarantee." },
      { id: "NPM-example", severity: "LOW", category: "Dependencies", status: "confirmed" }
    ],
    coverage: { repository: "PASS", dependencies: "PASS", migrations: "NOT_RUN", staticSql: "NOT_RUN" }
  });
  assert.equal(report.counts.INFO, 0);
  assert.equal(report.counts.LOW, 1);
  assert.equal(report.categoryCounts.Dependencies, 1);
  assert.equal(report.informationalResults.length, 1);
  assert.equal(report.findings.length, 1);
  assert.equal(report.coverage.repository, "PASS");
  assert.equal(report.coverageStatus, "INCOMPLETE");
  assert.equal(report.result, "NOT_RUN");
  assert.match(renderMarkdown(report), /npm audit reported no known dependency vulnerabilities/);
  assert.match(renderMarkdown(report), /repository PASS does not establish database or Storage security/);
  const blocking = createReport({
    findings: [{ id: "DEPS-003", category: "Dependencies", severity: "HIGH", status: "informational" }]
  });
  assert.equal(blocking.result, "FAIL");
  assert.equal(blocking.counts.HIGH, 1);
  assert.equal(blocking.informationalResults.length, 0);
});

test("editing a test fixture cannot remove HIGH from executable code", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "security-invariant-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "tests"));
  fs.writeFileSync(path.join(root, "app.ts"), "node.innerHTML = location.hash;");
  for (const fixture of ['"node.innerHTML = input";', '"safe";', "node.innerHTML = attacker;"]) {
    fs.writeFileSync(path.join(root, "tests/check.cjs"), fixture);
    const result = scanRepository({ root, runNpmAudit: false });
    assert.ok(result.findings.some(item => item.object === "app.ts" && item.severity === "HIGH"));
    assert.equal(createReport({ findings: result.findings }).result, "FAIL");
  }
});

test("secrets cover dot-env and files above the old size cutoff, without leaking evidence", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "security-secrets-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const token = "sb_secret_" + "a".repeat(24);
  fs.writeFileSync(path.join(root, ".env.local"), `KEY=${token}`);
  fs.writeFileSync(path.join(root, "large.json"), " ".repeat(1024 * 1024 + 1) + JSON.stringify({ key: token }));
  const { findings } = scanRepository({ root, runNpmAudit: false });
  assert.equal(findings.filter(item => item.severity === "CRITICAL").length, 2);
  assert.ok(!JSON.stringify(findings).includes(token));
});

test("workflow actually schedules all mandatory jobs on push, PR and schedule without dependencies", () => {
  const raw = fs.readFileSync(path.resolve(__dirname, "../../.github/workflows/security-audit.yml"), "utf8");
  const workflow = YAML.parse(raw);
  assert.deepEqual(workflow.permissions, { contents: "read" });
  for (const event of ["push", "pull_request"]) {
    assert.ok(Object.hasOwn(workflow.on, event));
    assert.equal(workflow.on[event], null, "No paths/branches filter may suppress mandatory checks");
  }
  const expected = {
    "repository-scan": "repository-scan",
    "supabase-scan": "supabase-scan"
  };
  for (const [id, mode] of Object.entries(expected)) {
    const job = workflow.jobs[id];
    assert.ok(!job.needs, "Failure of one scan must not skip the others");
    const expression = job.if;
    for (const event of ["push", "pull_request", "schedule"]) {
      // These small expressions are a fixed grammar, not eval of workflow code.
      assert.ok(expression.startsWith("github.event_name != 'workflow_dispatch' ||"), `${event}: ${id}`);
    }
    assert.ok(expression.includes(`inputs.mode == '${mode}'`));
    assert.ok(!job["continue-on-error"]);
    assert.ok(job.steps.some(step => step.run === "npm ci --ignore-scripts"));
    assert.ok(job.steps.some(step => step.run?.includes(`security:${id === "full-security-audit" ? "audit" : id.split("-")[0]} -- --require-complete`)));
    assert.ok(!job.steps.some(step => step["continue-on-error"]));
    for (const step of job.steps.filter(step => step.uses)) assert.match(step.uses, /@[a-f0-9]{40}$/);
    assert.ok(!JSON.stringify(job).includes("secrets."));
  }
  const fullJob = workflow.jobs["full-security-audit"];
  assert.equal(fullJob.if, "github.event_name != 'workflow_dispatch'");
  assert.ok(fullJob.steps.some(step => step.run?.includes("security:audit -- --require-complete")));
  const productionJob = workflow.jobs["production-audit"];
  assert.equal(productionJob.if,
    "github.event_name == 'workflow_dispatch' && inputs.mode == 'full-security-audit' && github.ref == 'refs/heads/security-scanner-full-audit'");
  assert.equal(productionJob.environment.name, "supabase-production-audit");
  assert.ok(!productionJob.needs);
  const productionScan = productionJob.steps.find(step => step.name === "Run full audit with protected Production inspection");
  assert.equal(productionScan.env.SUPABASE_AUDIT_ENVIRONMENT, "production");
  assert.equal(productionScan.env.SUPABASE_READONLY_DATABASE_URL, "${{ secrets.SUPABASE_READONLY_DATABASE_URL }}");
  assert.ok(productionScan.run.includes("--live-supabase --require-live-complete"));
  assert.equal(productionJob.steps.filter(step => JSON.stringify(step).includes("SUPABASE_READONLY_DATABASE_URL")).length, 1);
  assert.deepEqual(workflow.on.workflow_dispatch.inputs.production_confirmation.type, "string");
  assert.ok(workflow.on.workflow_dispatch.inputs.production_confirmation.description.includes("PRODUCTION <expected-host>/<expected-database>"));
  assert.ok(!JSON.stringify(Object.fromEntries(Object.entries(workflow.jobs).filter(([id]) => id !== "production-audit"))).includes("secrets."));
  assert.ok(!raw.includes("pull_request_target"));
});

test("NOT_RUN cannot be represented as PASS or a successful required CLI scan", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "security-notrun-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const cli = path.resolve(__dirname, "../cli.cjs");
  const child = spawnSync(process.execPath, [cli, "supabase", "--require-complete"], { cwd: root, encoding: "utf8" });
  assert.equal(child.status, 2);
  const report = JSON.parse(fs.readFileSync(path.join(root, "security-report.json")));
  assert.equal(report.result, "NOT_RUN");
  assert.equal(report.coverage.database, "NOT_RUN");
  assert.equal(report.coverage.staticSql, "NOT_RUN");
  const liveChild = spawnSync(process.execPath, [cli, "supabase", "--require-live-complete"], { cwd: root, encoding: "utf8" });
  assert.equal(liveChild.status, 2);
});

test("every CLI mode including report preserves HIGH as FAIL with nonzero exit", t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "security-exit-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "unsafe.ts"), "node.innerHTML = location.hash;");
  fs.mkdirSync(path.join(root, "supabase/migrations"), { recursive: true });
  fs.writeFileSync(path.join(root, "supabase/migrations/001.sql"), "ALTER ROLE anon BYPASSRLS;");
  const cli = path.resolve(__dirname, "../cli.cjs");
  for (const mode of ["repository", "supabase", "audit", "report"]) {
    const child = spawnSync(process.execPath, [cli, mode], { cwd: root, encoding: "utf8" });
    assert.equal(child.status, 1, mode);
    assert.match(child.stdout, /Security scan: FAIL/);
  }
  assert.equal(spawnSync(process.execPath, [cli, "audit", "--unknown"], { cwd: root }).status, 2);
});
