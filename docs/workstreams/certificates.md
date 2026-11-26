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
Innovative workspace and import pushed to main through abe82b2. Build and 15 certificate/page tests passed. Live deployment and visual verification remain unconfirmed.
