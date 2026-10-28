# Redesigned homepage development

The supplied Next.js design has been adapted into the existing Express application. React, Framer Motion and Lucide render only the homepage, bundled by esbuild. There is no Next.js server or second application. The existing dashboard, authentication, backend, Prisma models and Redis modules remain in place.

## Run locally on Windows

From this repository in PowerShell:

```powershell
npm ci
npm run db:generate
# Optional authenticated Redis; keep the existing .env and .local configuration.
docker compose up -d redis
npm start
```

Open http://localhost:3000. Both `npm start` and `npm run dev` build the homepage before starting the existing Express server. Stop the server with Ctrl+C. Restart with `npm start`. After editing homepage components, run `npm run build` and refresh the browser; the Express server does not need a restart for static asset changes. Stop Redis with `docker compose stop redis`; this preserves its volume. PostgreSQL credentials and secrets stay in ignored local environment files. Do not run migrations as part of this UI update.

If port 3000 is occupied by a previous development server, stop that server before starting another. The dashboard sidebar logo returns to the homepage.

## Source and integration points

- `frontend/homepage/Home.tsx`: navigation, courses, project gallery, roadmap selector, CodeSpace preview, community and footer.
- `frontend/homepage/Hero.tsx`: synchronized text/laptop scenes on a 4,000 ms cycle; manual selection, pause/resume, reduced motion and timer cleanup.
- `frontend/homepage/Competitions.tsx`: featured hackathon, live rankings and DSA/practice panels.
- `frontend/homepage/ui.tsx`: shared buttons, labels and section reveals.
- `frontend/homepage/platform.ts`: public API reads and existing application navigation/authentication bridge. API failures display unavailable states rather than fabricated results.
- `frontend/homepage/entry.tsx`: mount inside the existing landing container with Shadow DOM to isolate CSS; use the existing `show` router and `openAuthModal` authentication UI. The former landing DOM is retained as a fallback when the bundle cannot load.
- `frontend/homepage/design.css`: supplied design styles adapted to the isolated host.
- `frontend/homepage/enhancements.css`: responsive sizing, real-content bounds and accessibility adjustments.
- `scripts/build-homepage.js`: production bundle to ignored `public/homepage/homepage.js`; build it after a fresh checkout.
- `public/index.html`: exports existing hackathon/curriculum data and loads the homepage bundle.

Courses use `/api/courses`, projects use `/api/projects`, and rankings use `/api/leaderboard?timeframe=All-time&limit=50`. Provider/project destinations accept only HTTP(S) URLs. The first three returned public projects are featured; the ranking metric is the number of returned ranked developers (up to 50), not a total platform member count. Hackathon details and roadmap modules reuse the existing `H` and `P` data from the current frontend, including the event's closed status. They are not new database APIs.

Buttons open the existing `learn`, `practice`, `work`, `projects`, `hack`, and `comm` views. Login/registration use the current authentication modal. Existing account sessions are reused. No database schema, migrations, credentials or Redis caching implementation is changed.

## Preview-only or unavailable features

CodeSpace is a visual preview; its Run and launch controls open the existing workspace. It does not pretend to execute the sample React application. Project thumbnails are stylized previews of real project metadata, not screenshots of those projects. The DSA code panel is an illustrative sample and opens existing coding practice.

The community section links to the existing community view and community updates channel; there is no new discussion/feed API. Newsletter signup, About, Contact, Privacy Policy and Terms pages are unavailable and labeled accordingly. If existing roadmap data cannot load, the supplied roadmap illustrations are fallback design previews; normal operation uses the existing curriculum. External social/provider URLs are reused from project data and configuration; third-party availability is outside the local checks.

## Verification

```powershell
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
# Start the local app before browser tests.
npm run test:homepage
npm test
node --test tests/certificates.test.js
npm run test:redis
npm run redis:check
npm run db:validate
npm run db:check
node scripts/verify-redis-backend.js
```

The homepage browser suite exercises public data, section links, four-second scene timing, pause, reduced motion, desktop 70/30 panels, mobile/tablet widths, login UI, existing dashboard routes and unavailable API states. It does not submit forms against Supabase. API and certificate regression tests use isolated temporary SQLite copies. `db:check` uses read-only PostgreSQL transactions; the live backend verifier changes only Redis cache keys, verifies MISS/HIT and reads public APIs and database counts. Do not run `test:postgres` against production as part of homepage verification because that suite creates test records.

ESLint covers the new TypeScript frontend; TypeScript additionally checks unused local declarations. The esbuild production bundle is the production build for this Express application, not a Next.js build. Browser screenshots and test reports remain ignored under `.local` or generated test output directories. Google-hosted fonts use local sans-serif fallbacks if unavailable.
