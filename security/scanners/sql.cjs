"use strict";

const { createHash } = require("node:crypto");

const HIGH_RISK_TABLES = new Set([
  "public.conversations",
  "public.conversation_reads",
  "public.favorites",
  "public.listings",
  "public.messages",
  "storage.objects"
]);
const WRITES = new Set(["INSERT", "UPDATE", "DELETE", "ALL"]);
const SEVERITY_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];

function stripComments(sql) {
  let output = "";
  let index = 0;
  let quote = "";
  let dollarTag = "";
  while (index < sql.length) {
    if (dollarTag) {
      if (sql.startsWith(dollarTag, index)) {
        output += dollarTag;
        index += dollarTag.length;
        dollarTag = "";
      } else {
        output += sql[index];
        index++;
      }
      continue;
    }
    if (quote) {
      const character = sql[index];
      output += character;
      index++;
      if (character === quote) {
        if (sql[index] === quote) {
          output += sql[index++];
        } else {
          quote = "";
        }
      } else if (character === "\\" && sql[index]) {
        output += sql[index++];
      }
      continue;
    }

    const bypassPattern = /\b(?:CREATE|ALTER)\s+ROLE\s+("?[\w$]+"?)[^;]*\bBYPASSRLS\b[^;]*;/gi;
    for (const match of scanSql.matchAll(bypassPattern)) {
      const role = match[1].replace(/"/g, "");
      addFinding(
        "RLS-003",
        ["anon", "authenticated"].includes(role.toLowerCase()) ? "CRITICAL" : "HIGH",
        `role ${role}`,
        `Role ${role} is configured with BYPASSRLS.`,
        { offset: match.index, text: match[0] },
        "The role can bypass row-level security policies, defeating row-isolation controls.",
        "Remove BYPASSRLS from application roles; reserve this attribute for tightly controlled administrative roles."
      );
    }

    const dollarMatch = sql.slice(index).match(/^\$[A-Za-z_0-9]*\$/);
    if (dollarMatch) {
      dollarTag = dollarMatch[0];
      output += dollarTag;
      index += dollarTag.length;
    } else if (sql.startsWith("--", index)) {
      while (index < sql.length && sql[index] !== "\n") {
        output += " ";
        index++;
      }
    } else if (sql.startsWith("/*", index)) {
      output += "  ";
      index += 2;
      let depth = 1;
      while (index < sql.length && depth) {
        if (sql.startsWith("/*", index)) {
          output += "  ";
          index += 2;
          depth++;
        } else if (sql.startsWith("*/", index)) {
          output += "  ";
          index += 2;
          depth--;
        } else {
          output += sql[index] === "\n" ? "\n" : " ";
          index++;
        }
      }
    } else {
      const character = sql[index];
      output += character;
      index++;
      if (character === "'" || character === '"') quote = character;
    }
  }
  return output;
}

function maskLiterals(sql) {
  let output = "";
  let index = 0;
  while (index < sql.length) {
    const dollarMatch = sql.slice(index).match(/^\$[A-Za-z_0-9]*\$/);
    if (sql[index] === "'") {
      output += " ";
      index++;
      while (index < sql.length) {
        const character = sql[index++];
        output += character === "\n" ? "\n" : " ";
        if (character === "'" && sql[index] === "'") {
          output += " ";
          index++;
        } else if (character === "\\" && index < sql.length) {
          output += sql[index] === "\n" ? "\n" : " ";
          index++;
        } else if (character === "'") {
          break;
        }
      }
    } else if (dollarMatch) {
      const tag = dollarMatch[0];
      output += " ".repeat(tag.length);
      index += tag.length;
      while (index < sql.length && !sql.startsWith(tag, index)) {
        output += sql[index] === "\n" ? "\n" : " ";
        index++;
      }
      if (sql.startsWith(tag, index)) {
        output += " ".repeat(tag.length);
        index += tag.length;
      }
    } else {
      output += sql[index++];
    }
  }
  return output;
}

function normalizeRelation(schema, name) {
  return `${(schema || "public").toLowerCase()}.${name.toLowerCase()}`;
}

function readExpression(text, start) {
  while (/\s/.test(text[start] || "")) start++;
  if (text[start] !== "(") return null;
  let depth = 0;
  let quote = "";
  for (let index = start; index < text.length; index++) {
    const character = text[index];
    if (quote) {
      if (character === quote) {
        if (text[index + 1] === quote) index++;
        else quote = "";
      } else if (character === "\\" && index + 1 < text.length) index++;
      continue;
    }
    if (character === "'" || character === '"') quote = character;
    else if (character === "(") depth++;
    else if (character === ")" && --depth === 0) {
      return { expression: text.slice(start + 1, index).trim(), end: index + 1 };
    }
  }
  return null;
}

function policyExpressions(statement) {
  const result = {};
  for (const clause of ["USING", "WITH CHECK"]) {
    const match = new RegExp(`\\b${clause}\\s*\\(`, "i").exec(statement);
    if (!match) continue;
    const opening = statement.indexOf("(", match.index);
    const parsed = readExpression(statement, opening);
    if (parsed) result[clause.toLowerCase().replace(" ", "_")] = parsed.expression;
  }
  return result;
}

function isBareTrue(expression) {
  let value = expression.trim();
  while (value.startsWith("(") && readExpression(value, 0)?.end === value.length) {
    value = value.slice(1, -1).trim();
  }
  return /^true$/i.test(value);
}

function policyRoles(header) {
  const match = /\bTO\s+([\s\S]*?)(?=\bUSING\b|\bWITH\s+CHECK\b|$)/i.exec(header);
  if (!match) return ["PUBLIC"];
  return match[1].split(",").map(role => role.trim().replace(/^"|"$/g, "").toUpperCase()).filter(Boolean);
}

function isPublicRole(roles) {
  return roles.includes("PUBLIC") || roles.includes("ANON") || roles.includes("AUTHENTICATED");
}

function ownerRestricted(expression, relation) {
  if (!expression) return false;
  if (relation === "storage.objects") {
    return /auth\.uid\s*\(\s*\)/i.test(expression)
      && (/\bowner\b/i.test(expression) || /storage\.foldername\s*\(/i.test(expression) || /\bname\b/i.test(expression));
  }
  return /auth\.uid\s*\(\s*\)\s*(?:=|IS NOT DISTINCT FROM)\s*\(?\s*(?:[\w"]+\s*\.\s*)?["']?(?:user_id|owner_id|created_by)\b/i.test(expression)
    || /\b(?:user_id|owner_id|created_by)\b["']?\s*(?:=|IS NOT DISTINCT FROM)\s*\(?\s*auth\.uid\s*\(\s*\)/i.test(expression);
}

function sanitizeEvidence(value) {
  return value
    .replace(/\$[A-Za-z_0-9]*\$[\s\S]*?\$[A-Za-z_0-9]*\$/g, "$$[REDACTED]$$")
    .replace(/'(?:''|\\.|[^'])*'/g, "'[REDACTED]'")
    .replace(/"(?:[^"]|"")*"/g, '"[REDACTED]"')
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 240);
}

function analyzeSql(sql, source = "input.sql") {
  return analyzeSqlFiles([{ sql, source }]);
}

function analyzeSqlFiles(sources) {
  let clean = "";
  let scanSql = "";
  const sourceSegments = [];
  for (const [index, item] of sources.entries()) {
    if (index) {
      clean += "\n;\n";
      scanSql += "\n;\n";
    }
    const start = clean.length;
    const sourceSql = stripComments(item.sql);
    clean += sourceSql;
    scanSql += maskLiterals(sourceSql);
    sourceSegments.push({ source: item.source, start, end: clean.length });
  }
  const sourceLocation = offset => {
    const segment = sourceSegments.find(candidate => offset >= candidate.start && offset <= candidate.end)
      || sourceSegments.at(-1)
      || { source: "input.sql", start: 0 };
    return {
      source: segment.source,
      line: Math.max(1, clean.slice(segment.start, offset).split("\n").length)
    };
  };
  const findings = [];
  const tables = new Map();
  const policies = [];
  const functionGrants = [];
  const addFinding = (rule, severity, object, description, evidence, risk, recommendation, status = "potential") => {
    const location = sourceLocation(evidence.offset);
    const idHash = createHash("sha1").update(`${rule}:${location.source}:${location.line}:${object}`).digest("hex").slice(0, 8);
    findings.push({
      id: `${rule}-${idHash}`,
      severity,
      object,
      description,
      evidence: `${location.source}:${location.line}: ${sanitizeEvidence(evidence.text)}`,
      risk,
      recommendation,
      status
    });
  };

  const tablePattern = /\bCREATE\s+(?:UNLOGGED\s+)?TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(?:"?([\w$]+)"?)\s*\.\s*)?"?([\w$]+)"?/gi;
  for (const match of scanSql.matchAll(tablePattern)) {
    const relation = normalizeRelation(match[1], match[2]);
    tables.set(relation, { relation, offset: match.index, rls: false });
  }
  const rlsPattern = /\bALTER\s+TABLE\s+(?:ONLY\s+)?(?:(?:"?([\w$]+)"?)\s*\.\s*)?"?([\w$]+)"?[^;]*?\bENABLE\s+ROW\s+LEVEL\s+SECURITY\b/gi;
  for (const match of scanSql.matchAll(rlsPattern)) {
    const relation = normalizeRelation(match[1], match[2]);
    if (tables.has(relation)) tables.get(relation).rls = true;
  }

  const policyPattern = /\bCREATE\s+POLICY\b[\s\S]*?;/gi;
  for (const match of scanSql.matchAll(policyPattern)) {
    const statement = match[0];
    const header = /^CREATE\s+POLICY\s+("?[\w$]+"?)\s+ON\s+(?:(?:"?([\w$]+)"?)\s*\.\s*)?"?([\w$]+)"?([\s\S]*?)(?=\bUSING\s*\(|\bWITH\s+CHECK\s*\(|;)/i.exec(statement);
    if (!header) continue;
    const name = header[1].replace(/"/g, "");
    const relation = normalizeRelation(header[2], header[3]);
    const operation = /\bFOR\s+(SELECT|INSERT|UPDATE|DELETE|ALL)\b/i.exec(header[4])?.[1]?.toUpperCase() || "ALL";
    const roles = policyRoles(header[4]);
    const mode = /\bAS\s+RESTRICTIVE\b/i.test(header[4]) ? "RESTRICTIVE" : "PERMISSIVE";
    const expressions = policyExpressions(statement);
    const policy = { name, relation, operation, roles, mode, expressions, offset: match.index, text: statement };
    policies.push(policy);

    for (const [clause, expression] of Object.entries(expressions)) {
      if (!isBareTrue(expression)) continue;
      const write = WRITES.has(operation) && clause === "with_check";
      const anonWrite = write && roles.some(role => role === "PUBLIC" || role === "ANON");
      addFinding(
        "POLICY-001",
        anonWrite ? "HIGH" : "MEDIUM",
        relation,
        `${clause.toUpperCase().replace("_", " ")} is unconditionally true in policy "${name}".`,
        { offset: match.index, text: `${name} ${operation} TO ${roles.join(",")} ${clause} (${expression})` },
        "A permissive policy can expose rows or permit writes without a row-level predicate; PostgreSQL combines permissive policies with OR.",
        "Review the policy's intended audience and add an explicit row or owner constraint where required."
      );
    }

    if (WRITES.has(operation) && HIGH_RISK_TABLES.has(relation) && isPublicRole(roles)) {
      const ownerCondition = operation === "INSERT"
        ? expressions.with_check
        : [expressions.using, expressions.with_check].filter(Boolean).join(" ");
      if (!ownerRestricted(ownerCondition, relation)) {
        const missingCheck = operation === "UPDATE" && !expressions.with_check;
        addFinding(
          "POLICY-002",
          missingCheck ? "HIGH" : "MEDIUM",
          relation,
          `Policy "${name}" permits ${operation} without a statically identifiable owner restriction.`,
          { offset: match.index, text: `${name} ${operation} TO ${roles.join(",")} ${ownerCondition || "(no owner predicate found)"}` },
          "Users may be able to modify rows that are not theirs, or change ownership fields. This is a static risk signal, not proof of exploitability.",
          "Verify ownership predicates in USING and WITH CHECK (for example auth.uid() against the immutable owner column), including all permissive policies."
        );
      }
    }
  }

  for (const table of tables.values()) {
    if (!table.relation.startsWith("public.")) continue;
    if (!table.rls) {
      addFinding(
        "RLS-001",
        "HIGH",
        table.relation,
        `Table ${table.relation} is created without a matching ENABLE ROW LEVEL SECURITY statement in scanned SQL.`,
        { offset: table.offset, text: `CREATE TABLE ${table.relation}; no matching ENABLE ROW LEVEL SECURITY found` },
        "If the table is exposed through Supabase's Data API, roles may access rows without row-level policy enforcement.",
        "Confirm the complete migration set and enable RLS with deliberate policies before exposing this table."
      );
    } else if (!policies.some(policy => policy.relation === table.relation)) {
      addFinding(
        "RLS-002",
        "INFO",
        table.relation,
        `RLS is enabled for ${table.relation}, but no policy for it was found in scanned SQL.`,
        { offset: table.offset, text: `RLS enabled; no CREATE POLICY for ${table.relation} found` },
        "With RLS enabled and no applicable policies, ordinary roles are generally denied; this can indicate missing application access rather than a data exposure.",
        "Confirm migrations are complete and that the intended policies are defined."
      );
    }
  }

  const grants = /\bGRANT\s+([\w\s,]+?)\s+ON\s+(?:(TABLE|SEQUENCE|FUNCTION|PROCEDURE|SCHEMA)\s+)?([\w$".,() ]+?)\s+TO\s+([\w$" ,]+?)(?:\s+WITH\s+GRANT\s+OPTION)?\s*;/gi;
  for (const match of scanSql.matchAll(grants)) {
    const privileges = match[1].split(",").map(value => value.trim().toUpperCase());
    const objects = match[3].split(",").map(value => value.trim().replace(/^(?:ONLY\s+)?/, ""));
    const roles = match[4].split(",").map(value => value.trim().replace(/"/g, "").toUpperCase());
    for (const role of roles) {
      for (const object of objects) {
        const schemaName = object.match(/^([\w$]+)\./)?.[1]?.toLowerCase();
        const dangerous = privileges.some(privilege => ["ALL", "ALL PRIVILEGES", "TRUNCATE", "DELETE", "UPDATE", "INSERT"].includes(privilege));
        const functionExecute = match[2]?.toUpperCase() === "FUNCTION" && privileges.includes("EXECUTE");
        if (match[2]?.toUpperCase() === "FUNCTION" && privileges.includes("EXECUTE")) {
          functionGrants.push({ relation: object.replace(/\s*\([^)]*\)\s*$/, "").replace(/"/g, "").toLowerCase(), role });
        }
        if ((role === "ANON" || role === "PUBLIC") && (dangerous || functionExecute || ["auth", "storage", "extensions", "vault"].includes(schemaName))) {
          addFinding(
            "GRANT-001",
            privileges.some(privilege => ["ALL", "ALL PRIVILEGES", "TRUNCATE"].includes(privilege)) ? "HIGH" : "MEDIUM",
            object,
            `Role ${role.toLowerCase()} is granted ${privileges.join(", ")} on ${object}.`,
            { offset: match.index, text: match[0] },
            "Anonymous users may gain write or internal-object access beyond the application's intended public surface.",
            "Review whether the grant is required and constrain it to the minimum privilege and object set."
          );
        } else if (role === "AUTHENTICATED" && privileges.some(privilege => ["ALL", "ALL PRIVILEGES", "TRUNCATE"].includes(privilege))) {
          addFinding(
            "GRANT-002",
            "MEDIUM",
            object,
            `Role authenticated is granted broad privileges (${privileges.join(", ")}) on ${object}.`,
            { offset: match.index, text: match[0] },
            "Broad table privileges can bypass the intended least-privilege model if policies or grants are misconfigured.",
            "Review the grant against the application's required operations and rely on RLS for row isolation."
          );
        } else if (role === "SERVICE_ROLE") {
          addFinding(
            "GRANT-003",
            "INFO",
            object,
            `A grant to service_role was found for ${object}; privileged service-role access requires trusted server-side handling.`,
            { offset: match.index, text: match[0] },
            "Service-role credentials bypass RLS; exposure of the credential would permit broad database access.",
            "Keep service_role credentials exclusively in trusted server-side secrets and never in browser code."
          );
        }
      }
    }
  }

  const bulkGrants = /\bGRANT\s+([\w\s,]+?)\s+ON\s+ALL\s+(TABLES|SEQUENCES|FUNCTIONS|PROCEDURES)\s+IN\s+SCHEMA\s+("?[\w$]+"?)\s+TO\s+([\w$" ,]+?)(?:\s+WITH\s+GRANT\s+OPTION)?\s*;/gi;
  for (const match of scanSql.matchAll(bulkGrants)) {
    const privileges = match[1].split(",").map(value => value.trim().toUpperCase());
    const objectType = match[2].toUpperCase();
    const schema = match[3].replace(/"/g, "");
    const roles = match[4].split(",").map(value => value.trim().replace(/"/g, "").toUpperCase());
    for (const role of roles) {
      const functionExecute = objectType === "FUNCTIONS" && privileges.includes("EXECUTE");
      const dangerous = privileges.some(privilege => ["ALL", "ALL PRIVILEGES", "TRUNCATE", "DELETE", "UPDATE", "INSERT"].includes(privilege));
      if ((role === "ANON" || role === "PUBLIC") && (dangerous || functionExecute || ["auth", "storage", "extensions", "vault"].includes(schema.toLowerCase()))) {
        addFinding(
          "GRANT-004",
          privileges.some(privilege => ["ALL", "ALL PRIVILEGES", "TRUNCATE"].includes(privilege)) ? "HIGH" : "MEDIUM",
          `${schema} (all ${objectType.toLowerCase()})`,
          `Role ${role.toLowerCase()} is granted ${privileges.join(", ")} on all ${objectType.toLowerCase()} in schema ${schema}.`,
          { offset: match.index, text: match[0] },
          "A schema-wide grant can expose current and future objects beyond the intended API surface.",
          "Constrain grants to explicitly required objects and revoke broad default privileges."
        );
      }
    }
  }

  const functionPattern = /\bCREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:(?:"?([\w$]+)"?)\s*\.\s*)?"?([\w$]+)"?\s*\(/gi;
  const functionMatches = [...scanSql.matchAll(functionPattern)];
  for (let index = 0; index < functionMatches.length; index++) {
    const match = functionMatches[index];
    const statementEnd = scanSql.indexOf(";", match.index);
    const end = statementEnd < 0 ? clean.length : statementEnd;
    const definition = scanSql.slice(match.index, end);
    if (!/\bSECURITY\s+DEFINER\b/i.test(definition)) continue;
    const relation = `${(match[1] || "public").toLowerCase()}.${match[2].toLowerCase()}`;
    const searchPath = (/\bSET\s+search_path\s*(?:=|TO)\s*([^;\n]+)/i.exec(definition)?.[1] || "").replace(/"/g, "");
    if (!searchPath) {
      addFinding(
        "RPC-001",
        "HIGH",
        relation,
        `SECURITY DEFINER function ${relation} has no statically visible fixed search_path.`,
        { offset: match.index, text: `SECURITY DEFINER ${relation}; no SET search_path clause found before the next function/end of file` },
        "An attacker may influence object resolution through a writable schema and cause the function to execute unintended objects.",
        "Set a safe, fixed search_path (preferably pg_catalog or an empty path with fully qualified names) and review object qualification."
      );
    } else if (/(?:^|[,\s])(?:public|pg_temp|\$user)(?:$|[,\s])/i.test(searchPath)) {
      addFinding(
        "RPC-003",
        "HIGH",
        relation,
        `SECURITY DEFINER function ${relation} has a search_path containing a potentially writable schema.`,
        { offset: match.index, text: `SECURITY DEFINER ${relation}; search_path=${searchPath}` },
        "Objects in a writable schema may shadow intended functions or relations during privileged execution.",
        "Use a fixed path containing only trusted schemas and schema-qualify referenced objects."
      );
    }
    if (functionGrants.some(grant => grant.relation === relation && ["ANON", "PUBLIC"].includes(grant.role))) {
      addFinding(
        "RPC-004",
        "HIGH",
        relation,
        `SECURITY DEFINER function ${relation} has an explicit EXECUTE grant to anon or PUBLIC.`,
        { offset: match.index, text: `SECURITY DEFINER ${relation}; matching EXECUTE grant to anon or PUBLIC found` },
        "Anonymous callers may invoke the function with its owner's privileges.",
        "Revoke public execution unless required, grant only to intended roles, and verify authorization inside the function."
      );
    }
    if (/\bEXECUTE\b[\s\S]{0,160}(?:\|\||format\s*\()/i.test(clean.slice(match.index, end + 1))) {
      addFinding(
        "RPC-002",
        "MEDIUM",
        relation,
        `SECURITY DEFINER function ${relation} contains dynamic SQL construction.`,
        { offset: match.index, text: `SECURITY DEFINER ${relation}; dynamic EXECUTE construction detected` },
        "Unsafe dynamic SQL can permit injection or unintended privileged operations.",
        "Review dynamic SQL for parameterization with USING, identifier quoting, and strict input validation."
      );
    }
  }

  const storagePolicies = policies.filter(policy => policy.relation === "storage.objects");
  if (/\blisting-photos\b/i.test(clean) && storagePolicies.length === 0) {
    const offset = clean.search(/\blisting-photos\b/i);
    addFinding(
      "STORAGE-001",
      "INFO",
      "storage.objects / listing-photos",
      "The listing-photos bucket is referenced in scanned SQL, but no storage.objects policy was found in those files.",
      { offset, text: "listing-photos bucket reference; no CREATE POLICY on storage.objects found" },
      "Storage bucket configuration and access policy may be managed outside the scanned migration set.",
      "Verify the bucket's public/private setting, upload path restrictions, and authenticated ownership rules in Supabase."
    );
  }

  const policyGroups = new Map();
  for (const policy of policies.filter(item => item.mode === "PERMISSIVE")) {
    const key = `${policy.relation}:${policy.operation}:${policy.roles.sort().join(",")}`;
    policyGroups.set(key, [...(policyGroups.get(key) || []), policy]);
  }
  for (const group of policyGroups.values()) {
    if (group.length < 2) continue;
    addFinding(
      "POLICY-003",
      "LOW",
      group[0].relation,
      `Multiple permissive policies target the same operation and role set (${group.map(policy => policy.name).join(", ")}).`,
      { offset: group[0].offset, text: `overlapping policies: ${group.map(policy => policy.name).join(", ")}` },
      "Permissive policies combine with OR, so one broad policy can make stricter policies ineffective.",
      "Review the combined effect of all policies for this relation, operation, and role set."
    );
  }

  findings.sort((left, right) =>
    SEVERITY_ORDER.indexOf(left.severity) - SEVERITY_ORDER.indexOf(right.severity)
    || left.id.localeCompare(right.id)
  );
  return { findings, tables: [...tables.keys()], policyCount: policies.length };
}

module.exports = { analyzeSql, analyzeSqlFiles, stripComments };
