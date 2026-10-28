// SELECT-only checks. Never print connection strings, errors, or row data.
const { connectionUrl, createPrisma } = require('../server/prisma');

async function main() {
  // Validate both before opening any connection.
  for (const key of ['DATABASE_URL', 'DIRECT_URL']) connectionUrl(key);
  for (const key of ['DATABASE_URL', 'DIRECT_URL']) {
    const prisma = createPrisma(key);
    try {
      const tables = await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SET TRANSACTION READ ONLY`;
        await tx.$queryRaw`SELECT 1 AS connected`;
        return tx.$queryRaw`
          SELECT table_name FROM information_schema.tables
          WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
          ORDER BY table_name`;
      }, { maxWait: 10000, timeout: 20000 });
      console.log(`${key}: connected successfully; public schema contains ${tables.length} tables.`);
      console.log('Tables:', tables.map(t => t.table_name).join(', ') || '(none)');
    } finally {
      await prisma.$disconnect();
    }
  }
}

main().catch((error) => {
  // Prisma/pg diagnostics can contain connection strings; keep details local.
  const code = typeof error.code === 'string' && /^[A-Z0-9_]{1,40}$/.test(error.code)
    ? error.code : 'CONFIG_OR_CONNECTION_FAILED';
  console.error(`Database check failed (${code}). Check local URL fields, password encoding, network access, and TLS trust. No schema changes were made.`);
  process.exitCode = 1;
});
