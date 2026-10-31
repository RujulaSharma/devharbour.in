# Local Redis for Dev Harbour

The checked-out backend is Express/CommonJS with Prisma 7 and Supabase
PostgreSQL. It is not a Next.js application. The official `redis` Node client
(pinned in package.json) is used in a reusable server-only connection module;
the same client also works in Next.js Node server code, but not its Edge runtime.

## Start and stop

From the project folder in PowerShell, with Docker Desktop running:

```powershell
npm run redis:setup
docker compose up -d --wait redis
npm run redis:check
npm start
```

The setup script preserves an existing secret and refuses to overwrite a
different REDIS_URL. It generates a random 256-bit password into the ignored
`.local/redis/password` file, backs up `.env` locally, and configures REDIS_URL
without displaying credentials. Do not paste these values into chat or Git.
Do not prefix REDIS_URL with NEXT_PUBLIC_ or put it in frontend code.

Stop Redis while preserving its container and named volume:

```powershell
docker compose stop redis
```

Start it again with `docker compose up -d --wait redis`. Restart it with
`docker compose restart redis`, then check `docker compose ps` and
`npm run redis:check`. No volume deletion or FLUSHDB/FLUSHALL is needed.

Stop a foreground backend with Ctrl+C; run `npm start` to restart it. The setup
backend runs in the background with its PID in `.local/server.pid`; see
`.local/LOCAL-SETUP.md` before starting a second backend on port 3000.

## Container settings

`compose.yaml` runs Redis only. Supabase stays external and unchanged.
The official image is pinned to `redis:8.2.10-alpine3.22` and the verified digest
`sha256:cead8b06d60a363832e64f5007101ae917fe8a77ec354dfb3be3655a2a351018`.

- Host port: `127.0.0.1:6379`; no LAN/IPv6 host binding.
- Authentication: password supplied as a Compose file secret. The startup
  script builds a private config on tmpfs, keeping it out of process arguments.
- Persistence: AOF with fsync every second, plus periodic RDB snapshots.
  Data lives in `devharbour-local_redis-data`, which is preserved on stop/restart.
- Health check: authenticated PING must return PONG.
- Memory: 128 MB, with least-recently-used cache eviction.
- The root filesystem is read-only; runtime config uses tmpfs and data uses
  the named volume. Redis runs as the image's redis user after initialization.

## Public course cache

Only `GET /api/courses` is cached. Authentication, profiles, sessions, lesson
progress, code submissions, projects and certificates are not cached here.
Category listings have separate hashed keys; the database identity is hashed
into the namespace to keep databases apart. HTTP responses retain their existing
JSON format and add `X-Course-Cache: MISS`, `HIT`, or `BYPASS`.

`REDIS_CACHE_TTL_SECONDS` defaults to 300 seconds (five minutes). Restart the
backend after changing it in `.env`. TTL applies to listing keys; the shared
generation marker persists and is safely regenerated if evicted.

Course create/update/upsert/delete operations through `server/prisma.js`
invalidate every category's cache using a new UUID generation. Interactive and
batch transactions defer invalidation until commit; rollback does not
invalidate. In-flight reads cannot refill the new generation with old results.
Use top-level `prisma.courses` operations for course edits; nested relation
writes and raw SQL are not model query operations.

Changes made directly in the Supabase dashboard, raw SQL, another application,
or the legacy SQLite utility bypass Prisma's hooks. After such an edit, run:

```powershell
npm run cache:invalidate-courses
```

Otherwise those changes become visible when the five-minute TTL expires.
No database triggers, schema migrations or Supabase writes were introduced for
Redis invalidation.

## Redis is optional

Unset REDIS_URL, set REDIS_ENABLED=false, or stop the container to disable caching.
The backend reads PostgreSQL normally. Connections have short deadlines,
offline command queuing is disabled, and failed connections use a five-second
cooldown before retrying on a request. Redis errors and credentials are never
returned to the browser or logged. A failed invalidation is retried before this
process resumes cache reads. Multiple independent processes and direct database
edits still need shared Redis availability or explicit invalidation/TTL expiry.

## Verification

```powershell
npm run redis:check
npm run test:redis
npm test
node --test tests/certificates.test.js
node scripts/verify-redis-backend.js
```

Redis tests use only unique test namespaces and clean up only their own keys.
Write-invalidation hooks are tested with simulated Prisma writes/transactions;
they do not edit Supabase. The backend verification script reads public API
endpoints and uses an explicitly read-only Prisma transaction. It changes only
Redis cache generations. Normal backend tests use isolated SQLite copies.
Do not run `npm run test:postgres` under a no-Supabase-writes constraint: that
older integration suite intentionally creates temporary database records.

Setup verification covered authenticated PONG, rejection without authentication,
MISS → HIT on live course listings, category isolation, TTL, invalidation,
concurrent reads, unavailable/stalled Redis, outage fallback, and persistence
through a Redis stop/start. The source SQLite files and Docker volumes were
preserved; nothing was pushed to GitHub.
