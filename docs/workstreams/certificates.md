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
27 November 2026: certificate template implementation 9a3b38b uses the user-approved flat Orcathon and Innovative India artwork for both browser previews and PDF downloads. Names are editable in each owner workspace; the existing claim page also links to name editing. IDs, dates, signatures, marks, eligibility and account identity are preserved. Long names fit the available field, and supported multilingual names use the existing Devanagari font fallback.

Blank backgrounds and shared field coordinates live in public/assets/certificates/. The PDF renderer is server/certificate_generator.js; certificate-workspace.js/.css share the owner-page rendering. The source reference containing a sample recipient stays in ignored private storage; only flattened blank artwork is published. scripts/prepare-certificate-templates.py documents source preparation and requires Pillow, ReportLab and Poppler only for rebuilding the static assets, not website runtime. Backgrounds preserve the raster reference artwork (Orcathon 2048 x 1450; Innovative 800 x 533); names and IDs remain selectable vector text. A higher-resolution original Innovative export can replace its blank background later without changing issuance or IDs.

Validation: 39 tests passed across certificate templates, issuance, ownership, Google sign-in, profile/privacy and sidebar startup. Production build passed. Rendered PDF inspection covered both designs, long and multilingual names; text extraction confirmed searchable names. Local browser checks verified desktop/mobile layouts, live name previews, saving and actual PDF download. The Innovative eligibility test checks its event specifically so it remains compatible with Website & Profiles' concurrent Orcathon profile synchronization.

Release 9a3b38b was pushed to main. Cloudflare's live blank artwork and layout JSON returned 200 and matched local SHA-256 hashes. Render reports 9a3b38b59b1b8a7ba2afb2f2f8cd1cd72eb3879c as its last successfully deployed live commit, deployment dep-dc49140473hc739apmsg. Name-edit/download end-to-end checks used isolated fixtures; no production participant records were edited for visual testing.

## Previous profile handoff
27 November 2026: implementation commit 4f5a814 adds automatic Innovative issuance when an authenticated owner loads profile overview or certificates. The same verified email, Gmail Google-session check, Innovative eligibility and original signup-name requirements apply; existing IDs and revocations are preserved. Public reads do not issue certificates, and profile/section visibility remains opt-in.

The supplied spreadsheet was compared privately against the configured PostgreSQL registry: all 1303 unique listed emails are already eligible, with no other eligible Innovative emails. No registry or issued-certificate records were changed by this verification. Participant data and comparison scripts remain in ignored private storage.

Validation: 36 tests passed across certificate, Google authentication, Orcathon workspace and profile suites; one isolated PostgreSQL profile integration test was skipped because its test database was not configured. Production build and git diff checks passed. Prior Innovative workspace/import release: abe82b2.

Release 8af75ed was pushed to main and verified deployed on both Cloudflare Pages and Render. Render identifies 8af75edf2e3cbc8022fcc8ad03702903e931a34d as its last successfully deployed, live commit (deployment dep-dc48jta9lscs73e1ubf0). Live API health returned 200; unauthenticated profile-certificate and Innovative-workspace requests returned 401. Live authenticated/visual verification remains unperformed. Existing Vercel account deployment blocking and Supabase Preview migration-history mismatch also affect the preceding release 61dfa7d; neither prevented the active Cloudflare/Render deployment. Those unrelated configuration issues were not changed.
