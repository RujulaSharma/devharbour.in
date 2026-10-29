# DevHarbour on Vercel

## One current entry

The existing app remains Express with Prisma/PostgreSQL and optional Redis. `server.js` is a thin recognized Vercel entry that exports the existing `server/index.js` instance. It does not replace the backend. `vercel.json` selects Express and builds with `npm run build:vercel`, which generates the Prisma client and builds the homepage. It never applies migrations or imports records.

Vercel serves static assets from `public/`. The canonical HTML is `public/index.html`; the older root `index.html` and browser-only root `app.js` are excluded from deployment. Known page URLs rewrite to the canonical public HTML, while API requests continue through the full Express backend. Do not set an output-directory override to the repository root or deploy the old root HTML as a standalone site.

In the existing Vercel project's Build and Deployment settings, use the repository root as the Root Directory, **Express** as the framework, and the repository's install/build commands. Clear any stale Output Directory override from an older static/Next.js setup. Use a Node.js version supported by the installed Prisma version; Node 24 is used for local validation. Confirm the deployment uses the branch containing these changes rather than an older branch.

## First paint

Critical CSS in the initial HTML hides the old landing DOM before scripts execute. Those nodes remain only for legacy event bindings. A neutral DevHarbour loading state is visible until the new React homepage commits; the old design is never used as a loading fallback. Failed script loads show a Reload action, and disabled JavaScript gets a clear message. The build preloads the versioned homepage bundle and keeps its preload and script URLs identical. Remote font stylesheets load without blocking navigation startup.

## Private configuration

Set private environment variables in Vercel settings; never paste values into chat or source files. Use `NODE_ENV=production`, `DB_PROVIDER=postgresql`, the restricted runtime `DATABASE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, and `EMAIL_VERIFICATION_SECRET`. Existing approved schema migrations must already be applied. Client generation does not require database migration privileges, so the administrative `DIRECT_URL` does not need to be exposed to the application function.

Use Supabase connection settings valid for the Linux/Vercel runtime. A Windows `.env` URI containing an absolute `C:\...` CA-certificate path cannot be copied unchanged; configure a runtime-valid CA path and include that public certificate. Preserve verified TLS and the restricted database role. The public certificate is under `security/certs/`.

Local Docker Redis at `127.0.0.1:6379` is not reachable from Vercel. Leave `REDIS_URL` unset for optional-cache fallback, or configure a separately hosted authenticated Redis service. Vercel Functions cannot run the local Docker judge; it will fail closed rather than execute submissions without isolation. This UI change does not provision a replacement code-execution service.

`.vercelignore` excludes local secrets, backups, test artifacts, old root static entry files, and public roster copies. The roster URLs also rewrite to a backend 404 endpoint, because Vercel's CDN does not run Express static-file protection middleware. No participant or certificate database records are changed.

## Validation and release

Run `npm run build:vercel`, `node --test tests/deployment-entry.test.js`, and `npx playwright test tests/homepage/first-paint.spec.js` (with the local Express server running). The entry test uses a fresh isolated SQLite database. Browser checks include deliberately held/failed bundle requests and disabled JavaScript.

These checks do not replace a real Vercel preview build. After the reviewed changes are committed and pushed with the owner's approval, deploy a preview using the existing project, check Vercel's build logs, confirm the canonical homepage and private environment settings, then verify public pages, authenticated APIs, email verification, and certificate ownership before promoting it. This work does not claim the public site is updated until that deployment is completed.

References: [Express on Vercel](https://vercel.com/docs/frameworks/backend/express), [deployment exclusions](https://vercel.com/docs/deployments/vercel-ignore).
