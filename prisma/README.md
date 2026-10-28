# Supabase / Prisma setup status

The approved initial migration has been applied to Supabase. All 22 application
tables were copied from a consistent snapshot of the existing local SQLite
database, with row counts checked before committing the import. The original
SQLite files are intact. No application migrations or imports run on startup.

`npm start` now runs the existing Express backend against PostgreSQL via Prisma.
The frontend continues to call the same `/api` endpoints on the same server.
Authentication, learning, XP, projects, workspace and certificates use the new
asynchronous repository in `server/db-postgres.js`. `server/database.js` selects
the provider explicitly and never falls back to SQLite after a PostgreSQL error.

## Local credentials

Edit the ignored root `.env` in VS Code; never put connection strings in chat:

```dotenv
DATABASE_URL="<exact Supabase runtime PostgreSQL URI>"
DIRECT_URL="<exact Supabase direct or session-pooler PostgreSQL URI>"
DB_PROVIDER=postgresql
```

Copy the host, database user, project reference, database name, and port from your
Supabase dashboard's Connect dialog. Substitute the database password locally;
percent-encode reserved characters in the password. A Supabase API key is not a
PostgreSQL password.

For this long-running Windows backend, the session pooler (port 5432) can be used
for both URLs. A direct `db.<project-ref>.supabase.co` connection requires working
IPv6 or the IPv4 add-on. DIRECT_URL must not use the transaction pooler (6543).
Use TLS settings from Supabase; do not disable certificate verification to
work around a trust error. If needed, configure the dashboard's CA certificate
using NODE_EXTRA_CA_CERTS locally.

The env files are ignored; only `.env.example` is tracked. Generated Prisma
Client files are ignored and regenerated from the schema.

## Installed version and commands

Prisma CLI, Client, and PostgreSQL adapter are pinned to 7.10.1. The existing
CommonJS app uses the supported `prisma-client-js` generator to avoid rewriting
the application module system. Prisma 7's CLI URL is configured in root
`prisma.config.ts` using DIRECT_URL; server/prisma.js uses DATABASE_URL at runtime.

```powershell
npm run db:validate
npm run db:generate
npm run db:check
npm start
```

`db:check` uses Prisma for SELECT-only transactions against both connections and
lists public table names without reading application records. It never creates
tables, imports data, runs seeds, or applies migrations. Error details are
suppressed because database drivers can include credentials in diagnostics.

## Models and applied migration

`schema.prisma` maps the actual 22-table committed SQLite database, checked
against `server/db.js` and the older PostgreSQL file `server/schema.sql`.
The older PostgreSQL file is not the migration source: it omits workspace,
certificate, location and other fields, and assumes Supabase Auth even though
this backend has its own password/session system.

The actual certificate participant IDs are TEXT, while `initSchema` describes
INTEGER IDs. The Prisma schema preserves the existing TEXT IDs. `certificate_otps` is a
legacy table present in the database and is retained to avoid losing data.
JSON strings, integer flags and text timestamps retain their current storage
formats; UUID/date/JSONB/boolean conversions require a deliberate data migration.
Defaults use a PostgreSQL UTC timestamp expression formatted like existing data.

Both local URLs passed SELECT-only Prisma connectivity checks. The remote public
schema was confirmed empty before applying the approved initial migration. The
SQL also passed local PGlite checks for all 22 tables, RLS, email uniqueness and roles.

`migrations/20261028000100_initial/migration.sql` is the applied initial migration.
It includes foreign keys, unique indexes, CHECK constraints, and
case-insensitive unique email/username indexes. It enables RLS on all application
tables with no anonymous policies, because hashes, sessions, hidden tests and
participant records must not be exposed through Supabase's Data API. Prisma
must connect using an appropriately privileged server-only database role.
No Supabase Auth policies or auth schema objects are created.

For future changes, prepare and review new migration SQL before applying it.
Do not rerun the initial SQL manually over existing tables. Prisma cannot model the custom CHECK
constraints, expression indexes and RLS settings; preserve these in SQL reviews.

The migration directory and PostgreSQL migration_lock.toml are tracked sources.
Further schema changes or imports require review and approval. There is no
automatic migration/seed in npm start or install. The explicit import tool
`scripts/import-sqlite.js --confirm-import` refuses to run if any application
table already contains records and rolls back the whole import on failure.

## Start, stop, restart and test

Start with `npm start`, open http://localhost:3000, and stop with Ctrl+C.
Restart with `npm start`. `/api/health` probes the database and reports
`database: "postgresql"`. On a fresh clone, run `npm ci` and
`npm run db:generate` after configuring the ignored `.env`.
For the background server from the first setup, use `.local/LOCAL-SETUP.md`.

`npm test` and `node --test tests/certificates.test.js` default to isolated
temporary SQLite copies. They do not write to the running app's database.
`npm run test:postgres` is explicit opt-in to integration tests against the
configured Supabase database. It creates unique temporary accounts/participants,
tests real PostgreSQL operations, and cleans up only the rows created by the run.
Use a dedicated Supabase test project for regular development/CI runs.

For offline development, explicitly set DB_PROVIDER=sqlite and
DB_PATH=.local/development.sqlite in your local `.env`. PostgreSQL remains the
normal runtime provider. The old `server/ingest_orcathon_participants.js` is a
legacy SQLite-only utility with a contributor-specific CSV path; it is not used
by the Prisma backend or the approved database import.

References:
- https://www.prisma.io/docs/orm/v7
- https://docs.prisma.io/docs/guides/upgrade-prisma-orm/v7
- https://supabase.com/docs/guides/database/prisma
