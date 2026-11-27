# Certificates workstream
Read README.md first.

## Source files
- server/routes/certificates.js — existing claim/verification routes
- server/innovative_certificates.js, server/certificate_generator.js — Innovative issuance/template
- server/routes/orcathon-certificate.js, server/routes/innovative-certificate.js — owner workspaces
- public/orcathon-certificate/, public/innovative-certificate/ and matching public/assets scripts
- server/profile/progress.js — profile certificate integration
- tests/*certificate*.test.js, tests/orcathon_workspace.test.js

## Current registry state (27 November 2026)
Orcathon: 693 approved emails; Innovative India: 1303 approved emails. Lists are isolated by event_slug. Imports preserved prior certificate IDs. Private snapshots are ignored by Git. No participant identities belong here.

## Rules
Verified session email controls eligibility and ownership. Name editing affects certificate display only, never eligibility or account identity. Preserve Innovative Google verification and existing PDF template. Profile public visibility remains opt-in. Coordinate shared profile UI with Website and authorization with Technical.

## Latest handoff
ID styling — 27 November 2026: the user-supplied portrait-card reference is implemented with angular dark metal, violet lighting, a large saved profile photo, pointer tilt, front/back flip and keyboard/reduced-motion support. The page retains /id/:developerId and the profile entry points. Both sides download as self-contained SVG or 1440 × 1960 PNG; names and IDs fit their fields. No database, eligibility, certificate or privacy preferences were changed.

Private avatar uploads and Google profile photos are embedded only after the existing ID access check. Server image fetching is restricted to configured Supabase storage and Google image hosts, rejects redirects and oversized/non-raster responses, and falls back to initials. Arbitrary external avatar URLs are not fetched. QR/statistics visibility, private profiles, follower access and blocks apply to both sides and all download formats.

Validation: 33 targeted ID/profile/routing/provisioning/sidebar checks passed; the production build and diff checks passed. The 11 ID/image checks passed again after final renderer adjustments. Isolated browser QA verified owner preview, front/back flip, keyboard flip, an actual PNG download and 390px mobile layout without horizontal overflow. Front/back SVGs and a long-name/long-ID fixture were rasterized and visually inspected.

Release 8bb603d39d47e92c92d3410fe602022d1c1ebee7 was pushed to main. Cloudflare Pages reports success; hosted ID HTML, JS and CSS match the release files after normalizing transport line endings/BOM. Render deployment dep-dc4qm0ojo6nc73c1lp2g reports "Deploy succeeded | Live" for that exact commit. Public and direct-backend health return 200 and the new download validation handler responds as expected. The live browser page displays the new design and the expected signed-out privacy message. Signed-in interaction/download QA used isolated fixtures; no production profile records were edited. The existing Supabase Preview migration-history failure remains unrelated.

Developer ID page — 27 November 2026: implementation 2411cf1 makes Profile's Developer Identity tile and "View ID card" link open /id/:developerId. The page loads saved name, username, stable DH identifier, membership date and permitted progress/location details, previews the card and downloads SVG. server/profile/id-card.js owns the provisional renderer, ready for the user's later artwork. The previous /api/profile/me/id-card download remains available. QR, developer-ID and section privacy, follower access, blocks and owner access are enforced; no email, password, signup-name or participant data is returned. functions/id/[[developerId]].js forwards the parameter page to its Express route, using the existing Render origin. A static rewrite initially left hosted parameter URLs on the homepage, so the explicit Pages Function replaces it.

Validation: 30 ID/profile/provisioning/sidebar and Cloudflare routing tests and the production build passed. Tests cover owner and visitor access, private cards, hidden fields and QR, escaped names, stable IDs, download/preview agreement, blocks, follower-only ID sections, invalid IDs and hosted parameter forwarding. A full signed-in browser click/download and mobile visual check could not be completed after the local preview connection became unavailable. Final ID artwork is intentionally pending the user's next reference.

Release: 2411cf1 reached main through the concurrent b177d7b update; 86c1a73 fixes Cloudflare parameter routing. b671b01 fixes a trailing-newline QR wrapper that made nested SVG invalid, with image-decoder validation added to the ID test. The 13 affected ID/routing checks passed again, and the provisional SVG was rendered and visually inspected. Cloudflare reports success for b671b01; live /id/:developerId HTML and its JS match the release files, and the API returns private/no-store 404 for unavailable IDs. The live browser page showed the expected signed-out privacy message. Render identified b671b017762fb2ae1fe2f8015d092dab42394ea5 as its successfully deployed live commit after the superseded 86c1a73 rollout was canceled to release the queue.

27 November 2026: certificate template implementation 9a3b38b uses the user-approved flat Orcathon and Innovative India artwork for both browser previews and PDF downloads. Names are editable in each owner workspace; the existing claim page also links to name editing. IDs, dates, signatures, marks, eligibility and account identity are preserved. Long names fit the available field, and supported multilingual names use the existing Devanagari font fallback.

Blank backgrounds and shared field coordinates live in public/assets/certificates/. The PDF renderer is server/certificate_generator.js; certificate-workspace.js/.css share the owner-page rendering. The source reference containing a sample recipient stays in ignored private storage; only flattened blank artwork is published. scripts/prepare-certificate-templates.py documents source preparation and requires Pillow, ReportLab and Poppler only for rebuilding the static assets, not website runtime. Backgrounds preserve the raster reference artwork (Orcathon 2048 x 1450; Innovative 800 x 533); names and IDs remain selectable vector text. A higher-resolution original Innovative export can replace its blank background later without changing issuance or IDs.

Validation: 39 tests passed across certificate templates, issuance, ownership, Google sign-in, profile/privacy and sidebar startup. Production build passed. Rendered PDF inspection covered both designs, long and multilingual names; text extraction confirmed searchable names. Local browser checks verified desktop/mobile layouts, live name previews, saving and actual PDF download. The Innovative eligibility test checks its event specifically so it remains compatible with Website & Profiles' concurrent Orcathon profile synchronization.

Release 9a3b38b was pushed to main. Cloudflare's live blank artwork and layout JSON returned 200 and matched local SHA-256 hashes. Render reports 9a3b38b59b1b8a7ba2afb2f2f8cd1cd72eb3879c as its last successfully deployed live commit, deployment dep-dc49140473hc739apmsg. Name-edit/download end-to-end checks used isolated fixtures; no production participant records were edited for visual testing.

## Previous profile handoff
27 November 2026: implementation commit 4f5a814 adds automatic Innovative issuance when an authenticated owner loads profile overview or certificates. The same verified email, Gmail Google-session check, Innovative eligibility and original signup-name requirements apply; existing IDs and revocations are preserved. Public reads do not issue certificates, and profile/section visibility remains opt-in.

The supplied spreadsheet was compared privately against the configured PostgreSQL registry: all 1303 unique listed emails are already eligible, with no other eligible Innovative emails. No registry or issued-certificate records were changed by this verification. Participant data and comparison scripts remain in ignored private storage.

Validation: 36 tests passed across certificate, Google authentication, Orcathon workspace and profile suites; one isolated PostgreSQL profile integration test was skipped because its test database was not configured. Production build and git diff checks passed. Prior Innovative workspace/import release: abe82b2.

Release 8af75ed was pushed to main and verified deployed on both Cloudflare Pages and Render. Render identifies 8af75edf2e3cbc8022fcc8ad03702903e931a34d as its last successfully deployed, live commit (deployment dep-dc48jta9lscs73e1ubf0). Live API health returned 200; unauthenticated profile-certificate and Innovative-workspace requests returned 401. Live authenticated/visual verification remains unperformed. Existing Vercel account deployment blocking and Supabase Preview migration-history mismatch also affect the preceding release 61dfa7d; neither prevented the active Cloudflare/Render deployment. Those unrelated configuration issues were not changed.
