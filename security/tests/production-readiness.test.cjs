"use strict";

const assert = require("node:assert/strict");
const { test } = require("node:test");
const { validateConfiguration } = require("../production-readiness.cjs");

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
