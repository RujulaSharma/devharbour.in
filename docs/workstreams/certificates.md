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
27 November 2026: implementation commit 4f5a814 adds automatic Innovative issuance when an authenticated owner loads profile overview or certificates. The same verified email, Gmail Google-session check, Innovative eligibility and original signup-name requirements apply; existing IDs and revocations are preserved. Public reads do not issue certificates, and profile/section visibility remains opt-in.

The supplied spreadsheet was compared privately against the configured PostgreSQL registry: all 1303 unique listed emails are already eligible, with no other eligible Innovative emails. No registry or issued-certificate records were changed by this verification. Participant data and comparison scripts remain in ignored private storage.

Validation: 36 tests passed across certificate, Google authentication, Orcathon workspace and profile suites; one isolated PostgreSQL profile integration test was skipped because its test database was not configured. Production build and git diff checks passed. Prior Innovative workspace/import release: abe82b2. Deployment of the profile change and live authenticated/visual verification remain unconfirmed.
