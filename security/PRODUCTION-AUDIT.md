# Production metadata audit

The offline `security:audit` command remains independent. The live command is
`npm run security:production`; it refuses to connect unless
`SHERLOCK_PRODUCTION_CONFIRMATION` is exactly
`AUDIT SUPABASE PRODUCTION READ ONLY`.

Configure the protected GitHub Environment `supabase-production-audit` manually:

- Secret: `SUPABASE_READONLY_DATABASE_URL`, using the direct PostgreSQL hostname,
  database role `sherlock_audit`, and only `sslmode=verify-full` in the query.
- Variables: `SUPABASE_PRODUCTION_HOST`, `SUPABASE_PRODUCTION_DATABASE`,
  `SUPABASE_PRODUCTION_STORAGE_BUCKETS` (comma-separated bucket IDs).
- Require an independent reviewer, prevent self-review and protection bypass
  where supported, and restrict deployments to the reviewed `main` branch.

The workflow only accepts manual dispatch on `main`, the exact confirmation
phrase, and a matching hostname. No connection is authorized by preparing or
testing these files. Publish reviewed code through the normal approval process
before dispatch. Never put the database URL in command arguments or output.

For connection diagnosis, dispatch with `readiness_only: true`. This preserves
target confirmation and all readiness checks but never runs the live auditor,
even when readiness succeeds. `node security/production-readiness.cjs --diagnose`
reports recognized Supabase endpoint hostnames, comparison, port, and boolean
role/TLS checks without printing credentials or the URL. Unrecognized hostnames
are withheld to avoid exposing credentials from malformed URLs. A pooler-shaped
username does not verify its project reference or enable pooler support; the
existing direct-role validation remains mandatory until endpoint configuration
and any required pooler changes are separately reviewed.

## Database permissions

Use a dedicated LOGIN role with CONNECT to the target database. It must have no
superuser, BYPASSRLS, CREATEROLE, CREATEDB, REPLICATION, role memberships, ownership
of application objects, schema CREATE, table/column writes, sequence USAGE/UPDATE,
or effective EXECUTE on non-system SECURITY DEFINER functions. Permissions
inherited from PUBLIC also count; the live guard refuses an unsafe role.

The role needs catalog visibility for pg_class, pg_namespace, pg_policies,
pg_roles and pg_proc, and execution of the built-in catalog inspection functions
used by the auditor. These are normally available to ordinary PostgreSQL roles.
No pg_authid, password hashes, function bodies, or application records are read.

For buckets, allow USAGE on schema storage and SELECT only on
storage.buckets columns id, name, public, file_size_limit, allowed_mime_types.
Ensure that bucket metadata is fully visible to the role; filtered rows cannot
establish complete coverage. No SELECT on storage.objects or file downloads is
needed. Storage policies are read from pg_catalog.pg_policies.

Role provisioning and grants are manual DBA tasks, not actions of the scanner.
The guard cannot prevent a database administrator from granting other privileges
concurrently, but every scanner query runs in a read-only transaction.

## Scope and outcomes

The auditor inspects table RLS flags, policies, role attributes, effective
anon/authenticated table and column privileges, schema privileges, function
identity signatures/configuration/EXECUTE privileges, and bucket metadata.
Effective privilege checks include PUBLIC and inherited role rights according
to PostgreSQL. It does not simulate requests, invoke application functions, read
application rows, inspect Auth/Edge settings, or prove policy exploitability.

Reports are separate `supabase-production-report.json` and `.md` files.
Raw catalog rows, policy expressions, ACL contents, database URLs, passwords,
and raw driver error messages are not emitted. Metadata object names and
function identity arguments appear in JSON findings.

Coverage is NOT_RUN after failed queries and PARTIAL after a 10,000-row cap.
Missing expected roles or buckets, unavailable metadata, unsafe identity,
timeouts and cleanup failures prevent PASS. HIGH/CRITICAL findings produce
FAIL (exit 1), even with incomplete coverage; otherwise incomplete coverage
produces INCOMPLETE (exit 2). Complete metadata collection without blocking
findings produces PASS (exit 0), not proof of application security.

Bulk/direct grant history, migrations, default privileges for future objects,
policy satisfiability, function body safety and runtime RLS enforcement are not
reconstructed by this metadata-only audit. Client TLS verifies the hostname and
certificate against Node's trusted certificate authorities. Connection timeout
is 5 seconds, client query timeout 6 seconds, server statement timeout 5 seconds,
lock timeout 2 seconds and idle-in-transaction timeout 10 seconds.
