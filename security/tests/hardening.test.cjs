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
const { createReport } = require("../reports/report.cjs");

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
    "supabase-scan": "supabase-scan",
    "full-security-audit": "full-security-audit"
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
