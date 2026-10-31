# Vercel frontend and Render backend

Recommended flow: browser → Vercel frontend → same-origin `/api/*` proxy → Render Express → Supabase. Redis remains optional.

## Render

Create a Node Web Service from this repository using the branch containing these changes. The existing render.yaml now specifies:

- Build: `npm ci --include=dev && npm run build:vercel`
- Start: `node server/index.js`
- Health check: `/api/health`
- Node: 24.22.1

The build generates Prisma Client and the homepage bundle. It does not apply migrations, seed records, or import data. Render supplies PORT; the application listens on all interfaces.

Enter secret values directly in Render's Environment page. Use the restricted runtime DATABASE_URL with verified TLS and a Linux-valid certificate path, for example `/opt/render/project/src/security/certs/supabase-root-2021.crt` when the repository root is the service root. Do not reuse a Windows absolute certificate path. Keep administrative DIRECT_URL out of the runtime unless approved maintenance requires it.

Set APP_BASE_URL and APP_ORIGINS to the exact frontend origin, such as `https://devharbour.in`. Configure RESEND_API_KEY, EMAIL_FROM and EMAIL_VERIFICATION_SECRET privately. Keep the existing verification secret when moving the backend. Do not point REDIS_URL to localhost on Render: leave it unset or use a reachable authenticated Redis service. Do not expose PostgreSQL, Redis or email secrets in Vercel frontend variables.

Normal Render Node services do not provide the Docker judge runtime required by this app. Code execution remains unavailable and fails closed; a separate isolated execution service would be needed to enable it.

## Vercel: recommended same-origin proxy

The current vercel.json serves the static frontend from `public` and proxies `/api/*` to `https://devharbour-backend.onrender.com`. The changes must be pushed, merged and redeployed before they affect the public website. Deployment checklist:

1. Configure Vercel as a static frontend (Framework Other, build `npm run build`, output `public`). Ensure legacy `api/` functions and the root Express entry are excluded from the frontend deployment.
2. Add an external rewrite for `/api/:path*` to `https://YOUR-SERVICE.onrender.com/api/:path*`, before SPA rewrites. This includes `/api/events`.
3. Preserve the private roster URL blocks, frontend route rewrites and security headers. Ensure private roster files are excluded from the deployed static output.
4. Test login cookie forwarding, logout, email verification, own certificates, course APIs and event streaming through the frontend hostname. Never enable caching for authenticated APIs.
5. Test direct Render health and rejected untrusted-origin writes. Review the actual proxy chain before setting TRUST_PROXY_HOPS; do not blindly trust forwarded headers.

This keeps browser requests same-origin and preserves the existing HttpOnly, Secure, SameSite=Strict session cookie design. Both Vercel and Render deployments still require live verification.

Alternative: use an API subdomain such as api.devharbour.in and call it directly. This requires frontend API/EventSource URL configuration, explicit credentialed CORS, cookie and CSRF review. Calling an unrelated onrender.com domain directly is not compatible with the current strict same-site cookie flow without changes. The proxy approach requires fewer application changes.

Render free services sleep after 15 minutes without inbound requests, causing a delayed first request. Choose an appropriate always-on plan if that delay is unsuitable.

Sources: https://vercel.com/docs/routing/rewrites and https://render.com/docs/deploy-node-express-app and https://render.com/docs/free
