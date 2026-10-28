// Explicit one-time import. Never invoked automatically by install or startup.
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync, backup } = require('node:sqlite');
const { createPrisma } = require('../server/prisma');
const tables = [
  'users', 'user_settings', 'sessions', 'courses', 'lessons', 'lesson_progress',
  'challenges', 'submissions', 'achievements', 'user_achievements', 'projects',
  'project_votes', 'project_bookmarks', 'xp_ledger', 'workspace_tasks', 'workspace_notes',
  'workspace_assignments', 'workspace_snippets', 'workspace_bookmarks',
  'event_participants', 'issued_certificates', 'certificate_otps',
];

async function main() {
  if (!process.argv.includes('--confirm-import')) {
    throw new Error('Run only after explicit approval, with --confirm-import.');
  }
  const sourcePath = path.resolve(process.env.SQLITE_IMPORT_PATH || process.env.DB_PATH || 'devharbour.sqlite');
  fs.mkdirSync('.local', { recursive: true });
  const snapshotPath = path.resolve('.local', `supabase-import-${Date.now()}.sqlite`);
  const original = new DatabaseSync(sourcePath, { readOnly: true });
  try { await backup(original, snapshotPath); } finally { original.close(); }
  const source = new DatabaseSync(snapshotPath, { readOnly: true });
  const prisma = createPrisma('DIRECT_URL');
  try {
    if (source.prepare('PRAGMA foreign_key_check').all().length) throw new Error('SQLite foreign key validation failed.');
    const report = await prisma.$transaction(async tx => {
      // Avoid simultaneous importers and refuse to overwrite existing remote data.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(170271028)`;
      for (const table of tables) {
        if (await tx[table].count()) throw new Error('Remote application tables are not empty; import cancelled.');
      }
      const report = [];
      for (const table of tables) {
        const rows = source.prepare(`SELECT * FROM "${table}"`).all();
        for (let start = 0; start < rows.length; start += 100) {
          await tx[table].createMany({ data: rows.slice(start, start + 100) });
        }
        const count = await tx[table].count();
        if (count !== rows.length) throw new Error('Import row-count verification failed.');
        report.push({ table, rows: count });
      }
      return report;
    }, { maxWait: 15000, timeout: 180000 });
    console.log('Import committed; row counts verified for all 22 tables. Original SQLite file unchanged.');
    console.log(JSON.stringify(report));
    fs.writeFileSync('.local/supabase-import-report.json', JSON.stringify({ sourceSnapshot: snapshotPath, importedAt: new Date().toISOString(), tables: report }, null, 2));
  } finally {
    source.close();
    await prisma.$disconnect();
  }
}

main().catch(error => {
  const safeMessages = ['Run only after explicit approval, with --confirm-import.', 'SQLite foreign key validation failed.', 'Remote application tables are not empty; import cancelled.', 'Import row-count verification failed.'];
  console.error(safeMessages.includes(error.message) ? error.message : 'Import failed and the remote transaction was rolled back. No credentials or row data were printed.');
  if (/^P\d+$/.test(error.code || '')) console.error('Prisma error code:', error.code);
  process.exitCode = 1;
});
