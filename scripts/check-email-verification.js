// Read-only readiness check. Never sends mail, applies migrations, or prints secrets.
require('dotenv').config();
const { Client } = require('pg');
const { configured } = require('../server/email-verification');
const { connectionUrl } = require('../server/prisma');
(async () => {
  const client = new Client({ connectionString: connectionUrl(), connectionTimeoutMillis: 15000, statement_timeout: 15000 });
  try {
    await client.connect(); await client.query('BEGIN READ ONLY');
    const schemaReady = (await client.query("SELECT to_regclass('public.email_verifications') IS NOT NULL AS ready")).rows[0].ready;
    const counts = (await client.query('SELECT (SELECT count(*)::int FROM event_participants) AS participants, (SELECT count(*)::int FROM issued_certificates) AS certificates')).rows[0];
    let protectedTable = false;
    if (schemaReady) {
      const checks = (await client.query("SELECT c.relrowsecurity AS rls, (has_table_privilege(current_user,'public.email_verifications','SELECT') AND has_table_privilege(current_user,'public.email_verifications','INSERT') AND has_table_privilege(current_user,'public.email_verifications','UPDATE') AND has_table_privilege(current_user,'public.email_verifications','DELETE')) AS runtime_access, has_table_privilege('anon','public.email_verifications','SELECT,INSERT,UPDATE,DELETE') AS anon_access, has_table_privilege('authenticated','public.email_verifications','SELECT,INSERT,UPDATE,DELETE') AS browser_access FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname='email_verifications'")).rows[0];
      protectedTable = checks.rls && checks.runtime_access && !checks.anon_access && !checks.browser_access;
    }
    await client.query('ROLLBACK');
    console.log(JSON.stringify({ emailConfigured: configured(), schemaReady, protectedTable, registry: counts, emailSent: false }, null, 2));
    if (!configured() || !schemaReady || !protectedTable) process.exitCode = 2;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Email readiness check failed; no mail or database changes were made.'); process.exitCode = 1;
  } finally { await client.end().catch(() => {}); }
})();
