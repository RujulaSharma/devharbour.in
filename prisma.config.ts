import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Prisma 7 CLI operations use the direct/session connection, not the runtime pool.
// An unset URL still permits offline schema validation and client generation.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DIRECT_URL || '' },
});
