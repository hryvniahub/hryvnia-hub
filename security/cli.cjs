"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { analyzeSqlFiles } = require("./scanners/sql.cjs");
const { createReport, writeReport } = require("./reports/report.cjs");

function collectSqlFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...collectSqlFiles(absolute));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".sql")) files.push(absolute);
  }
  return files;
}

function run({ root = process.cwd(), sourceDir = "supabase/migrations", reportDir = root } = {}) {
  const absoluteSource = path.resolve(root, sourceDir);
  const files = collectSqlFiles(absoluteSource);
  const sqlSources = files.map(file => ({
    sql: fs.readFileSync(file, "utf8"),
    source: path.relative(root, file).split(path.sep).join("/")
  }));
  const findings = analyzeSqlFiles(sqlSources).findings;
  if (!files.length) {
    findings.push({
      id: "SCAN-001",
      severity: "INFO",
      object: sourceDir,
      description: "No SQL migration files were found in the configured source directory.",
      evidence: `${sourceDir}: source directory absent or contains no .sql files`,
      risk: "RLS, grants, RPC, and Storage definitions cannot be statically analyzed from this repository.",
      recommendation: "Add the complete Supabase migration set or provide an explicit SQL source directory for static analysis.",
      status: "not-run"
    });
  }
  const report = createReport({
    findings,
    scannedFiles: files.map(file => path.relative(root, file).split(path.sep).join("/")),
    sourceAvailable: files.length > 0
  });
  const written = writeReport(report, reportDir);
  return { report, written };
}

async function runProduction({ config = process.env, confirmation, reportDir = process.cwd(), clientFactory } = {}) {
  const { auditProduction } = require("./scanners/supabase-live.cjs");
  const report = await auditProduction({ config, confirmation, clientFactory });
  const jsonPath = path.join(reportDir, "supabase-production-report.json");
  const markdownPath = path.join(reportDir, "supabase-production-report.md");
  const lines = [
    "# Sherlock Supabase Production Metadata Audit", "",
    `**Result:** ${report.result}`, "", report.assessment, "",
    "| Component | Coverage |", "|---|---|",
    ...Object.entries(report.coverage).map(([name, status]) => `| ${name} | ${status} |`),
    "", "## Errors", "",
    ...report.errors.map(error => `- ${error.component}: ${error.reason}`), "",
    "## Findings", "",
    ...report.findings.map(finding => `- ${finding.id} (${finding.severity}): ${finding.description}`)
  ];
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  fs.writeFileSync(markdownPath, `${lines.join("\n")}\n`, { mode: 0o600 });
  return { report, written: { jsonPath, markdownPath } };
}

async function main(argv) {
  const command = argv[0] || "audit";
  if (command === "production-audit") {
    const { report } = await runProduction({ confirmation: process.env.SHERLOCK_PRODUCTION_CONFIRMATION });
    console.log(`Production metadata audit: ${report.result}; findings: ${report.findings.length}`);
    for (const error of report.errors) console.error(`${error.component}: ${error.reason}`);
    process.exitCode = report.result === "FAIL" ? 1 : report.result === "INCOMPLETE" ? 2 : 0;
    return;
  }
  if (!["audit", "report"].includes(command)) {
    console.error("Usage: node security/cli.cjs [audit|report] [--sql-dir=PATH] | production-audit");
    process.exitCode = 2;
    return;
  }
  const sqlDirArg = argv.find(argument => argument.startsWith("--sql-dir="));
  const { report, written } = run({ sourceDir: sqlDirArg?.slice("--sql-dir=".length) || "supabase/migrations" });
  console.log(`Security scan: ${report.result}`);
  console.log(`SQL files: ${report.scannedFiles.length}; findings: ${report.findings.length}`);
  console.log(`Reports: ${path.relative(process.cwd(), written.markdownPath)}, ${path.relative(process.cwd(), written.jsonPath)}`);
  console.log(report.coverage.reason);
  if (command === "audit" && report.findings.some(finding => ["CRITICAL", "HIGH"].includes(finding.severity))) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main(process.argv.slice(2)).catch(() => {
    console.error("Security scanner failed; no database error details or credentials are logged.");
    process.exitCode = 2;
  });
}

module.exports = { collectSqlFiles, run, runProduction };
