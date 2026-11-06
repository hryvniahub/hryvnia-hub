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
  runNpmAudit = true,
  env = process.env,
  liveOptions = {}
} = {}) {
  const findings = [];
  const scannedFiles = [];
  const coverage = {
    repository: "NOT_RUN",
    authentication: "NOT_RUN",
    dependencies: "NOT_RUN",
    staticSql: "NOT_RUN",
    migrations: "NOT_RUN",
    livePostgres: "NOT_RUN",
    liveStorage: "NOT_RUN"
  };
  const reviewedSinks = [];
  const reviewedFindings = [];
  let liveAudit;
  const areaStatus = (items, fallback = "PASS") => items.some(item =>
    item.status !== "not-run" && ["CRITICAL", "HIGH"].includes(item.severity)) ? "FAIL" : fallback;

  if (mode === "repository" || mode === "full") {
    const repository = scanRepository({ root, runNpmAudit });
    findings.push(...repository.findings);
    scannedFiles.push(...repository.scannedFiles);
    reviewedSinks.push(...repository.reviewedSinks);
    reviewedFindings.push(...repository.reviewedFindings);
    coverage.repository = areaStatus(repository.findings.filter(item => item.category === "Repository Security"));
    coverage.authentication = areaStatus(repository.findings.filter(item => item.category === "Authentication"));
    const dependencyNotRun = repository.findings.some(finding => finding.category === "Dependencies" && finding.status === "not-run");
    coverage.dependencies = areaStatus(repository.findings.filter(item => item.category === "Dependencies"), dependencyNotRun ? "NOT_RUN" : "PASS");
  }

  if (mode === "supabase" || mode === "full") {
    const files = collectSqlFiles(path.resolve(root, sourceDir));
    coverage.migrations = files.length ? "PASS" : "NOT_RUN";
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
      ? scanLiveDatabase({ env, ...liveOptions })
      : {
          status: "NOT_RUN",
          findings: [],
          coverage: { livePostgres: "NOT_RUN", liveStorage: "NOT_RUN" },
          reason: "Live database inspection was not requested."
        };
    findings.push(...database.findings);
    coverage.livePostgres = database.coverage?.livePostgres || "NOT_RUN";
    coverage.liveStorage = database.coverage?.liveStorage || "NOT_RUN";
    coverage.reason = database.reason;
    liveAudit = database.metadata;
  }

  const report = createReport({
    findings,
    scannedFiles: [...new Set(scannedFiles)].sort(),
    sourceAvailable: scannedFiles.length > 0,
    coverage,
    reviewedSinks,
    reviewedFindings,
    liveAudit
  });
  const written = writeReport(report, reportDir);
  return { report, written };
}

function getRequiredCoverage(argv) {
  const command = argv[0] || "audit";
  const required = command === "repository"
    ? ["repository", "authentication", "dependencies"]
    : command === "supabase"
      ? ["staticSql", "migrations"]
      : ["repository", "authentication", "dependencies", "staticSql", "migrations"];
  if (argv.includes("--live-supabase") || argv.includes("--require-live-complete")) {
    required.push("livePostgres", "liveStorage");
  }
  return required;
}

function getExitCode(report, argv) {
  if (report.result === "FAIL") return 1;
  if (argv.includes("--require-live-complete")
    && (report.coverage.livePostgres !== "PASS" || report.coverage.liveStorage !== "PASS")) return 2;
  if (argv.includes("--require-complete")
    && getRequiredCoverage(argv).some(area => report.coverage[area] !== "PASS")) return 2;
  return 0;
}

function main(argv) {
  const command = argv[0] || "audit";
  if (!["repository", "supabase", "audit", "report"].includes(command)
    || argv.slice(1).some(argument =>
      !["--live-supabase", "--require-complete", "--require-live-complete"].includes(argument)
      && !/^--sql-dir=.+/.test(argument))
    || (command === "repository" && argv.includes("--live-supabase"))) {
    console.error("Usage: node security/cli.cjs [repository|supabase|audit|report] [--sql-dir=PATH] [--live-supabase] [--require-complete] [--require-live-complete]");
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
  console.log(`Coverage: ${report.coverageStatus}; repository: ${report.coverage.repository}; informational outcomes: ${report.informationalResults.length}; manual DOM reviews: ${report.reviewedFindings.length}`);
  console.log(`Required coverage: ${getRequiredCoverage(argv).map(area => `${area}: ${report.coverage[area]}`).join("; ")}`);
  console.log(`Reports: ${path.relative(process.cwd(), written.markdownPath)}, ${path.relative(process.cwd(), written.jsonPath)}`);
  console.log(report.coverage.reason);
  process.exitCode = getExitCode(report, argv);
  if (process.exitCode === 2) {
    const required = getRequiredCoverage(argv).filter(area =>
      argv.includes("--require-complete") || (argv.includes("--require-live-complete") && area.startsWith("live")));
    console.error(`Required coverage incomplete: ${required.filter(area =>
      report.coverage[area] !== "PASS").map(area => `${area}: ${report.coverage[area]}`).join("; ")}`);
  }
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { collectSqlFiles, getExitCode, getRequiredCoverage, main, run };
