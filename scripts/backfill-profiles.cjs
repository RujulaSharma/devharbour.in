// Defaults to a read-only summary. Use --apply for the requested account backfill.
require('dotenv').config({ quiet: true });
process.env.DB_PATH = ':memory:';
const db = require('../server/db');
if (db.isPostgres()) process.env.DB_PROVIDER = 'postgresql';
const { profilePrisma } = require('../server/profile/prisma');
const { backfillProfiles } = require('../server/profile/provisioning');

async function main() {
  const apply = process.argv.includes('--apply');
  const result = await backfillProfiles({ apply });
  const summary = { mode: apply ? 'apply' : 'preview', profiles: result };
  if (process.argv.includes('--certificates')) {
    if (apply) console.log(JSON.stringify({ profiles: result, certificates: 'syncing' }));
    summary.certificates = await require('../server/profile/certificates').backfillProfileCertificates({ apply });
  }
  console.log(JSON.stringify(summary));
}
main().catch(error => {
  console.error('Profile backfill failed:', error.code || error.name);
  process.exitCode = 1;
}).finally(async () => {
  await profilePrisma().$disconnect();
  if (db.pool) await db.pool.end();
  db.db?.close();
});
