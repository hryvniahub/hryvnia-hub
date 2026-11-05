"use strict";

const fs = require("node:fs");
const path = require("node:path");

const CATEGORIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
const SECTIONS = [
  "Repository Security",
  "Supabase Database Security",
  "Storage Security",
  "Dependencies",
  "Authentication",
  "SQL/RLS"
];

function createReport({
  findings,
  scannedFiles = [],
  sourceAvailable = scannedFiles.length > 0,
  coverage = {},
  generatedAt = new Date().toISOString()
}) {
  const blocking = findings.some(finding =>
    finding.status !== "not-run" && (finding.severity === "CRITICAL" || finding.severity === "HIGH")
  );
  const statuses = Object.values(coverage).filter(value => typeof value === "string" && ["PASS", "FAIL", "NOT_RUN"].includes(value));
  const ran = statuses.some(value => value === "PASS" || value === "FAIL") || sourceAvailable;
  const result = blocking ? "FAIL" : ran && statuses.includes("NOT_RUN") ? "NOT_RUN" : ran ? "PASS" : "NOT_RUN";
  findings.sort((left, right) =>
    CATEGORIES.indexOf(left.severity) - CATEGORIES.indexOf(right.severity) || left.id.localeCompare(right.id)
  );
  const counts = Object.fromEntries(CATEGORIES.map(category => [
    category,
    findings.filter(finding => finding.severity === category).length
  ]));
  const categoryCounts = Object.fromEntries(SECTIONS.map(section => [
    section,
    findings.filter(finding => finding.category === section).length
  ]));
  return {
    generatedAt,
    result,
    assessment: "Static findings are potential risks, not confirmed vulnerabilities. Live database findings are based on read-only catalog metadata; PASS is not a guarantee of security.",
    scannedFiles,
    counts,
    categoryCounts,
    coverage: {
      repository: coverage.repository || (sourceAvailable ? "PASS" : "NOT_RUN"),
      dependencies: coverage.dependencies || "NOT_RUN",
      staticSql: coverage.staticSql || "NOT_RUN",
      database: coverage.database || "NOT_RUN",
      storage: coverage.storage || "NOT_RUN",
      authentication: coverage.authentication || (sourceAvailable ? "PASS" : "NOT_RUN"),
      reason: coverage.reason || "Live database inspection is disabled unless an explicit read-only database URL is supplied."
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
    `- **Files scanned:** ${report.scannedFiles.length}`,
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

  for (const section of SECTIONS) {
    const findings = report.findings.filter(finding => finding.category === section);
    lines.push(`## ${section}`, "");
    if (!findings.length) {
      lines.push("No findings were generated for this section.", "");
      continue;
    }
    for (const finding of findings) {
      lines.push(
        `### ${finding.id} — ${finding.severity}`,
        "",
        `- **Status:** ${finding.status === "confirmed" ? "CONFIRMED" : finding.status === "not-run" ? "NOT_RUN" : "POTENTIAL"}`,
        `- **Object:** ${finding.object}`,
        `- **Description:** ${finding.description}`,
        `- **Evidence:** ${finding.evidence}`,
        `- **Risk:** ${finding.risk}`,
        `- **Recommendation:** ${finding.recommendation}`,
        ""
      );
    }
  }
  if (!report.findings.length) {
    lines.push("No findings were generated. This is not evidence that deployed Supabase configuration is secure.", "");
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

module.exports = { CATEGORIES, SECTIONS, createReport, renderMarkdown, writeReport };
