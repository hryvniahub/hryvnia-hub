"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");
const { validateConfiguration, diagnoseEndpoint } = require("../production-readiness.cjs");

const validConfig = {
  SUPABASE_PRODUCTION_HOST: "db.example.supabase.co",
  SUPABASE_PRODUCTION_DATABASE: "postgres",
  SUPABASE_PRODUCTION_STORAGE_BUCKETS: "listing-photos,profile-photos",
  SUPABASE_READONLY_DATABASE_URL: "postgresql://sherlock_audit:local-test-password@db.example.supabase.co:5432/postgres?sslmode=verify-full"
};

test("accepts a matching TLS URL for the dedicated audit role", () => {
  assert.deepEqual(validateConfiguration(validConfig), {
    host: "db.example.supabase.co",
    database: "postgres",
    buckets: ["listing-photos", "profile-photos"]
  });
});

test("normalizes ordinary and percent-encoded hostnames to lowercase", () => {
  for (const host of ["DB.EXAMPLE.SUPABASE.CO", "%64B.EXAMPLE%2ESUPABASE.CO"]) {
    const target = validateConfiguration({
      ...validConfig,
      SUPABASE_PRODUCTION_HOST: "DB.EXAMPLE.SUPABASE.CO",
      SUPABASE_READONLY_DATABASE_URL: validConfig.SUPABASE_READONLY_DATABASE_URL.replace(
        "db.example.supabase.co", host
      )
    });
    assert.equal(target.host, "db.example.supabase.co");
  }
});

test("rejects a percent-encoded hostname that decodes to a different host", () => {
  assert.throws(
    () => validateConfiguration({
      ...validConfig,
      SUPABASE_READONLY_DATABASE_URL: validConfig.SUPABASE_READONLY_DATABASE_URL.replace(
        "db.example.supabase.co", "%77rong.example"
      )
    }),
    { message: "Database URL host does not match SUPABASE_PRODUCTION_HOST" }
  );
});

test("rejects malformed hostname encoding without exposing credentials or the URL", () => {
  for (const host of ["%ZZ.example", "%.example", "%FF.example", "%C3%28.example"]) {
    assert.throws(
      () => validateConfiguration({
        ...validConfig,
        SUPABASE_READONLY_DATABASE_URL: validConfig.SUPABASE_READONLY_DATABASE_URL.replace(
          "db.example.supabase.co", host
        )
      }),
      { message: "SUPABASE_READONLY_DATABASE_URL contains invalid percent encoding" }
    );
  }
});

test("rejects missing configuration without exposing the URL", () => {
  assert.throws(
    () => validateConfiguration({ ...validConfig, SUPABASE_READONLY_DATABASE_URL: "" }),
    /Missing required configuration: SUPABASE_READONLY_DATABASE_URL/
  );
});

test("rejects a URL for a different host or database", () => {
  assert.throws(
    () => validateConfiguration({
      ...validConfig,
      SUPABASE_READONLY_DATABASE_URL: "postgresql://sherlock_audit:secret@wrong.example:5432/postgres?sslmode=verify-full"
    }),
    /host does not match/
  );
  assert.throws(
    () => validateConfiguration({
      ...validConfig,
      SUPABASE_READONLY_DATABASE_URL: "postgresql://sherlock_audit:secret@db.example.supabase.co:5432/other?sslmode=verify-full"
    }),
    /database does not match/
  );
});

test("rejects service_role, non-TLS URLs, and malformed bucket lists", () => {
  assert.throws(
    () => validateConfiguration({
      ...validConfig,
      SUPABASE_READONLY_DATABASE_URL: "postgresql://service_role:secret@db.example.supabase.co:5432/postgres?sslmode=verify-full"
    }),
    /must use the sherlock_audit role/
  );
  assert.throws(
    () => validateConfiguration({
      ...validConfig,
      SUPABASE_READONLY_DATABASE_URL: "postgresql://sherlock_audit:secret@db.example.supabase.co:5432/postgres?sslmode=require"
    }),
    /sslmode=verify-full/
  );
  assert.throws(
    () => validateConfiguration({ ...validConfig, SUPABASE_PRODUCTION_STORAGE_BUCKETS: "photos,photos" }),
    /unique bucket names/
  );
});

test("rejects duplicate or non-verify-full SSL mode settings", () => {
  for (const sslmode of [
    "verify-full&sslmode=disable",
    "verify-full&sslmode=verify-full",
    "disable",
    "require",
    "verify-ca"
  ]) {
    assert.throws(
      () => validateConfiguration({
        ...validConfig,
        SUPABASE_READONLY_DATABASE_URL: `postgresql://sherlock_audit:secret@db.example.supabase.co:5432/postgres?sslmode=${sslmode}`
      }),
      /sslmode=verify-full/
    );
  }
});

test("rejects unexpected, duplicate, or conflicting connection parameters", () => {
  for (const query of [
    "sslmode=verify-full&hostaddr=127.0.0.1",
    "sslmode=verify-full&application_name=other",
    "sslmode=verify-full&sslmode=verify-full"
  ]) {
    assert.throws(
      () => validateConfiguration({
        ...validConfig,
        SUPABASE_READONLY_DATABASE_URL: `postgresql://sherlock_audit:secret@db.example.supabase.co:5432/postgres?${query}`
      }),
      /no duplicate or conflicting connection options/
    );
  }
});

test("rejects URL fragments and malformed percent encoding", () => {
  for (const url of [
    "postgresql://sherlock_audit:secret@db.example.supabase.co:5432/postgres?sslmode=verify-full#fragment",
    "postgresql://sherlock_audit:bad%ZZ@db.example.supabase.co:5432/postgres?sslmode=verify-full",
    "postgresql://sherlock_audit:secret@db.example.supabase.co:5432/post%ZZgres?sslmode=verify-full",
    "postgresql://sherlock_audit:%E0%A4%A@db.example.supabase.co:5432/postgres?sslmode=verify-full"
  ]) {
    assert.throws(
      () => validateConfiguration({ ...validConfig, SUPABASE_READONLY_DATABASE_URL: url }),
      /fragment|percent encoding/
    );
  }
});

test("endpoint diagnostics report direct host, encoding, port and TLS without credentials", () => {
  const result = diagnoseEndpoint(validConfig);
  assert.equal(result.actualHostname, "db.example.supabase.co");
  assert.equal(result.hostnameMatches, true);
  assert.equal(result.endpoint, "direct");
  assert.equal(result.directRoleMatches, true);
  assert.equal(result.tlsVerifyFullOnly, true);
  const encoded = diagnoseEndpoint({
    ...validConfig,
    SUPABASE_READONLY_DATABASE_URL: validConfig.SUPABASE_READONLY_DATABASE_URL.replace(
      "db.example.supabase.co:5432", "%64B.EXAMPLE%2ESUPABASE.CO:6543"
    )
  });
  assert.equal(encoded.hostnameMatches, true);
  assert.equal(encoded.port, 6543);
  assert.equal(encoded.sessionPort, false);
  assert.doesNotMatch(JSON.stringify(result), /sherlock_audit|postgresql:|password/);
});

test("pooler diagnostics distinguish endpoint mismatch without authorizing a pooler role", () => {
  const url = new URL(validConfig.SUPABASE_READONLY_DATABASE_URL);
  url.hostname = "aws-0-eu-central-1.pooler.supabase.com";
  url.username = "sherlock_audit.syntheticref";
  const config = { ...validConfig, SUPABASE_READONLY_DATABASE_URL: url.href };
  const result = diagnoseEndpoint(config);
  assert.equal(result.endpoint, "pooler");
  assert.equal(result.actualHostname, url.hostname);
  assert.equal(result.hostnameMatches, false);
  assert.equal(result.sessionPort, true);
  assert.equal(result.poolerRoleAndProjectRefShapeMatches, true);
  assert.equal(result.poolerProjectRefVerified, false);
  assert.equal(result.directRoleMatches, false);
  assert.throws(() => validateConfiguration(config), /must use the sherlock_audit role/);
  assert.doesNotMatch(JSON.stringify(result), /sherlock_audit|syntheticref/);
});

test("diagnostics withhold unrecognized hosts and detect trailing dots and TLS mismatch", () => {
  for (const host of ["db.example.supabase.co.", "sensitive-credential.invalid"]) {
    const result = diagnoseEndpoint({
      ...validConfig,
      SUPABASE_READONLY_DATABASE_URL: validConfig.SUPABASE_READONLY_DATABASE_URL
        .replace("db.example.supabase.co", host).replace("verify-full", "require")
    });
    assert.equal(result.hostnameMatches, false);
    assert.equal(result.tlsVerifyFullOnly, false);
    assert.equal(result.trailingDot, host.endsWith("."));
    assert.doesNotMatch(JSON.stringify(result), /sensitive-credential/);
  }
});

test("diagnostic CLI preserves failure and never prints malformed URLs or credentials", () => {
  for (const input of ["not-a-url-sensitive", "postgresql://sensitive@%FF.example/postgres"]) {
    const child = spawnSync(process.execPath, [
      path.resolve(__dirname, "../production-readiness.cjs"), "--diagnose"
    ], {
      encoding: "utf8",
      env: { ...process.env, ...validConfig, SUPABASE_READONLY_DATABASE_URL: input }
    });
    assert.equal(child.status, 1);
    assert.equal(child.stdout, "");
    assert.match(child.stderr, /valid PostgreSQL URL|invalid percent encoding/);
    assert.doesNotMatch(child.stderr, /sensitive|postgresql:\/\//);
  }
});

test("readiness-only workflow keeps target checks and skips the live audit", () => {
  const workflow = fs.readFileSync(path.resolve(__dirname, "../../.github/workflows/supabase-production-audit.yml"), "utf8");
  assert.match(workflow, /readiness_only:\s+description:[^\n]+\s+type: boolean\s+default: false/);
  assert.match(workflow, /id: audit\s+if: success\(\) && !inputs\.readiness_only/);
  assert.match(workflow, /node security\/production-readiness\.cjs --diagnose/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main' && inputs\.confirmation == 'AUDIT SUPABASE PRODUCTION READ ONLY'/);
  assert.match(workflow, /\[ "\$CONFIRMED_HOST" != "\$EXPECTED_HOST" \]/);
});
