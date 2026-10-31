# Deployment security checks — 29 October 2026

Scope: read-only live HTTP checks on www.devharbour.in and devharbour-backend.onrender.com, source/config review, isolated SQLite regression tests, dependency audit, and read-only checks using the locally configured Supabase runtime credentials. No production records changed and no emails sent. Local database checks do not prove which credentials Render has saved.

## Confirmed

- Public health, courses, projects, leaderboard and certificate statistics returned HTTP 200 through both hosts. The courses endpoint previously returned eight courses.
- Account, personal certificate and user settings endpoints returned 401 to signed-out callers. Public JSON responses tested did not contain password, salt, token, participant email/mobile or connection-secret fields.
- Public roster URLs returned 404 on both hosts. Render blocked environment, Git and database file paths. Vercel returned homepage HTML on several nonexistent sensitive-looking URLs; these were not file downloads.
- API responses used no-store, baseline CSP, frame protection and HSTS. Untrusted-origin preflights returned 403.
- Read-only database checks confirmed verified TLS, restricted runtime role, 23 application access policies and no browser-role inheritance. Email verification table is protected. Counts remain 693 participants and 693 certificates.
- Thirty isolated authentication, ownership, verification, deployment and seeding tests passed. Runtime npm audit reported zero known advisories at check time.
- Live browser smoke mounted the new homepage with no page errors observed; dashboard navigation existed and no desktop horizontal overflow was observed.

## Issues and local changes

1. Live backend accepted https://devharbour.in but rejected https://www.devharbour.in. This can break login and writes from the deployed www frontend. Update Render APP_ORIGINS to the exact comma-separated pair. render.yaml now records both origins, but editing YAML alone does not update an existing manually configured service.
2. Static Vercel HTML lacked the backend's baseline CSP and Permissions-Policy headers. Added matching baseline headers to vercel.json. This is not a strict script-src CSP and does not eliminate all XSS risk.
3. Ten participant roster JS/JSON copies were still Git tracked. Removed from the index, preserving ignored local copies. Supabase registry is untouched; production PostgreSQL does not require startup roster imports. Historical commits and previous deployment artifacts can still contain removed data. Repository visibility and collaborator access must be reviewed by its owner; this check did not establish public access (unauthenticated GitHub repository lookup returned 404). No history rewriting or historical deployment deletion was performed.

These local code/config changes require commit, merge and deployment before they protect hosted services. Existing deployments are not automatically removed by a source-code deletion.

## Remaining verification

- User-assisted production sign-in/out, Secure/HttpOnly/SameSite cookie persistence, OTP delivery and verified certificate dashboard access. Automated tests cover these application rules but are not a live mailbox or production account test.
- Render environment dashboard values and its actual runtime role, Resend domain/key restrictions, cloud Redis configuration and hosting account MFA/access. Secret values were not fetched or displayed.
- Load, DoS, full penetration testing and complete code audit were not performed. In-memory rate limiting resets on process restarts; cloud proxy client-IP behavior needs explicit review before trusting forwarded headers.
- Docker code execution is unavailable in the standard Render Node service. Redis is optional; the local Redis instance is not a deployed cloud cache.

No claim of perfect security or absence of historical leaks is made.

## Follow-up before committing

Render origin configuration was subsequently rechecked: both https://devharbour.in and https://www.devharbour.in were accepted (204), while an untrusted origin remained blocked (403). Roster files are now removed from tracking but kept locally. Certificate tests use synthetic participants and no longer depend on private roster files; test-mode SQLite initialization does not import the local registry. Forty-two targeted tests passed. The API suite passed 7/9; the two Docker execution tests failed with service unavailable because the Docker Desktop Linux engine pipe was absent. Type-check, lint and build passed. No production data was altered.
