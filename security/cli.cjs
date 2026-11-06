"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { analyzeSqlFiles } = require("./scanners/sql.cjs");
const { scanRepository } = require("./scanners/repository.cjs");
const { scanLiveDatabase } = require("./scanners/supabase-live.cjs");
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

function run({
  root = process.cwd(),
  sourceDir = "supabase/migrations",
  reportDir = root,
  mode = "full",
  live = false,
  runNpmAudit = true
} = {}) {
  const absoluteSource = path.resolve(root, sourceDir);
  const files = collectSqlFiles(absoluteSource);
  const findings = [];
  const scannedFiles = [];
  const coverage = {};
  const reviewedSinks = [];
  const areaStatus = (items, fallback = "PASS") => items.some(item =>
    item.status !== "not-run" && ["CRITICAL", "HIGH"].includes(item.severity)) ? "FAIL" : fallback;

  if (mode === "repository" || mode === "full") {
    const repository = scanRepository({ root, runNpmAudit });
    findings.push(...repository.findings);
    scannedFiles.push(...repository.scannedFiles);
    reviewedSinks.push(...repository.reviewedSinks);
    coverage.repository = areaStatus(repository.findings.filter(item => item.category === "Repository Security"));
    coverage.authentication = areaStatus(repository.findings.filter(item => item.category === "Authentication"));
    const dependencyNotRun = repository.findings.some(finding => finding.category === "Dependencies" && finding.status === "not-run");
    coverage.dependencies = areaStatus(repository.findings.filter(item => item.category === "Dependencies"), dependencyNotRun ? "NOT_RUN" : "PASS");
  }

  if (mode === "supabase" || mode === "full") {
    const sqlSources = files.map(file => ({
      sql: fs.readFileSync(file, "utf8"),
      source: path.relative(root, file).split(path.sep).join("/")
    }));
    findings.push(...analyzeSqlFiles(sqlSources).findings.map(finding => ({
      ...finding,
      category: finding.category || (finding.object?.startsWith("storage.") || finding.object?.startsWith("storage/") ? "Storage Security" : "SQL/RLS")
    })));
    scannedFiles.push(...sqlSources.map(item => item.source));
    coverage.staticSql = areaStatus(findings.filter(item => ["SQL/RLS", "Storage Security"].includes(item.category)), files.length ? "PASS" : "NOT_RUN");
    if (!files.length) {
      findings.push({
        id: "SCAN-001",
        category: "SQL/RLS",
        severity: "INFO",
        object: sourceDir,
        description: "No SQL migration files were found in the configured source directory.",
        evidence: `${sourceDir}: source directory absent or contains no .sql files`,
        risk: "RLS, grants, RPC, and Storage definitions cannot be statically analyzed from this repository.",
        recommendation: "Add the complete Supabase migration set or provide an explicit SQL source directory for static analysis.",
        status: "not-run"
      });
    }

    const database = live
      ? scanLiveDatabase()
      : { status: "NOT_RUN", findings: [], reason: "Live database inspection was not requested." };
    findings.push(...database.findings);
    coverage.database = database.status;
    coverage.storage = areaStatus(findings.filter(item => item.category === "Storage Security"),
      database.status === "PASS" ? "PASS" : files.length ? "PASS" : "NOT_RUN");
    coverage.reason = database.reason;
  }

  const report = createReport({
    findings,
    scannedFiles: [...new Set(scannedFiles)].sort(),
    sourceAvailable: scannedFiles.length > 0,
    coverage,
    reviewedSinks
  });
  const written = writeReport(report, reportDir);
  return { report, written };
}

function main(argv) {
  const command = argv[0] || "audit";
  if (!["repository", "supabase", "audit", "report"].includes(command)
    || argv.slice(1).some(argument => !["--live-supabase", "--require-complete"].includes(argument) && !/^--sql-dir=.+/.test(argument))
    || (command === "repository" && argv.includes("--live-supabase"))) {
    console.error("Usage: node security/cli.cjs [repository|supabase|audit|report] [--sql-dir=PATH] [--live-supabase] [--require-complete]");
    process.exitCode = 2;
    return;
  }
  const sqlDirArg = argv.find(argument => argument.startsWith("--sql-dir="));
  const { report, written } = run({
    sourceDir: sqlDirArg?.slice("--sql-dir=".length) || "supabase/migrations",
    mode: command === "repository" || command === "supabase" ? command : "full",
    live: argv.includes("--live-supabase")
  });
  console.log(`Security scan: ${report.result}`);
  console.log(`Files: ${report.scannedFiles.length}; findings: ${report.findings.length}`);
  console.log(`Reports: ${path.relative(process.cwd(), written.markdownPath)}, ${path.relative(process.cwd(), written.jsonPath)}`);
  console.log(report.coverage.reason);
  if (report.result === "FAIL") process.exitCode = 1;
  else if (argv.includes("--require-complete") && report.result === "NOT_RUN") process.exitCode = 2;
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { collectSqlFiles, main, run };
