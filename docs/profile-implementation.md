# Developer profile implementation checklist

Updated November 25, 2026. Branch: codex/developer-profile-ecosystem.

This is a working local implementation. The complete 50-section specification is not finished. No production migration, deployment or push has happened.

## Phase 1 — foundation: implemented locally; real Storage validation blocked

- [x] Inspect repository, legacy Prisma schema, database column metadata, custom sessions, XP and existing modules.
- [x] Introduce Prisma runtime with user approval, preserving original models and adapters.
- [x] Additive schema, foreign keys, indexes, RLS and isolated PostgreSQL migration tests.
- [x] Wide lavender/white profile, responsive desktop/mobile layout, existing navigation and reduced-motion styles.
- [x] Header, cover presets, account/career fields, social/custom links, education/experience CRUD and categorized skills.
- [x] Optimistic edit versions, input validation, ownership and server-enforced per-section visibility.
- [x] Private image/PDF upload pipeline, centered crop/zoom, signed URLs and owner removal.
- [x] Invalid-file/missing-Storage tests; browser save/reload of details and education; desktop/mobile screenshots.
- [ ] Configure/test the actual private Storage bucket, image/PDF uploads, signed downloads and removal.
- [ ] Automatic replaced-file cleanup/retries and free-position image cropping.

## Phase 2 — progress: core implemented; advanced behavior pending

- [x] Existing XP/levels, actual statistics and streaks; never reset balances or issue XP from profile reads.
- [x] India-date activity heatmap, rolling/year views, month labels/totals, date detail and stable cursor timeline.
- [x] 1,001 tied history events tested with no omissions or duplicates.
- [x] Goal CRUD, baseline/progress/completion from server records, existing earned badges and XP source breakdown.
- [ ] Unified configurable level thresholds (existing SQLite/PostgreSQL formulas differ).
- [ ] Locked badge catalog/progress, additional validated awards, level-up animation and event notifications.
- [ ] Recurring goals, history/reminders and non-XP contribution producers. New profile_activity is reserved, not wired.

## Phase 3 — existing modules connected; advanced summaries pending

- [x] Recorded DSA topics/difficulty/languages/recent submissions; truthful grading-unavailable state.
- [x] Approved projects, existing gallery actions and ownership-validated project/certificate pins.
- [x] Event registration history; no fabricated ranks, wins, submission results or prizes.
- [x] Course/lesson progress and recorded reading time; owner-only workspace counts.
- [x] Certificate metadata and original authorized download/verification flow.
- [x] Global/monthly ranks; zero-XP accounts no longer receive a misleading rank in either adapter.
- [x] Honest unavailable states for contest ratings and roadmap milestones.
- [ ] DSA charts, full challenge dashboard, profile project thumbnails/filters, extra leaderboards and nearby rankings.
- [ ] Full course completion/event-result summaries where underlying records support them.

## Phase 4 — core public ecosystem implemented; further integrations pending

- [x] Server-rendered public route, Cloudflare forwarding, canonical/Open Graph metadata and privacy projection.
- [x] Public permitted biography/skills/education/experience/projects/activity/events and explicitly pinned certificates.
- [x] Follow/unfollow/requests, block/unblock/report, collaboration requests and accept/decline.
- [x] Opt-in discovery with debounced search; hidden education/company values are not searchable or returned.
- [x] Owner connection/notification lists; blocks remove prior follows and endorsements.
- [x] QR community ID SVG/PDF and browser PNG export, clearly not an official identity document.
- [ ] Dedicated moderation dashboard, richer matching filters, mutual connections and community post/discussion integration.
- [ ] Front/back flip cards, customizable social-card sizes and public avatar/cover rendering.
- [ ] GitHub OAuth/import/sync: requires a dedicated app, reviewed scopes and encrypted token storage; not implemented.

## Phase 5 — partially implemented

- [x] Transparent recorded-learning score and clearly self-reported skill radar; no hiring decisions.
- [x] ATS/minimal PDF resume templates, editable summary, selected/ordered sections and immutable owner snapshots.
- [x] Owner JSON export and public-only HTML portfolio export.
- [x] Career evidence checklist and recruitment consent/contact guards.
- [x] Recorded annual recap API and slide/PNG controls; API verified.
- [x] Honest unavailable AI interface; no private profile data transmitted to an AI provider.
- [ ] Configurable score weights/history, role-specific readiness and dedicated recruiter permissions/UI.
- [ ] Multiple portfolio themes, visual resume preview and comprehensive notification preferences/producers.
- [ ] Comprehensive browser coverage for later resume, recap, connection and privacy variants.

## Release gates

- [x] Prisma validation/generation and production build.
- [x] Actual PostgreSQL tests: auth, CSRF, ownership, privacy, optimistic concurrency, RLS, invalid files, exports, snapshots, extensive history and recap.
- [x] Foundation desktop/mobile browser save/reload and screenshots.
- [x] Existing auth, certificate, project, workspace and leaderboard regression checks.
- [x] Update obsolete footer test assertions to validate actual static policy links.
- [ ] Real private Storage and production-like restricted-role smoke tests.
- [ ] Reviewed migration/backup, staging verification and explicit production release approval.

See profile-release-notes.md for API, environment, migration/setup instructions and known limitations. Do not enable rollout solely because the build passes.
