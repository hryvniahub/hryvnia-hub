"use strict";

const fs = require("node:fs");
const path = require("node:path");

const CATEGORIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

function createReport({ findings, scannedFiles, sourceAvailable, generatedAt = new Date().toISOString() }) {
  const blocking = findings.some(finding => finding.severity === "CRITICAL" || finding.severity === "HIGH");
  const result = blocking ? "FAIL" : sourceAvailable ? "PASS" : "INCOMPLETE";
  const counts = Object.fromEntries(CATEGORIES.map(category => [
    category,
    findings.filter(finding => finding.severity === category).length
  ]));
  return {
    generatedAt,
    result,
    assessment: "Static repository analysis only; PASS does not establish that Supabase is secure.",
    scannedFiles,
    counts,
    coverage: {
      staticSql: sourceAvailable ? "PARTIAL" : "NOT_RUN",
      rls: sourceAvailable ? "STATIC_ONLY" : "NOT_RUN",
      grants: sourceAvailable ? "STATIC_ONLY" : "NOT_RUN",
      rpc: sourceAvailable ? "STATIC_ONLY" : "NOT_RUN",
      storage: sourceAvailable ? "STATIC_ONLY" : "NOT_RUN",
      databaseScenarios: "NOT_RUN",
      reason: sourceAvailable
        ? "No database connection was made. Runtime roles, effective privileges, deployed policies, and live Storage configuration were not checked."
        : "No SQL migration files were found in the configured source directory; database and schema checks were not run."
    },
    findings
  };
}

function renderMarkdown(report) {
  const lines = [
    "# Hryvnia Hub Security Report",
    "",
    `- **Result:** ${report.result}`,
    `- **Generated:** ${report.generatedAt}`,
    `- **Assessment:** ${report.assessment}`,
    `- **SQL files scanned:** ${report.scannedFiles.length}`,
    "",
    "## Coverage",
    "",
    "| Check | Status |",
    "|---|---|",
    ...Object.entries(report.coverage).map(([name, value]) => `| ${name} | ${String(value).replace(/\|/g, "\\|")} |`),
    "",
    "## Findings",
    "",
    "| Severity | Count |",
    "|---|---:|",
    ...Object.entries(report.counts).map(([severity, count]) => `| ${severity} | ${count} |`),
    ""
  ];

  if (!report.findings.length) {
    lines.push("No static findings were generated. This is not evidence that deployed Supabase configuration is secure.", "");
  } else {
    for (const finding of report.findings) {
      lines.push(
        `### ${finding.id} — ${finding.severity}`,
        "",
        `- **Database object:** ${finding.object}`,
        `- **Status:** ${finding.status}`,
        `- **Description:** ${finding.description}`,
        `- **Evidence:** ${finding.evidence}`,
        `- **Potential risk:** ${finding.risk}`,
        `- **Recommendation:** ${finding.recommendation}`,
        ""
      );
    }
  }
  return `${lines.join("\n")}\n`;
}

function writeReport(report, directory) {
  const markdownPath = path.join(directory, "security-report.md");
  const jsonPath = path.join(directory, "security-report.json");
  fs.writeFileSync(markdownPath, renderMarkdown(report), { mode: 0o600 });
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  return { markdownPath, jsonPath };
}

module.exports = { createReport, renderMarkdown, writeReport };
