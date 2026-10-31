// Read-only runtime role and client-to-database-endpoint TLS verification.
require("dotenv").config();
const assert = require("node:assert/strict");
const { Client } = require("pg");
const { connectionUrl } = require("../server/prisma");
(async () => {
  const client = new Client({
    connectionString: connectionUrl(),
    connectionTimeoutMillis: 15000,
    statement_timeout: 15000,
  });
  try {
    await client.connect();
    assert.equal(client.connection.stream.encrypted, true);
    assert.equal(client.connection.stream.authorized, true);
    await client.query("BEGIN READ ONLY");
    const role = (
      await client.query(
        "SELECT current_user,rolsuper,rolcreatedb,rolcreaterole,rolbypassrls,rolreplication,has_schema_privilege(current_user,'public','CREATE') AS schema_create,has_database_privilege(current_user,current_database(),'CREATE') AS database_create,has_table_privilege(current_user,'public._prisma_migrations','UPDATE') AS migration_write FROM pg_roles WHERE rolname=current_user",
      )
    ).rows[0];
    assert.equal(role.current_user, "devharbour_runtime");
    for (const [key, value] of Object.entries(role))
      if (key !== "current_user") assert.equal(value, false, key);
    const policies = (
      await client.query(
        "SELECT count(*)::int AS count FROM pg_policies WHERE schemaname='public' AND policyname='devharbour_runtime_access' AND 'devharbour_runtime'=ANY(roles)",
      )
    ).rows[0].count;
    const verificationReady = (await client.query("SELECT to_regclass('public.email_verifications') IS NOT NULL AS ready")).rows[0].ready;
    assert.equal(policies, verificationReady ? 23 : 22);
    const browserRole = (
      await client.query(
        "SELECT pg_has_role('anon','devharbour_runtime','MEMBER') OR pg_has_role('authenticated','devharbour_runtime','MEMBER') AS inherits_runtime",
      )
    ).rows[0];
    assert.equal(browserRole.inherits_runtime, false);
    await client.query("ROLLBACK");
    console.log(
      "PASS: devharbour_runtime uses verified TLS; elevated role/database/schema/RLS/replication/migration privileges are disabled.",
    );
    console.log(
      `PASS: ${policies} application-only access policies; browser roles cannot inherit the private runtime role. Read-only checks completed.`,
    );
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(
      "Runtime security verification failed; safe code:",
      /^[A-Z0-9_]{1,40}$/.test(error.code || "")
        ? error.code
        : "CONFIG_OR_CHECK_FAILED",
    );
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
})();
