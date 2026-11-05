"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { analyzeSql, analyzeSqlFiles } = require("../scanners/sql.cjs");
const { createReport, renderMarkdown } = require("../reports/report.cjs");

test("flags public tables without RLS without claiming confirmation", () => {
  const { findings } = analyzeSql("CREATE TABLE public.listings (id bigint primary key);");
  assert.equal(findings[0].severity, "HIGH");
  assert.equal(findings[0].status, "potential");
  assert.match(findings[0].description, /without a matching ENABLE ROW LEVEL SECURITY/);
});

test("flags a public write policy with an unconditional check", () => {
  const sql = `
    CREATE TABLE public.favorites (user_id uuid);
    ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
    CREATE POLICY everyone_can_change_favorites ON public.favorites
      FOR INSERT TO anon WITH CHECK (true);
  `;
  const finding = analyzeSql(sql).findings.find(item => item.id.startsWith("POLICY-001"));
  assert.equal(finding.severity, "HIGH");
  assert.equal(finding.status, "potential");
  assert.match(finding.evidence, /with_check/);
});

test("flags anon grants of destructive privileges", () => {
  const { findings } = analyzeSql("GRANT DELETE, TRUNCATE ON TABLE public.listings TO anon;");
  assert.equal(findings[0].severity, "HIGH");
  assert.equal(findings[0].object, "public.listings");
});

test("detects definer functions without a fixed search_path", () => {
  const sql = `
    CREATE OR REPLACE FUNCTION public.read_secret()
    RETURNS text LANGUAGE sql SECURITY DEFINER
    AS $$ SELECT 'safe-to-redact' $$;
  `;
  const finding = analyzeSql(sql).findings.find(item => item.id.startsWith("RPC-001"));
  assert.equal(finding.severity, "HIGH");
  assert.doesNotMatch(finding.evidence, /safe-to-redact/);
});

test("does not interpret comments or string contents as SQL grants or policies", () => {
  const sql = `
    -- GRANT ALL ON public.listings TO anon;
    SELECT 'CREATE POLICY everyone ON public.listings USING (true);';
  `;
  assert.deepEqual(analyzeSql(sql).findings, []);
});

test("an enabled RLS table with a scoped owner policy is not reported as missing RLS", () => {
  const sql = `
    CREATE TABLE public.listings (user_id uuid);
    ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
    CREATE POLICY owner_update ON public.listings
      FOR UPDATE TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  `;
  const { findings } = analyzeSql(sql);
  assert.equal(findings.some(item => item.id.startsWith("RLS-001")), false);
  assert.equal(findings.some(item => item.id.startsWith("POLICY-002")), false);
});

test("joins migration context so RLS enabled in a later file is recognized", () => {
  const { findings } = analyzeSqlFiles([
    { source: "supabase/migrations/001_tables.sql", sql: "CREATE TABLE public.listings (user_id uuid);" },
    { source: "supabase/migrations/002_rls.sql", sql: "ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;" }
  ]);
  assert.equal(findings.some(item => item.id.startsWith("RLS-001")), false);
});

test("report differentiates incomplete coverage from a static pass", () => {
  const report = createReport({ findings: [], scannedFiles: [], sourceAvailable: false, generatedAt: "fixed" });
  assert.equal(report.result, "INCOMPLETE");
  assert.equal(report.coverage.databaseScenarios, "NOT_RUN");
  assert.match(renderMarkdown(report), /not evidence that deployed Supabase configuration is secure/i);
});
