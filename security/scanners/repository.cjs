"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { createHash } = require("node:crypto");
const YAML = require("yaml");
const { scanJavaScript, scanHtml } = require("./javascript.cjs");
const dispositions = require("./reviewed-dom-sinks.json");

const SKIP_DIRECTORIES = new Set([".git", "node_modules", "dist", "coverage", ".next"]);
const SOURCE_EXTENSIONS = new Set([".js", ".cjs", ".mjs", ".jsx", ".ts", ".tsx", ".mts", ".cts", ".html", ".yml", ".yaml", ".json", ".sql", ".env", ".pem", ".key", ".toml", ".ini", ".conf"]);
const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

function collectFiles(root) {
  const files = [];
  function visit(directory) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isDirectory() && SKIP_DIRECTORIES.has(entry.name)) continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (entry.isFile() && (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) || /^\.env(?:\.|$)/.test(entry.name))) {
        files.push(absolute);
      }
    }
  }
  visit(root);
  return files;
}

function scanRepository({ root, runNpmAudit = true, npmAuditTimeout = 90000 }) {
  const findings = [];
  const reviewedSinks = [];
  const reviewedFindings = [];
  const files = collectFiles(root);
  const relative = file => path.relative(root, file).split(path.sep).join("/");
  const sha256 = source => createHash("sha256").update(source).digest("hex");
  // A changed helper, caller or template invalidates the entire manual review.
  const reviewCurrent = Object.keys(dispositions.sourceHashes).length === 2
    && ["app.js", "index.html"].every(name => /^[a-f0-9]{64}$/.test(dispositions.sourceHashes[name]))
    && Object.entries(dispositions.sourceHashes).every(([name, hash]) => {
    const file = files.find(file => relative(file) === name);
    return file && sha256(fs.readFileSync(file)) === hash;
  });
  const add = (file, line, rule, severity, category, description, risk, recommendation, status = "potential") => {
    findings.push({
      id: `${rule}-${createHash("sha256").update(`${rule}:${relative(file)}:${line}:${description}`).digest("hex").slice(0, 8)}`,
      category,
      severity,
      status,
      object: relative(file),
      description,
      evidence: `${relative(file)}:${line}: ${rule}`,
      risk,
      recommendation
    });
  };

  const secretRules = [
    { pattern: /\bsb_secret_[A-Za-z0-9_-]{16,}\b/g, rule: "SECRET-001", severity: "CRITICAL", label: "Supabase secret key literal" },
    { pattern: /\bservice_role\b.{0,80}\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/gi, rule: "SECRET-002", severity: "CRITICAL", label: "service_role credential literal" },
    { pattern: /\bAKIA[0-9A-Z]{16}\b/g, rule: "SECRET-003", severity: "CRITICAL", label: "AWS access key literal" },
    { pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, rule: "SECRET-004", severity: "CRITICAL", label: "private key block" },
    { pattern: /\b(?:SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY|PRIVATE_API_KEY|SECRET_ACCESS_KEY)\s*[:=]\s*["'`]([^"'`\s]{12,})["'`]/gi, rule: "SECRET-005", severity: "HIGH", label: "private credential assignment" }
  ];
  const jsExtensions = new Set([".js", ".cjs", ".mjs", ".jsx", ".ts", ".tsx", ".mts", ".cts", ".html"]);
  const workflowFiles = files.filter(file => relative(file).startsWith(".github/workflows/") && /\.ya?ml$/i.test(file));

  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const lines = source.split(/\r?\n/);
    for (const [lineIndex, line] of lines.entries()) {
      for (const secret of secretRules) {
        secret.pattern.lastIndex = 0;
        if (secret.pattern.test(line)) {
          add(file, lineIndex + 1, secret.rule, secret.severity, "Repository Security",
            `Potentially exposed ${secret.label}.`,
            "A committed private credential can grant unauthorized access to connected services.",
            "Revoke and rotate the credential, remove it from tracked files and history, and use an approved secret store.");
        }
      }
    }

    if (!jsExtensions.has(path.extname(file).toLowerCase())) continue;
    const scan = path.extname(file).toLowerCase() === ".html" ? scanHtml(source, relative(file)) : scanJavaScript(source, relative(file));
    if (scan.authSignals.client && scan.authSignals.writes && !scan.authSignals.getUser) {
      add(file, 1, "AUTH-001", "MEDIUM", "Authentication",
        "Client-side Supabase writes exist without a visible auth.getUser() check in the same file.",
        "Client-side identity checks are not an authorization boundary; server-side RLS must enforce ownership.",
        "Verify write policies use auth.uid() and validate ownership in the database; treat this static signal as a review prompt.");
    }
    reviewedSinks.push(...scan.reviewedSinks.map(item => ({ file: relative(file), ...item })));
    for (const sink of scan.findings) {
      const review = reviewCurrent && dispositions.findings.find(item =>
        item.file === relative(file) && item.line === sink.line && item.rule === sink.rule
        && item.contextHash === sink.contextHash && typeof item.reason === "string" && item.reason.trim()
        && ["XSS-001", "XSS-002"].includes(sink.rule));
      if (review) {
        reviewedFindings.push({ ...review, status: "reviewed", sourceHashes: dispositions.sourceHashes });
        continue;
      }
      add(file, sink.line, sink.rule, sink.severity, "Repository Security", sink.description,
        "If untrusted data reaches this sink, it may enable cross-site scripting or code execution.",
        "Trace the data flow; prefer DOM construction, or verified context-appropriate sanitization. Unknown values remain blocking.");
    }
  }

  for (const file of workflowFiles) {
    const source = fs.readFileSync(file, "utf8");
    let workflow;
    try { workflow = YAML.parse(source, { uniqueKeys: true }); } catch {
      add(file, 1, "ACTIONS-PARSE-001", "HIGH", "Repository Security", "Workflow YAML could not be parsed.",
        "Invalid or ambiguous YAML can prevent mandatory checks from running.", "Correct the workflow and validate it with actionlint.");
      continue;
    }
    if (/^\s*permissions:\s*write-all\s*$/mi.test(source)) {
      add(file, source.slice(0, source.search(/^\s*permissions:\s*write-all\s*$/mi)).split(/\r?\n/).length,
        "ACTIONS-001", "HIGH", "Repository Security", "Workflow requests write-all permissions.",
        "A compromised workflow action could modify repository resources.",
        "Declare the minimum required permissions at workflow or job scope.");
    }
    if (/^\s*pull_request_target\s*:/m.test(source) && /\b(?:checkout|run):/i.test(source)) {
      add(file, 1, "ACTIONS-002", "HIGH", "Repository Security", "pull_request_target is combined with executable workflow steps.",
        "Executing untrusted pull request content with a privileged token can expose repository credentials.",
        "Avoid checking out or executing contributor-controlled content in privileged pull_request_target workflows.");
    }
    for (const match of source.matchAll(/^\s*(?:-\s*)?uses:\s*([^@\s]+)@([^\s#]+)/gm)) {
      if (/^[a-f0-9]{40}$/i.test(match[2])) continue;
      const line = source.slice(0, match.index).split(/\r?\n/).length;
      add(file, line, "ACTIONS-003", "LOW", "Repository Security", "Workflow action is pinned to a movable version tag rather than a commit SHA.",
        "A moved or compromised upstream tag can change the code executed by the workflow.",
        "Pin third-party actions to a verified full commit SHA.");
    }
    for (const job of Object.values(workflow?.jobs || {})) {
      if (job?.permissions === "write-all" && workflow.permissions !== "write-all") {
        add(file, 1, "ACTIONS-001", "HIGH", "Repository Security", "Job requests write-all permissions.",
          "A compromised job has broad repository permissions.", "Declare least-privilege job permissions.");
      }
      for (const step of job.steps || []) {
        if (typeof step.run === "string" && /\$\{\{\s*github\.event\.(?:pull_request|issue|comment|head_commit|commits)\b/.test(step.run)) {
          add(file, 1, "ACTIONS-004", "HIGH", "Repository Security", "Untrusted event data is interpolated into a shell script.",
            "Attacker-controlled event fields can become shell commands.", "Pass event values through environment variables and quote them.");
        }
      }
    }
  }

  const manifestPath = path.join(root, "package-lock.json");
  if (!runNpmAudit) {
    findings.push({
      id: "DEPS-001", category: "Dependencies", severity: "INFO", status: "not-run",
      object: "package-lock.json", description: "npm audit was not requested.",
      evidence: "Dependency advisory scan skipped by scan mode.",
      risk: "Dependency vulnerabilities are not assessed.",
      recommendation: "Run the Full Security Audit or npm audit with a committed lockfile."
    });
  } else if (!fs.existsSync(manifestPath)) {
    findings.push({
      id: "DEPS-002", category: "Dependencies", severity: "INFO", status: "not-run",
      object: "package-lock.json", description: "npm audit was not run because no lockfile is present.",
      evidence: "package-lock.json: not found",
      risk: "The resolved dependency tree cannot be audited reproducibly.",
      recommendation: "Commit a lockfile and run npm audit in a network-enabled environment."
    });
  } else {
    const result = spawnSync("npm", ["audit", "--json"], {
      cwd: root, encoding: "utf8", timeout: npmAuditTimeout, maxBuffer: 8 * 1024 * 1024
    });
    let audit;
    try { audit = JSON.parse(result.stdout || ""); } catch {}
    if (!result.error && !result.signal && [0, 1].includes(result.status) && !audit?.error
      && audit && audit.metadata?.vulnerabilities && audit.vulnerabilities
      && Number.isInteger(audit.metadata.vulnerabilities.total)
      && (audit.metadata.vulnerabilities.total !== 0 || result.status === 0)
      && (audit.metadata.vulnerabilities.total === 0 || Object.keys(audit.vulnerabilities).length > 0)) {
      const advisories = audit.vulnerabilities || {};
      for (const [name, vulnerability] of Object.entries(advisories)) {
        const severity = String(vulnerability.severity || "info").toUpperCase();
        findings.push({
          id: `NPM-${name.replace(/[^A-Za-z0-9-]/g, "-")}`,
          category: "Dependencies",
          severity: ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(severity) ? severity : "INFO",
          status: "confirmed",
          object: name,
          description: `npm audit reports ${vulnerability.range || "a vulnerable range"} for ${name}.`,
          evidence: `${vulnerability.isDirect ? "direct" : "transitive"} dependency; advisory details withheld from the summary.`,
          risk: "The installed dependency tree includes a version range with a published security advisory.",
          recommendation: "Update to a non-vulnerable compatible version and rerun npm audit."
        });
      }
      if (audit.metadata.vulnerabilities.total === 0) {
        findings.push({
          id: "DEPS-003", category: "Dependencies", severity: "INFO", status: "informational",
          object: "package-lock.json", description: "npm audit reported no known dependency vulnerabilities.",
          evidence: "npm audit JSON metadata reports zero vulnerabilities.",
          risk: "This does not cover unpublished or undisclosed vulnerabilities.",
          recommendation: "Keep dependencies updated and rerun the audit regularly."
        });
      }
    } else {
      findings.push({
        id: "DEPS-004", category: "Dependencies", severity: "INFO", status: "not-run",
        object: "package-lock.json", description: "npm audit did not return a usable advisory result.",
        evidence: "npm audit failed, timed out, or the registry was unavailable; command output is withheld.",
        risk: "Dependency advisories could not be assessed.",
        recommendation: "Run npm audit in a network-enabled environment and check registry/lockfile configuration."
      });
    }
  }

  findings.sort((left, right) =>
    SEVERITY_ORDER.indexOf(left.severity) - SEVERITY_ORDER.indexOf(right.severity) || left.id.localeCompare(right.id)
  );
  return { findings, reviewedSinks, reviewedFindings, scannedFiles: files.map(relative) };
}

module.exports = { collectFiles, scanRepository };
