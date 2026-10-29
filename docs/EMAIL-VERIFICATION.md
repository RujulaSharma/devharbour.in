# Verified account certificates

Existing Express authentication remains in place. Users sign up with their event registration email, sign in, open **My Certificates** on the dashboard, choose **Send verification code**, and enter the six-digit code delivered by Resend. Only the authenticated account email can receive the code. No recipient/email override is accepted.

## This workspace's activation

The owner approved migration activation on 28 October 2026. Migration `20261028000200_account_email_verification` was applied to the configured Supabase database, and the local backend was restarted. Prisma migration status is up to date. The verification table has RLS enabled and private runtime access; browser roles have no table privileges. All 22 pre-existing application tables retained identical row counts and fingerprints, including 693 participants and 693 certificates.

A real Prisma/PostgreSQL verification-store probe passed inside a transaction that was fully rolled back. It tested hashed challenges, cooldown and confirmation with a fake mail transport. No real email was sent, no account was left verified by the probe, and inbox delivery still needs a user-requested code test. Redis PONG, course cache MISS/HIT, and existing public API checks passed after restart. These changes have not been pushed or deployed to the hosted website.

Verification grants read-only access to existing, valid certificates whose participant record is eligible and whose participant and certificate emails both match the account email (trimmed and case insensitive). The certificate must reference that participant. No new certificate is issued. Unmatched users get registration/contact guidance. Staff-only issuance remains available through the existing authorised endpoint.

## Configuration and activation

Keep `RESEND_API_KEY`, `EMAIL_FROM`, and `EMAIL_VERIFICATION_SECRET` in ignored local `.env` or your hosting provider's private environment settings. Never use a public frontend variable. Use a sending-only key restricted to the verified `auth.devharbour.in` domain and `EMAIL_FROM="DevHarbour <verify@auth.devharbour.in>"`. XgenPlus MX and root email DNS settings are unchanged.

Run `node scripts/setup-email-verification.js` once to generate the private HMAC key. Existing configuration is preserved and backed up under ignored `.local`. On Windows the backup receives the existing `.env` access permissions. `APP_BASE_URL` is reserved for app configuration; codes do not depend on a client-supplied redirect or link.

The additive migration is `prisma/migrations/20261028000200_account_email_verification/migration.sql`. **Do not apply it until the owner approves the Supabase schema change.** It creates one account verification table with RLS and private runtime role access; browser roles receive no access. It does not edit users, event participants, certificates, existing tables, or Redis. Never run `db push`, reset, or destructive migration commands as a substitute.

After approval, inspect `npx prisma migrate status`, confirm the only unapplied migration is the reviewed verification migration, then run `npx prisma migrate deploy` using the private administrative `DIRECT_URL`. If any unexpected migration, drift, or missing role appears, stop and review. Do not paste database URLs into commands or logs. Generate the client with `npm run db:generate`. Run `npm run email:check` and `npm run db:security`, then restart the backend.

Until migration activation, verification and My Certificates fail closed with a helpful unavailable response. Existing signup, login, public verification, courses, and other routes continue without querying the new table.

## Security and delivery

- Codes expire after 10 minutes. Five failed attempts lock a challenge. Resending invalidates the earlier challenge.
- A database lock serialises each user's challenge transitions, including concurrent requests. Codes are HMAC-SHA256 hashed with account, canonical email, and a unique challenge ID; plaintext codes are never saved or returned.
- Resend cooldown is 60 seconds; at most five send attempts per account per one-hour window starting with its first send. The send endpoint also limits each IP to 100 requests/hour, and confirmations each account to 60 requests/hour. Normal application rate limits also apply.
- Provider errors never activate verification, return raw provider details, or fall back to trusting an email string. Codes and provider keys are not logged. Verified ownership is invalid if the account email changes.
- All verification and private certificate responses use `Cache-Control: no-store`. Session authentication, origin checks, and authorisation remain enforced.
- Resend free-plan limits apply independently. Provider acceptance is not proof of inbox delivery. Check Resend delivery logs without sharing API keys; users should also check spam. No bulk mail is sent.
- Automated tests inject an in-memory mail transport into an isolated SQLite server. The real transport refuses to send under `NODE_ENV=test`. There is no HTTP test-code or recipient override endpoint.

## Dashboard actions

The sidebar **Certificate** entry opens account sign-in for guests and **My Certificates** for signed-in users. After sign-in, unverified accounts see the mailbox-verification form; verified accounts see their own certificate list. The old shared passcode and duplicate sidebar item have been removed. Public exact-credential verification links remain accessible without signing in.

**View certificate** uses the existing certificate artwork in an accessible modal. **Download SVG** saves a self-contained scalable certificate image, including the existing embedded artwork. **Copy verification link** shares the existing public exact-credential verification route; a selectable URL is shown if clipboard permissions are unavailable. No private roster is downloaded to implement the dashboard.

The public exact-ID verification page remains public for credential authenticity. It does not prove a viewer owns the credential and returns no participant email, phone, or location. Revoked certificates return an invalid response. The three legacy Vercel certificate handlers now delegate to these same Express checks instead of reconstructing credentials from participant JSON or accepting an unverified email/name. A hosted deployment still needs the complete Express application and private database configuration; the old standalone static Vercel frontend does not supply the new login/verification dashboard APIs. Staff should correct eligibility or registration email only after separately checking the participant's identity. This change does not add a new admin email-edit endpoint.

## Run and test

`npm start` builds the homepage and starts the existing backend at `http://localhost:3000`. Stop it with **Ctrl+C** in that terminal; run `npm start` again to restart after configuration changes. If a background instance already owns port 3000, stop that instance first. Optional Redis still starts with `docker compose up -d` and stops with `docker compose stop` (no volume deletion).

- `npm run test:email`: API/ownership/expiry/limits/delivery-outage regression tests on temporary SQLite.
- `npm run test:security:browser`: real browser signup, verification with a fake transport, own-certificate view/download/share, reload/logout, mobile and outage checks.
- `npm test` and `node --test tests/certificates.test.js`: existing application and staff certificate regressions.
- `npm run db:validate`, `npm run typecheck`, `npm run lint`, `npm run build`.
- `npm run email:check`: read-only live PostgreSQL configuration/schema/permissions/count checks. Exit 2 means configuration or migration is pending. It never sends mail.

Local implementation does not deploy the feature to the hosted website. Configure private hosting environment variables and deploy only after approved migration and staging checks. A participant clicking Send verification code explicitly requests that email; no automated test sends to real participant addresses.
