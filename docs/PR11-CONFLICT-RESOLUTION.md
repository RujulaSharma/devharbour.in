# PR 11 conflict resolution

The feature branch retains the existing Express/Supabase PostgreSQL/Prisma runtime, Redis integration, verified-email certificate ownership checks and current homepage. Main is merged into the feature branch without rewriting history or merging into main.

Legacy standalone applications, database exports, bulk certificates, participant manifests, obsolete schema/seed scripts and duplicate backend entrypoints remain recoverable from the incoming main commit and in the isolated resolution worktree. They are excluded from the result tree and deployment; no application records are modified. A read-only SQLite inspection helper from main is preserved.

Bulk export paths are blocked in Express and Vercel, even if ignored files exist on disk. Personal certificates remain available through authenticated, verified-email ownership checks.

The incoming scripts/setup_supabase_db.js contained a hardcoded database credential. It is excluded, but its credential must be rotated by the owner because it already exists in Git history. Do not copy its value into issues or logs.

Render currently deploys feat/dashboard-premium-redesign after the production route mismatch was repaired. Keep this deployment source until main has the reviewed secure code.
