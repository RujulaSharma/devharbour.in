# Dev Harbour shared project guide

All Dev Harbour chats use the same repository. This guide connects the focused workstreams; it contains no secrets or participant lists.

## General & Coordination
The General chat retains the existing conversation history and coordinates changes spanning workstreams. Repository files remain the source of truth. Other chats do not automatically inherit the General chat's full history.

## Certificates
Owner: certificate eligibility, imports, issuance, PDF templates, certificate pages, verification and profile credential integration. See docs/workstreams/certificates.md.

## Website & Profiles
Owner: navigation, responsive design, theme, profile presentation and account settings UI. See docs/workstreams/website.md.

## Technical, Database & Security
Owner: authentication, sessions, Express APIs, PostgreSQL/Prisma, authorization, Cloudflare/Render deployment and diagnostics. See docs/workstreams/technical.md.

## Shared working agreement
- Read this guide and the relevant workstream guide before changes. Inspect git status first.
- All chats share one checkout: do not concurrently edit the same files or switch branches while another chat is working. Coordinate cross-scope edits through General.
- The user requests commits and pushes on main, without new branches. Never force-push or discard another chat's changes.
- Preserve existing user records, certificate IDs, XP and privacy preferences.
- Keep secrets and participant lists in ignored private storage or server configuration. Never copy them into guides, public assets, chat prompts or Git.
- Record a concise handoff in the relevant guide after meaningful changes: commit, validation, remaining work and deployment status. Never call a feature live without verification.
- No chat automatically monitors or synchronizes with another. Consult shared files and use explicit user-authorized coordination when needed.
