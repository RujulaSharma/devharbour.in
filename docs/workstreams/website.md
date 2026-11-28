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

## Profile layout — 28 November 2026
Implementation ffac66f ([PR #51](https://github.com/RujulaSharma/devharbour.in/pull/51)) removes the dashboard side panel whenever the owner or public profile view is active. The content uses a single full-width page column; its own About, Skills, Links and Developer Identity cards remain part of the profile. The panel backdrop and greeting are hidden, and mobile profile navigation has four working destinations without the panel-opening Menu button. Other views automatically retain their normal sidebar and its saved expanded/collapsed state.

Validation: existing sidebar startup regression, production build, synchronized generated HTML and diff checks passed. Release proceeds through the PR's Cloudflare Pages deployment checks; rendered browser verification was initially unavailable because the browser window could not be read. No account, certificate or eligibility data is changed.

## Latest handoff — 27 November 2026
Account-list follow-up, implementation b177d7b: audited all 396 accounts and prepared the explicitly requested private workbook in ignored private storage. There are 381 verified accounts, 344 eligible event registrations and 322 currently available valid certificates across 316 accounts. No duplicate account emails or conflicting certificate owners were found. Two historical valid records belong to registrations currently marked ineligible; both are excluded from profiles and the private list, and live download requests were denied. No account, registry or historical credential rows were altered by this audit/export.

Profile overview counts now use the same valid-status, verified account email, explicit ownership and event eligibility projection as the certificate list. Regression coverage includes withdrawn eligibility, conflicting owners, revocation and attempted cross-account query selection. All 33 selected tests passed, as did a production frontend build in an isolated directory to avoid the concurrent identity-page edits. Cloudflare reports a successful b177d7b deployment. Live authenticated checks for both historical ineligible cases returned matching eligible lists/counts, hid the ineligible IDs and rejected their downloads, confirming the backend correction is active. Browser deployment-status inspection was unavailable for this follow-up; release verification used live API behavior. Private workbook validation checks all account identifiers and certificate associations; no names/emails/credentials are copied into guides or Git. No email notifications were sent.

Implementation 4aea913 provisions persistent profiles for existing accounts, retains their saved location and safe GitHub/portfolio links, and recovers a missing profile on first read. Account names, bios, avatars and membership dates continue to come from the existing account record. Existing profile edits and explicitly cleared links take precedence. New profiles are private; discovery, recruitment and sensitive sections remain opt-in. New signups also retain their supplied location.

Authenticated owner overview/certificate requests synchronize both approved event namespaces through server/profile/certificates.js. Orcathon uses its approved registration name; Innovative retains its original-signup-name and Gmail Google-session requirements. Existing IDs and revocations are preserved. Public reads never issue certificates. Certificates updated its Innovative-only guard test in 9a3b38b to allow an independently eligible Orcathon credential.

The authorized production maintenance run created 385 missing profiles: all 396 accounts now have a profile. It issued 50 additional eligible Innovative certificates. Of the 18 remaining eligible accounts without a certificate, 4 need email verification, 4 need a qualifying sign-in, and 10 have no recorded original signup name and require support verification. No eligibility lists were expanded. Private pre-run snapshots and verification results are in ignored private storage; no identities or credentials belong in this guide. Comparisons confirmed all prior profiles/certificates, account rows, user settings and XP records unchanged.

Maintenance: node scripts/backfill-profiles.cjs previews missing profiles; add --certificates to preview certificate readiness. --apply performs the idempotent backfill using the existing configured database. It prints aggregate counts only.

Validation: 45 tests passed, including real PostgreSQL JSON/timestamp/batch behavior via isolated PGlite, account recovery, both event certificates, concurrent reads, original names, revocations, ownership, public privacy and sidebar startup. One separate loopback PostgreSQL integration test was skipped because its database was not configured. Production build and diff checks passed.

Deployment: 4aea913bd9aecd0a055010fc1fc60296d8806fdd is pushed to main. Cloudflare Pages reports success; Render identifies it as the successfully deployed live commit (dep-dc492vd9el5s73b8ljbg). Authenticated live checks for newly backfilled accounts with two, one and zero certificates returned 200, matched saved details and credential IDs, kept private profiles inaccessible to anonymous visitors, and returned private/no-store headers. Anonymous owner-certificate requests returned 401. Existing Vercel account blocking and Supabase Preview migration-history mismatch remain unrelated deployment-check failures; the active Cloudflare/Render services were verified.
