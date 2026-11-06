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

function escapeMarkdown(value) {
  return String(value)
    .replace(/\r\n?|\n|\u2028|\u2029/g, "\n")
    .replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, "\\$&")
    .replace(/\n/g, "<br>");
}

function createReport({
  findings,
  scannedFiles = [],
  sourceAvailable = scannedFiles.length > 0,
  coverage = {},
  reviewedSinks = [],
  liveAudit = null,
  generatedAt = new Date().toISOString()
}) {
  const blocking = Object.values(coverage).includes("FAIL") || findings.some(finding =>
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
      dependencies: coverage.dependencies || "NOT_RUN",
      staticSql: coverage.staticSql || "NOT_RUN",
      repository: coverage.repository || (sourceAvailable ? "PASS" : "NOT_RUN"),
      livePostgres: coverage.livePostgres || coverage.database || "NOT_RUN",
      liveStorage: coverage.liveStorage || coverage.storage || "NOT_RUN",
      migrations: coverage.migrations || (sourceAvailable ? "PASS" : "NOT_RUN"),
      database: coverage.livePostgres || coverage.database || "NOT_RUN",
      storage: coverage.liveStorage || coverage.storage || "NOT_RUN",
      authentication: coverage.authentication || (sourceAvailable ? "PASS" : "NOT_RUN"),
      reason: coverage.reason || "Live database inspection is disabled unless an explicit read-only database URL is supplied."
    },
    reviewedSinks,
    liveAudit,
    findings
  };
}

function renderMarkdown(report) {
  const lines = [
    "# Hryvnia Hub Security Report",
    "",
    `- **Result:** ${escapeMarkdown(report.result)}`,
    `- **Generated:** ${escapeMarkdown(report.generatedAt)}`,
    `- **Assessment:** ${escapeMarkdown(report.assessment)}`,
    `- **Files scanned:** ${escapeMarkdown(report.scannedFiles.length)}`,
    "",
    "## Coverage",
    "",
    "| Check | Status |",
    "|---|---|",
    ...Object.entries(report.coverage).map(([name, value]) => `| ${escapeMarkdown(name)} | ${escapeMarkdown(value)} |`),
    "",
    "## Findings",
    "",
    "| Severity | Count |",
    "|---|---:|",
    ...Object.entries(report.counts).map(([severity, count]) => `| ${escapeMarkdown(severity)} | ${escapeMarkdown(count)} |`),
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
        `### ${escapeMarkdown(finding.id)} — ${escapeMarkdown(finding.severity)}`,
        "",
        `- **Status:** ${finding.status === "confirmed" ? "CONFIRMED" : finding.status === "not-run" ? "NOT_RUN" : "POTENTIAL"}`,
        `- **Object:** ${escapeMarkdown(finding.object)}`,
        `- **Description:** ${escapeMarkdown(finding.description)}`,
        `- **Evidence:** ${escapeMarkdown(finding.evidence)}`,
        `- **Risk:** ${escapeMarkdown(finding.risk)}`,
        `- **Recommendation:** ${escapeMarkdown(finding.recommendation)}`,
        ""
      );
    }
  }
  if (!report.findings.length) {
    lines.push("No findings were generated. This is not evidence that deployed Supabase configuration is secure.", "");
  }
  lines.push("## Statically verified DOM sinks", "",
    "These are not suppressed findings: the AST established constant markup or the exact local HTML escaper in a supported context. Unknown flows remain HIGH.", "",
    "| File | Line | Rule | Reason |", "|---|---:|---|---|",
    ...(report.reviewedSinks || []).map(item => `| ${escapeMarkdown(item.file)} | ${escapeMarkdown(item.line)} | ${escapeMarkdown(item.rule)} | ${escapeMarkdown(item.reason)} |`), "");
  if (report.liveAudit) {
    const audit = report.liveAudit;
    lines.push("## Live PostgreSQL metadata", "",
      `- **Database:** ${escapeMarkdown(audit.database)}`,
      `- **Audit role:** ${escapeMarkdown(audit.role)}`,
      "",
      "### Roles",
      "",
      ...(audit.roles || []).map(role => `- ${escapeMarkdown(role.name)}: superuser=${escapeMarkdown(role.superuser)}, bypassRls=${escapeMarkdown(role.bypassRls)}, inherit=${escapeMarkdown(role.inherit)}, createRole=${escapeMarkdown(role.createRole)}, createDb=${escapeMarkdown(role.createDb)}, replication=${escapeMarkdown(role.replication)}`),
      "",
      "### Role memberships",
      "",
      ...(audit.memberships || []).map(item => `- ${escapeMarkdown(item.member)} → ${escapeMarkdown(item.role)} (inherit=${escapeMarkdown(item.inherit)}, admin=${escapeMarkdown(item.admin)})`),
      "",
      "### Tables and RLS",
      "",
      ...(audit.tables || []).map(item => `- ${escapeMarkdown(item.name)}: RLS=${escapeMarkdown(item.rls)}, FORCE RLS=${escapeMarkdown(item.forceRls)}, owner=${escapeMarkdown(item.owner)}`),
      "",
      "### Policies",
      "",
      ...(audit.policies || []).map(item => `- **${escapeMarkdown(item.table)} / ${escapeMarkdown(item.name)}** (${escapeMarkdown(item.command)}, ${escapeMarkdown(item.permissive)}, roles=${escapeMarkdown((item.roles || []).join(", "))})<br>USING: ${escapeMarkdown(item.usingExpression ?? "(none)")}<br>WITH CHECK: ${escapeMarkdown(item.checkExpression ?? "(none)")}`),
      "",
      "### Table ACL",
      "",
      ...(audit.grants || []).map(item => `- ${escapeMarkdown(item.grantee)} → ${escapeMarkdown(item.table)}: ${escapeMarkdown(item.privilege)} (grantable=${escapeMarkdown(item.grantable)}, grantor=${escapeMarkdown(item.grantor)})`),
      "",
      "### Column ACL",
      "",
      ...(audit.columnGrants || []).map(item => `- ${escapeMarkdown(item.grantee)} → ${escapeMarkdown(item.table)}.${escapeMarkdown(item.column)}: ${escapeMarkdown(item.privilege)} (grantable=${escapeMarkdown(item.grantable)}, grantor=${escapeMarkdown(item.grantor)})`),
      "",
      "### Schema ACL",
      "",
      ...(audit.schemaGrants || []).map(item => `- ${escapeMarkdown(item.grantee)} → ${escapeMarkdown(item.name)}: ${escapeMarkdown(item.privilege)} (grantable=${escapeMarkdown(item.grantable)}, grantor=${escapeMarkdown(item.grantor)})`),
      "",
      "### Default ACL",
      "",
      ...(audit.defaultGrants || []).map(item => `- ${escapeMarkdown(item.owner)} (${escapeMarkdown(item.schema)}/${escapeMarkdown(item.objectType)}) → ${escapeMarkdown(item.grantee)}: ${escapeMarkdown(item.privilege)} (grantable=${escapeMarkdown(item.grantable)}, grantor=${escapeMarkdown(item.grantor)})`),
      "",
      "### Sequence ACL",
      "",
      ...(audit.sequenceGrants || []).map(item => `- ${escapeMarkdown(item.grantee)} → ${escapeMarkdown(item.name)}: ${escapeMarkdown(item.privilege)} (grantable=${escapeMarkdown(item.grantable)}, grantor=${escapeMarkdown(item.grantor)})`),
      "",
      "### Functions and function ACL",
      "",
      ...(audit.functions || []).map(item => `- ${escapeMarkdown(item.name)}: SECURITY DEFINER=${escapeMarkdown(item.definer)}, owner=${escapeMarkdown(item.owner)}, config=${escapeMarkdown((item.config || []).join(", ") || "(none)")}`),
      ...(audit.functionGrants || []).map(item => `- ${escapeMarkdown(item.grantee)} → ${escapeMarkdown(item.name)}: EXECUTE (grantable=${escapeMarkdown(item.grantable)}, grantor=${escapeMarkdown(item.grantor)})`),
      "",
      "### Effective privileges",
      "",
      ...(audit.effectiveTablePrivileges || []).filter(item => item.allowed || item.columnAllowed || item.owner)
        .map(item => `- ${escapeMarkdown(item.role)} → ${escapeMarkdown(item.table)}: ${escapeMarkdown(item.privilege)} (allowed=${escapeMarkdown(item.allowed)}, column=${escapeMarkdown(item.columnAllowed)}, owner=${escapeMarkdown(item.owner)})`),
      ...(audit.effectiveFunctionPrivileges || []).filter(item => item.allowed)
        .map(item => `- ${escapeMarkdown(item.role)} → ${escapeMarkdown(item.name)}: EXECUTE`),
      ...(audit.effectiveSchemaPrivileges || []).filter(item => item.usage || item.create)
        .map(item => `- ${escapeMarkdown(item.role)} → schema ${escapeMarkdown(item.schema)}: USAGE=${escapeMarkdown(item.usage)}, CREATE=${escapeMarkdown(item.create)}`),
      ...(audit.effectiveSequencePrivileges || []).filter(item => item.usage || item.select || item.update)
        .map(item => `- ${escapeMarkdown(item.role)} → ${escapeMarkdown(item.name)}: USAGE=${escapeMarkdown(item.usage)}, SELECT=${escapeMarkdown(item.select)}, UPDATE=${escapeMarkdown(item.update)}`),
      "",
      "### Storage buckets",
      "",
      ...(audit.storageBuckets || []).map(item => `- ${escapeMarkdown(item.name)} (${escapeMarkdown(item.id)}): public=${escapeMarkdown(item.public)}, fileSizeLimit=${escapeMarkdown(item.fileSizeLimit === null ? "unlimited" : item.fileSizeLimit)}, allowedMimeTypes=${escapeMarkdown(item.allowedMimeTypes === null ? "unrestricted" : (item.allowedMimeTypes || []).join(", ") || "empty")}`),
      "");
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
