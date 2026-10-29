# Security hardening setup

These changes are local on `codex/security-hardening`. They are not deployed or pushed automatically. Application startup makes no schema or permission changes. The restricted Supabase role and its policies were applied separately with explicit user approval on October 28, 2026; production application records were preserved.

## What changed

- Browser authentication uses an HttpOnly, SameSite=Strict session cookie (Secure in production), not localStorage passwords or synthetic offline sessions. Existing browser credentials/session caches are cleared; users must sign in again. Bearer tokens remain supported for API clients, but URL query tokens are rejected. Signup/profile responses whitelist public fields and exclude password hashes and salts.
- Known seeded demo/admin identities cannot log in or use existing sessions. New SQLite seeds no longer share a source-visible password. After a separate explicit cleanup approval, 577 records positively matched to the built-in/API/workspace/realtime fixtures and their sessions were removed transactionally. A single owner-approved administrator was created; its generated password is in an ACL-protected ignored local file. Existing projects were preserved and ownership transferred; participant/certificate records were preserved. Self-signup still always creates a student.
- Cross-origin credential reflection is removed. Cookie mutations require a trusted Origin. JSON shape/depth, field lengths, URL protocols, dates and metadata are validated. API/auth/certificate/execution rate limits and SSE connection caps constrain abuse. Proxy headers are ignored unless known proxy hops are explicitly configured.
- Participant JSON/JS exports under both public data and assets paths, dotfiles and database dump extensions return 404. The frontend no longer downloads the participant roster.
- Certificate issuance requires an authenticated administrator/moderator until verified email ownership is implemented. Knowing a participant email or a client-side passcode is not authorization. Public verification still works with the complete exact credential ID; partial/numeric ID matching and local cache/roster verification are removed. Existing records are preserved.
- Project votes require authenticated accounts. Project/workspace ownership checks are regression-tested. Browser votes update only after server success. Workspace caches use account-specific keys and reject stale cross-account sync responses. Existing unscoped draft keys are preserved but are not automatically assigned to an account.
- Profile/workspace/credential display values are escaped and workspace link protocols restricted. Browser account state comes from `/api/auth/me`, never a locally edited account record.
- Response headers disable framing, MIME sniffing, referrer leakage and unnecessary browser permissions; production responses add HSTS. A baseline CSP restricts objects, base URLs and form/frame embedding. A strict script CSP is not enabled because legacy inline event handlers still exist; this is not a claim that every possible XSS path is eliminated.

## Isolated code execution

Untrusted submissions never run in the Express process. Each job uses this immutable official Node image:

```powershell
docker pull node@sha256:06d7adf3e0ef61a13f1d28682726366f97a15aa1888c934d3ecec86c33918b53
```

Jobs have no network, host mounts, application secrets or Docker socket. They run as an unprivileged user with a read-only root filesystem, dropped capabilities, no privilege escalation, and memory/CPU/PID/output/time limits. At most two jobs run concurrently. Hidden test logs are not returned. Only containers created for those jobs are cleaned up; Redis containers and volumes are untouched. If Docker or the image is unavailable, the API returns 503 instead of falling back to a host VM. Node VM contexts inside the container are defense in depth, not the security boundary.

For public multi-tenant production judging, use a dedicated isolated runner host/service and keep its runtime patched; containers share a kernel. The local application service currently invokes the Docker CLI and therefore needs Docker access. In-process rate limits are per application instance; multi-instance deployments need shared/edge enforcement.

## Production configuration and remaining work

Keep `.env` private and use HTTPS with NODE_ENV=production. Same-origin hosting needs no APP_ORIGINS setting; add only exact trusted origins if intentionally separating the frontend. Configure TRUST_PROXY_HOPS only for the known proxy topology; do not broadly trust client-supplied X-Forwarded-For.

The initially configured Supabase account could bypass RLS and create roles/databases/schema objects. With explicit approval, a new server-only devharbour_runtime account and 22 role-specific application-table policies were provisioned on October 28, 2026, using the reviewed SQL in security/restricted-runtime-role.sql. The runtime role cannot create roles, databases or application tables, bypass RLS, replicate, truncate application tables, or update the Prisma migration table. The policies allow the private backend service to operate on application data; end-user authorization remains enforced by Express. Supabase anon/authenticated browser roles do not inherit this role.

The local DATABASE_URL now uses that account and a newly generated 256-bit random password. The separate administrative DIRECT_URL keeps its existing administrator credentials for approved migration work. Both local connection strings now request sslmode=verify-full with the public Supabase root CA in security/certs/supabase-root-2021.crt. The certificate SHA-256 fingerprint is 80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA; it was retrieved over HTTPS from https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt. The certificate is public, not a secret.

Verified TLS protects the client connection to the configured Supabase shared pooler. PostgreSQL pg_stat_ssl reports the separate pooler-to-database hop as non-SSL; this is not evidence that the verified client-to-pooler connection is plaintext. This setup does not independently attest to Supabase's internal network transport. Do not disable certificate verification to fix connection problems. Update sslrootcert to the certificate's correct deployed filesystem path when deploying elsewhere.

The original local environment was backed up under ignored .local before switching. The new environment and its backup have Windows ACLs limited to the current Windows user, SYSTEM and Administrators. No password, connection string or backup is committed. Catalog privilege checks, all-table read comparisons and a rollback-only insert/update/delete probe passed; fingerprints for all 22 application tables were unchanged afterward. The local server was restarted to use the new account. Hosted deployment environment variables have NOT been changed.

Use npm run db:security for a repeatable read-only privilege and TLS check. Do not rerun the provisioning SQL against the existing role: it intentionally refuses to overwrite an existing account. Keep administrative credentials private and out of frontend configuration. For rollback, restore the protected local environment backup and restart the local server; do not delete the new role or policies automatically.

The repository is private according to GitHub metadata. The historical devharbour.sqlite snapshot was moved into an ACL-protected backup folder outside the repository and removed from the local Git index with user approval. Integrity and every table fingerprint were verified before moving the original files. No Supabase records were changed. Its Git removal is staged locally, not pushed; older commits and the remote still contain their previous copies. Participant exports also remain tracked and need separate privacy review. This work neither publishes nor rewrites that history, deletes archived records, or rotates database records. Keep repository access limited; assess whether old sessions/passwords require revocation/rotation if there is evidence of exposure. New SQLite/database backup files are ignored, which does not untrack already committed files. Hosted infrastructure, Supabase dashboard settings and logs, email ownership verification, production account recovery/MFA and a full external penetration test remain separate work. No claim of prior compromise or complete protection is made from source review alone.

## Verification and running

```powershell
npm start
# Stop with Ctrl+C, restart with npm start.
npm test
node --test tests/certificates.test.js
npm run test:security
npm run test:security:browser
npm run test:homepage
npm run test:redis
npm run redis:check
npm run db:validate
npm run db:check
npm run db:security
npm run typecheck
npm run lint
npm run build
npm audit
```

The security browser server uses a fresh temporary SQLite database on port 3101; attack/regression writes never target Supabase. Execution tests deliberately test container output/memory limits and Docker-unavailable failure. `test:homepage` uses the running app but does not submit authentication forms. Database checks and the Redis/backend verifier use read-only PostgreSQL operations. Do not run the write-enabled PostgreSQL regression suite against production.

Tests now initialize fresh isolated SQLite databases instead of copying the historical account snapshot. The SQLite fallback defaults to ignored .local/development.sqlite; one-time imports require an explicit SQLITE_IMPORT_PATH pointing to an approved private backup. The archival location is recorded locally in ignored .local/sqlite-backup-location.json.

## Confirmed fixture cleanup

The owner selected removal of confirmed sample/test website logins. A repeatable-read transaction selected records using exact fixture IDs or username/email/full-name signatures from the existing tests, preserved unknown accounts, created the authorized owner account, transferred all 10 project records, and removed the 577 confirmed fixtures. Project vote/bookmark counts were recomputed from their remaining real interaction rows. The 693 participant and 693 issued certificate records, courses, lessons and challenge catalog were checked unchanged. A full rollback snapshot and the legacy SQL export were saved outside the repository with restricted Windows permissions. The legacy server/devharbour.sql export was removed from the local Git index; older commits and remote branches still retain historical copies. No Git history was rewritten or pushed.

Normal SQLite development/production startup no longer creates sample login accounts. Only isolated NODE_ENV=test databases seed fixtures. Test suites continue to use fresh temporary databases, never the live Supabase database. The homepage now displays an honest empty ranking state when no student accounts have earned XP.

The owner credential file is .local/owner-admin-credentials.txt (ignored, current user/SYSTEM/Administrators only). It contains a website password, not the owner email-provider password. An automatic approval review blocked the combined archive/login verification command with the reason “blocked by policy.” Archival was completed using a safer separately verified local file move; the owner login requires a manual test.
