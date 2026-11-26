# Website & Profiles workstream
Read README.md first.

## Source files
- public/index.html — canonical site; root index.html is generated
- public/assets/profile-ecosystem.js and .css — profile/settings renderer
- scripts/build.js and scripts/build_standalone.js — regenerate synchronized outputs
- public/assets/profile-page.* — legacy profile assets; avoid reintroducing conflicting renderers

## Routes
/profile: owner profile; /u/:username: privacy-controlled public profile.
/theme: appearance only; /settings: account settings.
/profile/setting and /profile/setting/privacy: profile settings and privacy.
Legacy aliases may exist; preserve working links while normalizing navigation.

## Rules
Use white/lavender reference, real data and accessible responsive controls. Owner and visitor share one renderer. No profile editing controls for visitors. Theme highlights only on /theme. Settings link stays at bottom of sidebar. Profile assets are bundled atomically by build.js. Coordinate shared certificate rendering with Certificates.

## Known regression
Sidebar initialization previously crashed because Settings is an anchor, not a button. Regression test: tests/sidebar_startup.test.js. Avoid assumptions that every sidebar entry is a button.

## Latest handoff — 27 November 2026
Implementation 4aea913 provisions persistent profiles for existing accounts, retains their saved location and safe GitHub/portfolio links, and recovers a missing profile on first read. Account names, bios, avatars and membership dates continue to come from the existing account record. Existing profile edits and explicitly cleared links take precedence. New profiles are private; discovery, recruitment and sensitive sections remain opt-in. New signups also retain their supplied location.

Authenticated owner overview/certificate requests synchronize both approved event namespaces through server/profile/certificates.js. Orcathon uses its approved registration name; Innovative retains its original-signup-name and Gmail Google-session requirements. Existing IDs and revocations are preserved. Public reads never issue certificates. Certificates updated its Innovative-only guard test in 9a3b38b to allow an independently eligible Orcathon credential.

The authorized production maintenance run created 385 missing profiles: all 396 accounts now have a profile. It issued 50 additional eligible Innovative certificates. Of the 18 remaining eligible accounts without a certificate, 4 need email verification, 4 need a qualifying sign-in, and 10 have no recorded original signup name and require support verification. No eligibility lists were expanded. Private pre-run snapshots and verification results are in ignored private storage; no identities or credentials belong in this guide. Comparisons confirmed all prior profiles/certificates, account rows, user settings and XP records unchanged.

Maintenance: node scripts/backfill-profiles.cjs previews missing profiles; add --certificates to preview certificate readiness. --apply performs the idempotent backfill using the existing configured database. It prints aggregate counts only.

Validation: 45 tests passed, including real PostgreSQL JSON/timestamp/batch behavior via isolated PGlite, account recovery, both event certificates, concurrent reads, original names, revocations, ownership, public privacy and sidebar startup. One separate loopback PostgreSQL integration test was skipped because its database was not configured. Production build and diff checks passed.

Deployment: 4aea913bd9aecd0a055010fc1fc60296d8806fdd is pushed to main. Cloudflare Pages reports success; Render identifies it as the successfully deployed live commit (dep-dc492vd9el5s73b8ljbg). Authenticated live checks for newly backfilled accounts with two, one and zero certificates returned 200, matched saved details and credential IDs, kept private profiles inaccessible to anonymous visitors, and returned private/no-store headers. Anonymous owner-certificate requests returned 401. Existing Vercel account blocking and Supabase Preview migration-history mismatch remain unrelated deployment-check failures; the active Cloudflare/Render services were verified.
