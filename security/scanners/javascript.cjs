"use strict";

const ts = require("typescript");

const ESCAPER = `function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}`;
const printer = ts.createPrinter({ removeComments: true });
function tokens(text) {
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, text);
  const result = [];
  for (let token = scanner.scan(); token !== ts.SyntaxKind.EndOfFileToken; token = scanner.scan()) {
    result.push([token, scanner.getTokenText()]);
  }
  return JSON.stringify(result);
}
const reference = ts.createSourceFile("reference.js", ESCAPER, ts.ScriptTarget.Latest, true);
const expectedBody = tokens(printer.printNode(ts.EmitHint.Unspecified, reference.statements[0].body, reference));

function scanJavaScript(source, filename) {
  const findings = [];
  const reviewedSinks = [];
  const ast = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const candidates = [];
  const bindings = new Map();
  const writes = new Set();
  let dynamicScope = false;
  const property = node => ts.isPropertyAccessExpression(node) ? node.name.text
    : ts.isElementAccessExpression(node) && ts.isStringLiteralLike(node.argumentExpression) ? node.argumentExpression.text : null;
  const walk = (node, visit) => { visit(node); ts.forEachChild(node, child => walk(child, visit)); };
  walk(ast, node => {
    if ((ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isVariableDeclaration(node) || ts.isParameter(node)
      || ts.isClassDeclaration(node) || ts.isImportClause(node) || ts.isImportSpecifier(node)
      || ts.isNamespaceImport(node) || ts.isImportEqualsDeclaration(node) || ts.isBindingElement(node))
      && node.name && ts.isIdentifier(node.name)) {
      bindings.set(node.name.text, (bindings.get(node.name.text) || 0) + 1);
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment
      && node.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
      if (ts.isIdentifier(node.left)) writes.add(node.left.text);
      else if (/(?:^|[.\["'])String(?:$|[.\]"'])|\.replace\b/.test(node.left.getText(ast))) writes.add("String");
      else if (/escapeHtml/.test(node.left.getText(ast))) writes.add("escapeHtml");
    }
    if (ts.isWithStatement(node) || (ts.isCallExpression(node)
      && node.expression.getText(ast) === "eval")) dynamicScope = true;
    if ((ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) && ts.isIdentifier(node.operand)) writes.add(node.operand.text);
    if (ts.isFunctionDeclaration(node) && node.name?.text === "escapeHtml" && node.body
      && node.parameters.length === 1 && node.parameters[0].name.getText(ast) === "value"
      && node.parameters[0].initializer?.getText(ast) === '""'
      && tokens(printer.printNode(ts.EmitHint.Unspecified, node.body, ast)) === expectedBody) candidates.push(node);
  });
  // Only an exact, unshadowed local implementation is trusted, never a helper name.
  const trustedEscaper = candidates.length === 1 && bindings.get("escapeHtml") === 1
    && !writes.has("escapeHtml") && !bindings.has("String") && !writes.has("String") && !dynamicScope;
  function unwrap(node) {
    while (ts.isParenthesizedExpression(node) || ts.isAsExpression(node)
      || ts.isNonNullExpression(node) || ts.isTypeAssertionExpression(node)) node = node.expression;
    return node;
  }
  function escapeContext(prefix) {
    let tag = false;
    let quote = "";
    let fragment = "";
    let raw = "";
    for (let index = 0; index < prefix.length; index++) {
      const character = prefix[index];
      if (quote) {
        fragment += character;
        if (character === quote) quote = "";
      } else if (tag) {
        fragment += character;
        if (character === "'" || character === '"') quote = character;
        if (character === ">") {
          const opening = fragment.match(/^<\s*(script|style)\b/i);
          if (opening) raw = opening[1].toLowerCase();
          if (raw && new RegExp(`^<\\s*/\\s*${raw}\\b`, "i").test(fragment)) raw = "";
          tag = false;
        }
      } else if (character === "<") {
        tag = true;
        fragment = "<";
      }
    }
    if (raw || /<!--(?![\s\S]*-->)/.test(prefix)) return false;
    if (!tag) return true;
    if (!quote) return false;
    const beforeQuote = fragment.slice(0, fragment.lastIndexOf(quote));
    const match = beforeQuote.match(/([:\w-]+)\s*=\s*$/);
    if (!match) return false;
    // Attribute escaping does not validate URL schemes, CSS, JS, or nested HTML.
    return /^(?:id|class|title|alt|role|name|value|placeholder|aria-[\w-]+|data-[\w-]+)$/i.test(match[1]);
  }
  function safe(node, prefix = "", depth = 0) {
    if (!node || depth > 30) return false;
    node = unwrap(node);
    if (ts.isStringLiteralLike(node) || ts.isNumericLiteral(node)) return true;
    if (ts.isConditionalExpression(node)) return safe(node.whenTrue, prefix, depth + 1) && safe(node.whenFalse, prefix, depth + 1);
    if (ts.isTemplateExpression(node)) {
      let context = prefix + node.head.text;
      for (const span of node.templateSpans) {
        if (!safe(span.expression, context, depth + 1)) return false;
        const expression = unwrap(span.expression);
        if (ts.isStringLiteralLike(expression)) context += expression.text;
        else if (ts.isCallExpression(expression) && ts.isIdentifier(expression.expression)
          && expression.expression.text === "escapeHtml") context += "VALUE";
        else if (ts.isNumericLiteral(expression)) context += expression.text;
        else if (node.templateSpans.at(-1) !== span) return false;
        context += span.literal.text;
      }
      return true;
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      // Do not assume concatenation retains a safe HTML context across unknown fragments.
      if (!ts.isStringLiteralLike(unwrap(node.left))) return false;
      return safe(node.right, prefix + unwrap(node.left).text, depth + 1);
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "escapeHtml"
      && trustedEscaper && node.arguments.length === 1) return escapeContext(prefix);
    return false;
  }
  function add(node, rule, description, expression, canProveSafe = false) {
    const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1;
    if (canProveSafe && safe(expression)) {
      reviewedSinks.push({ line, rule, reason: "AST: constant markup or verified escaping in text/quoted non-executable attribute context." });
    } else findings.push({ line, rule, severity: "HIGH", description });
  }
  if (ast.parseDiagnostics.length) {
    findings.push({ line: 1, rule: "JS-PARSE-001", severity: "HIGH",
      description: "JavaScript/TypeScript could not be fully parsed; security analysis is incomplete." });
  }
  walk(ast, node => {
    if (ts.isBinaryExpression(node) && node.operatorToken.kind >= ts.SyntaxKind.FirstAssignment
      && node.operatorToken.kind <= ts.SyntaxKind.LastAssignment) {
      const name = property(node.left);
      if (["innerHTML", "outerHTML", "srcdoc"].includes(name)) {
        add(node, name === "srcdoc" ? "XSS-004" : "XSS-001",
          "DOM HTML sink has a value whose safety is not established by the conservative AST analysis.",
          node.right, node.operatorToken.kind === ts.SyntaxKind.EqualsToken);
      }
    }
    if (!ts.isCallExpression(node) && !ts.isNewExpression(node)) return;
    const name = property(node.expression);
    if (name === "insertAdjacentHTML") add(node, "XSS-002", "insertAdjacentHTML receives an unverified HTML value.", node.arguments?.[1], true);
    if (["write", "writeln"].includes(name) && node.expression.expression?.getText(ast) === "document") {
      for (const argument of node.arguments || []) add(node, "DOM-001", "document.write receives an unverified HTML value.", argument, true);
    }
    if ((ts.isIdentifier(node.expression) && ["eval", "Function"].includes(node.expression.text))
      || name === "eval" || name === "Function") add(node, "JS-001", "Dynamic code execution primitive detected.");
    if (["setTimeout", "setInterval"].includes(node.expression.getText(ast))
      && ![ts.SyntaxKind.ArrowFunction, ts.SyntaxKind.FunctionExpression, ts.SyntaxKind.Identifier].includes(node.arguments?.[0]?.kind)) {
      add(node, "JS-002", "Timer may execute a string as JavaScript.");
    }
    if (name === "createContextualFragment" || name === "parseFromString") {
      add(node, "XSS-005", "HTML parser receives an unverified value.", node.arguments?.[0], true);
    }
    if (name === "setAttribute" && node.arguments?.[0] && ts.isStringLiteralLike(node.arguments[0])) {
      const attribute = node.arguments[0].text;
      if (/^(on[a-z]+|srcdoc)$/i.test(attribute)) add(node, "XSS-003", "Executable DOM attribute is assigned.");
    }
  });
  return { findings, reviewedSinks };
}

function scanHtml(source, filename) {
  const findings = [];
  const reviewedSinks = [];
  for (const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (/\btype\s*=\s*["'](?:application\/(?:ld\+)?json|importmap)["']/i.test(match[1])) continue;
    const offset = source.slice(0, match.index + match[0].indexOf(">") + 1).split("\n").length - 1;
    const scan = scanJavaScript(match[2], `${filename}.js`);
    findings.push(...scan.findings.map(item => ({ ...item, line: item.line + offset })));
    reviewedSinks.push(...scan.reviewedSinks.map(item => ({ ...item, line: item.line + offset })));
  }
  return { findings, reviewedSinks };
}

module.exports = { scanJavaScript, scanHtml };
