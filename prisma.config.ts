import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Never execute migration commands without explicitly setting PROFILE_MIGRATION_URL.
// The runtime DATABASE_URL may point at production and is deliberately not a CLI fallback.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.PROFILE_MIGRATION_URL || 'postgresql://disabled:disabled@127.0.0.1:1/explicit_migration_target_required' }
});
