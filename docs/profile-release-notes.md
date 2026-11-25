# Advanced profiles — setup and release notes

Updated November 25, 2026. Local branch: `codex/developer-profile-ecosystem`.

## Status and preservation

The full specification remains partially implemented; `profile-implementation.md` lists completed, pending and blocked work. Nothing has been migrated to production, deployed or pushed. The existing profile is the default. The advanced frontend activates only when `/api/profile/config` returns `enabled:true`.

Existing authentication, sessions, email verification, XP ledgers, certificates, content and adapters are reused. Profile-name changes do not update `certificate_name` or issued certificates. Profile reads and goals do not award XP. All public sections and new profiles default to private. Email is owner-only.

The tracked legacy Prisma schema existed but was not connected to the installed runtime. Its models are preserved. The new Prisma client uses the existing PostgreSQL pool and trusted TLS configuration. Legacy Prisma model column types are not a complete introspection of the historically migrated database; do not use them to rebuild legacy tables.

## New database tables

- `developer_profiles`: owner key, headline/location/career metadata, visibility, privacy/links/pins JSON and optimistic version.
- `profile_entries`: education, experience, self-reported external credentials and immutable resume snapshots.
- `profile_skills`: normalized name, category, proficiency and pin state.
- `profile_activity`: reserved uniquely keyed events. Current contributions reuse the existing idempotent XP ledger instead.
- `profile_goals`: metric, target, baseline and deadline.
- `profile_media`: private object metadata; no binary data stored in PostgreSQL.
- `profile_connections`: follow, block, report, endorsement and collaboration/recruitment relationships.
- `profile_notifications`: unique owner/event keys and read state.

New tables have owner foreign keys, indexes, uniqueness constraints and RLS. Direct `anon`/`authenticated` grants are revoked. The trusted `devharbour_runtime` role gets server access, while Express enforces custom-session ownership and visibility. This is not Supabase Auth UID-based RLS.

## Dependencies, environment and local setup

Use Node 22.12+ or supported newer Node:

```powershell
npm ci --include=dev
npm run profile:validate
npm run profile:generate
npm run build
```

The generated client lives in ignored `server/generated/profile-client`. Generation/build never apply a migration.

Settings:

- Existing `DATABASE_URL`: backend-only PostgreSQL runtime connection; existing TLS validation is retained.
- `PROFILE_ECOSYSTEM_ENABLED`: default false. Enable only after migration/configuration verification.
- `PROFILE_PUBLIC_ORIGIN`: canonical website origin for QR codes and public metadata.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: server-only private Storage access. Never put a service key in frontend assets or public build variables.
- Existing `RENDER_ORIGIN`: Cloudflare server-side backend origin; also used by the new `/u/` function.
- `PROFILE_MIGRATION_URL`: explicit reviewed migration target. Prisma CLI deliberately does not fall back to the runtime URL.
- `PROFILE_MIGRATION_APPROVED=yes`: additional guard used by `npm run profile:migrate`.
- `PROFILE_TEST_DATABASE_URL`: optional isolated PostgreSQL test URL. Tests reject non-loopback hosts and databases not named `profile_test`.

Private Storage bucket: `developer-profile-private`, private, 4 MB limit. Review `prisma/storage-policies.sql` before configuring it. Uploads accept PNG/JPEG/WebP images and PDF documents. Images are decoded/re-encoded; PDF action dictionaries, including objects from compressed streams, are inspected. Private documents use attachment-only five-minute signed URLs. This is not a substitute for malware scanning/quarantine. Real Storage integration and automatic replacement cleanup are not yet validated.

GitHub and AI remain unavailable. Adding an arbitrary key does not complete those integrations. No private data is sent to them.

## Migration and rollout — approval required

1. Review additive SQL, independently inspect the existing schema and confirm a recoverable backup. Work on a staging clone first.
2. Set `PROFILE_MIGRATION_URL` explicitly for that staging target. For an existing database with no Prisma history, mark the comment-only baseline applied: `npx prisma migrate resolve --applied 202611240000_existing`. This establishes migration history without recreating old tables.
3. Review `202611240001_developer_profiles/migration.sql`. It creates new profile tables/indexes/constraints/policies; it does not rebuild users, XP, certificates or content.
4. Set the approval guard and run `npm run profile:migrate` against the reviewed target. Never run `prisma migrate reset` or `db push --accept-data-loss` against the live database.
5. Verify grants with the actual restricted server login. Do not substitute an administrator runtime connection as a shortcut.
6. Configure private Storage and server settings. Test owner/unauthorized file access.
7. Deploy to staging with the flag false, then enable there and smoke-test Google/email sign-in, certificates, every profile tab, privacy and uploads.
8. Obtain explicit approval before production migration/deployment or pushing to main. Repeat the reviewed process, enable the flag, and verify Cloudflare forwarding and both hostnames.

Disable the feature flag to return to the old profile. Keep additive data intact; do not drop tables as rollback.

Docker and Render builds now install build dependencies and generate Prisma. Docker then prunes development dependencies. `.dockerignore` excludes `.env`, private files, local databases, Git history and generated local clients.

## Isolated tests

Use a disposable local PostgreSQL 16 database named `profile_test`. No production rows are needed. Set the loopback test URL and run `node scripts/profile-test-database.cjs` once. It translates an in-memory legacy schema fixture and applies the additive profile migration. Do not rerun its migration on an already initialized fixture.

Run `node --test tests/profile_ecosystem.test.js` with the explicit test URL. Without it, PostgreSQL integration tests intentionally skip. All fixture accounts stay in this disposable database.

For existing regressions, set `NODE_ENV=test`, `DB_PATH=:memory:`, `DB_PROVIDER=sqlite` and blank database, Redis and email-service environment variables. Email tests install their own mocks. Never run the integration suite against production.

## API

Base `/api/profile`. Existing session cookie/bearer authentication is reused. Mutations validate origin/fetch metadata, ownership and input. Responses are private/no-store and requests are rate-limited. Public endpoints always pass server-side privacy projection.

- `GET /config`: rollout/storage capability and allowed options; no secrets.
- `GET/PATCH /me`: owner profile and validated edits. PATCH requires the last `version`; stale versions return 409.
- `POST /me/entries/:kind`, `PUT /me/entries/:kind/:id`, `DELETE /me/entries/:id`: education, experience and external-certificate CRUD.
- `POST /me/skills`, `PUT/DELETE /me/skills/:id`: owner skill CRUD. Client-supplied verification/XP is ignored.
- `GET /me/progress/:module`: overview, coding, learning, hackathons, certificates, workspace, xp, projects, achievements.
- `GET /me/activity?year=rolling|YYYY`, `GET /me/activity/:date`: calendar aggregate and bounded day detail.
- `GET /me/timeline?limit=20&before=CURSOR&type=all`: timestamp/ID keyset pagination, maximum 50 per page.
- `GET/POST /me/goals`, `PUT/DELETE /me/goals/:id`: owner goals with server-derived progress.
- `POST /me/media/:kind`: raw supported image/PDF body, optional `X-File-Name`, maximum 4 MB. Missing Storage returns 503.
- `GET /media/:id`: owner or explicitly permitted public signed URL. `DELETE /me/media/:id`: owner removal.
- `GET /me/connections?kind=follow|following|block`: owner lists capped at 100.
- `GET /me/notifications`, `PATCH /me/notifications/:id`: owner list/mark read.
- `GET /discover?search=...`: opted-in public developers only. Hidden college/company fields cannot match searches; blocks are excluded.
- `POST/DELETE /connect/:username/:kind`: follow, block, collaboration and recruitment. Reports use POST. Recruitment contact is limited to existing privileged roles pending dedicated recruiter permissions.
- `PATCH /me/requests/:id`: owner accept/decline of an incoming request.
- `POST/DELETE /skills/:id/endorsement`: idempotent endorsement; posting requires an accepted follow and visible skill.
- `GET/POST /me/resume-versions`: owner snapshot list/save. Saves title, summary, `ats|minimal` template, ordered sections and server-captured profile snapshot.
- `GET /me/resume-versions/:id/pdf`: owner-only immutable version PDF.
- `POST /me/resume`: owner PDF with editable summary/template/section order.
- `GET /me/exports/:kind`: resume, id, data or public-only portfolio download.
- `GET /me/id-card`: QR/SVG community card used by browser PNG export.
- `GET /me/score`: transparent recorded-learning indicator; no hiring eligibility decisions.
- `GET /me/recap/:year`, `GET /me/readiness`: annual aggregates and evidence checklist.
- `GET /integrations`: unsupported AI/GitHub/contest/roadmap status.
- `GET /public/:username`, `GET /public-html/:username`: privacy-filtered JSON/HTML.
- `/u/:username`: server-rendered public page, with Cloudflare forwarding. Private/followers-only profiles return 404 to anonymous visitors.

Resume sections: summary, skills, experience, education, projects, certificates, links. Unknown/duplicate sections fail validation. Snapshots exclude account email, credentials, private code and other resume snapshots.

## Validation and limitations

Verified: Prisma validation/generation/build; real PostgreSQL persistence; auth/CSRF/ownership/privacy and legacy API/settings checks; stale edits; no read-issued XP; duplicate follow/endorsement behavior; 1,001 tied events; valid PDF exports; resume snapshot isolation; invalid files, compressed-object PDF actions and missing Storage; annual recap API. Browser edits and education persisted after reload. Mobile document width equaled viewport width, without horizontal page overflow.

Final local run: **86 tests passed, zero failures/skips**, including **22 profile tests** on isolated PostgreSQL. The production build and Prisma client generation passed. The legacy Settings privacy toggle now synchronizes advanced visibility; changing only the theme cannot accidentally publish a profile. The footer test validates the actual existing static links rather than obsolete SPA attributes.

Screenshots in ignored `private/`: `profile-ecosystem-desktop.jpg`, `profile-ecosystem-mobile.jpg`. They show an isolated fixture account.

Still pending: real Storage smoke tests/cleanup, GitHub OAuth, AI, dedicated recruiter permissions, score configuration/history, full badge progression/notifications, extra leaderboards, richer cards/themes and some advanced UI controls. Later resume/recap/connection controls need comprehensive browser tests. Existing adapter-specific level formulas remain unchanged. See the implementation checklist; this is not a full production-ready completion claim.

## Files

New: `server/profile/` modules; `server/routes/profile.js`; `public/assets/profile-ecosystem.js`/`.css`; `functions/u/[[username]].js`; Prisma config/migrations/Storage SQL; migration/test scripts; profile tests; `.dockerignore`; profile documentation.

Modified: dependency manifests; original Prisma schema; canonical/root/standalone HTML; Express mounts and legacy profile API; leaderboard adapters (exclude zero-XP ranks); Docker/Render build setup; environment examples/ignores; footer regression assertions (existing static links).
