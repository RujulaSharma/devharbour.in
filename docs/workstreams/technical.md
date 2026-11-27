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

## Latest handoff — 27 November 2026
Implementation 72163958b76c98667796312c29550d899653b168 fixes authentication controls during temporary session failures. Previously, an HTTP 429/5xx from /api/auth/me returned before the first updateAuthUI call: a cached account looked signed out and the guest sign-in button had no click handler. Controls now initialize after DOM readiness independently of the session request. Temporary failures preserve cached identity; only a confirmed 401, including the cookie fallback when applicable, clears it.

Session reads use bounded retries that honor Retry-After, deduplicate overlapping checks and respect the active cooldown. Returning online rechecks the session. Password login and logout handle explicit Render hibernation rejections through the existing helper; security challenges are distinguished and never retried as cold starts. Logout still requires server revocation before clearing local identity, and old session responses cannot restore a successfully signed-out account.

Validation: 42 targeted tests passed; one optional loopback PostgreSQL integration test was skipped because its test database was not configured. The production build, inline-script syntax checks and generated/canonical HTML comparison passed. Browser QA reproduced the original dead sign-in button and 429 profile state, then verified working guest login and cached account controls against a local forced-429 service. The authenticated production profile loaded again after the backend recovered. No account, database, certificate, eligibility or privacy records were changed; unrelated ID-card and SEO work was preserved.

Deployment: 7216395 is pushed to main and Cloudflare Pages reports a successful deployment (5c5d5a23-fc5d-4784-9289-7097506cf343). The live /profile HTML contains the new initialization and recovery code. Browser verification after deployment loaded the authenticated owner profile and hid the guest sign-in button. Public health returned 200; anonymous session/profile reads returned 401, and anonymous logout returned 200 with a cleared cookie. The existing Supabase Preview migration-history mismatch remains a separate failed check. The existing free Render backend may still need to wake after inactivity. Initial public API checks returned 429 (some with cf-mitigated: challenge); direct backend and public health checks later returned 200. No Cloudflare security settings or hosting plan were changed.
