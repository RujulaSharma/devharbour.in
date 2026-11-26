# Technical, Database & Security workstream
Read README.md first.

## Architecture
Frontend: Cloudflare Pages; /api proxy in functions/api/[[path]].js to configured Render backend. Express server: server/index.js. Database: Supabase PostgreSQL, project timepass. Runtime pg adapter: server/db-postgres.js. Profile Prisma uses shared trusted pool. Never expose connection strings or service-role credentials.

## Source files
server/auth.js; server/routes/auth.js; server/db.js; server/db-postgres.js; server/profile/; prisma/; functions/; tests/.

## Rules
Only verified server sessions authorize mutations. Preserve strict same-site HttpOnly cookies, revocation and reset behavior. Cookie supports devharbour.in and www alias. Default sessions are 30 days unless production configuration overrides. Temporary outages must not clear valid local session state. Existing SQLite path is for isolated local tests, not production fallback.

## Coordination
Certificate eligibility and imports belong to Certificates; shared DB/auth changes must preserve both event namespaces. All work is on main per user preference. Inspect pending changes and coordinate before shared-file edits. Use meaningful regression tests and production build. Do not claim deployment success based only on a Git push.
