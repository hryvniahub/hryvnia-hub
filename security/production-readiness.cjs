"use strict";

function requiredValue(config, name) {
  const value = config[name];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Missing required configuration: ${name}`);
  }
  return value.trim();
}

function diagnoseEndpoint(config) {
  const directHost = /^db\.[a-z0-9]+\.supabase\.co\.?$/;
  const poolerHost = /^aws-[0-9]+-[a-z0-9]+(?:-[a-z0-9]+)*\.pooler\.supabase\.com\.?$/;
  function safeHost(host) {
    return host.length <= 253 && (directHost.test(host) || poolerHost.test(host))
      ? host : "[withheld: unrecognized hostname]";
  }
  const expectedHost = requiredValue(config, "SUPABASE_PRODUCTION_HOST").toLowerCase();
  const databaseUrl = requiredValue(config, "SUPABASE_READONLY_DATABASE_URL");
  if (/%(?![0-9a-f]{2})/i.test(databaseUrl)) {
    throw new Error("SUPABASE_READONLY_DATABASE_URL contains invalid percent encoding");
  }
  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error("SUPABASE_READONLY_DATABASE_URL must be a valid PostgreSQL URL");
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("SUPABASE_READONLY_DATABASE_URL must use PostgreSQL");
  }
  let host;
  let username;
  try {
    host = decodeURIComponent(url.hostname).toLowerCase();
    username = decodeURIComponent(url.username);
  } catch {
    throw new Error("SUPABASE_READONLY_DATABASE_URL contains invalid percent encoding");
  }
  const endpoint = directHost.test(host) ? "direct"
    : poolerHost.test(host) ? "pooler" : "unrecognized";
  return {
    expectedHostname: safeHost(expectedHost),
    actualHostname: safeHost(host),
    hostnameMatches: host === expectedHost,
    trailingDot: host.endsWith("."),
    endpoint,
    port: url.port ? Number(url.port) : 5432,
    sessionPort: !url.port || Number(url.port) === 5432,
    directRoleMatches: username === "sherlock_audit",
    poolerRoleAndProjectRefShapeMatches: /^sherlock_audit\.[a-z0-9]+$/.test(username),
    poolerProjectRefVerified: false,
    tlsVerifyFullOnly: url.searchParams.toString() === "sslmode=verify-full"
  };
}

function validateConfiguration(config) {
  const expectedHost = requiredValue(config, "SUPABASE_PRODUCTION_HOST").toLowerCase();
  const expectedDatabase = requiredValue(config, "SUPABASE_PRODUCTION_DATABASE");
  const bucketValue = requiredValue(config, "SUPABASE_PRODUCTION_STORAGE_BUCKETS");
  const databaseUrl = requiredValue(config, "SUPABASE_READONLY_DATABASE_URL");

  if (/%(?![0-9a-f]{2})/i.test(databaseUrl)) {
    throw new Error("SUPABASE_READONLY_DATABASE_URL contains invalid percent encoding");
  }

  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error("SUPABASE_READONLY_DATABASE_URL must be a valid PostgreSQL URL");
  }

  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("SUPABASE_READONLY_DATABASE_URL must use PostgreSQL");
  }
  if (databaseUrl.includes("#") || url.hash) {
    throw new Error("SUPABASE_READONLY_DATABASE_URL must not contain a fragment");
  }
  let username;
  let password;
  let database;
  let host;
  try {
    username = decodeURIComponent(url.username);
    password = decodeURIComponent(url.password);
    database = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    host = decodeURIComponent(url.hostname).toLowerCase();
  } catch {
    throw new Error("SUPABASE_READONLY_DATABASE_URL contains invalid percent encoding");
  }
  if (username !== "sherlock_audit") {
    throw new Error("Database URL must use the sherlock_audit role");
  }
  if (!password) {
    throw new Error("Database URL must include a password");
  }
  if (host !== expectedHost) {
    throw new Error("Database URL host does not match SUPABASE_PRODUCTION_HOST");
  }
  if (database !== expectedDatabase) {
    throw new Error("Database URL database does not match SUPABASE_PRODUCTION_DATABASE");
  }
  const queryKeys = [...url.searchParams.keys()];
  if (queryKeys.length !== 1 || queryKeys[0] !== "sslmode"
    || url.searchParams.getAll("sslmode").length !== 1
    || url.searchParams.get("sslmode") !== "verify-full") {
    throw new Error("Database URL must use only sslmode=verify-full with no duplicate or conflicting connection options");
  }

  const buckets = bucketValue.split(",").map(bucket => bucket.trim());
  if (
    buckets.some(bucket => !bucket || !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(bucket))
    || new Set(buckets).size !== buckets.length
  ) {
    throw new Error("SUPABASE_PRODUCTION_STORAGE_BUCKETS must be a comma-separated list of unique bucket names");
  }

  return { host: expectedHost, database: expectedDatabase, buckets };
}

if (require.main === module) {
  try {
    if (process.argv.includes("--diagnose")) {
      console.log(JSON.stringify(diagnoseEndpoint(process.env)));
    }
    validateConfiguration(process.env);
    console.log("Production audit configuration is structurally valid. No database or Storage connection was made.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { validateConfiguration, diagnoseEndpoint };
