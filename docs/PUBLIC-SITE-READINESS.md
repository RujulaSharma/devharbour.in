# Public content and advertising preparation

Updated 30 October 2026. These changes prepare the site; they do not guarantee Google Ads or AdSense approval.

## Implemented

- Public, server-delivered HTML at `/about`, `/contact`, `/privacy`, `/cookies`, `/terms`, `/resources` and four `/guides/*` pages. Reading does not require JavaScript, an account or database access.
- Practical original editorial guides cover course selection, first projects, DSA practice and hackathon preparation. External educational sources are linked and are not represented as DevHarbour-owned courses.
- Public pages have unique titles, descriptions, canonical URLs, responsive styling, skip links, header/footer navigation and a real contact email link.
- Homepage Resources menu, footer and guide previews expose the pages. Policies describe the existing session, storage, verification, database, email, hosting and external resources without promising certificates or employment.
- `npm run build` generates public HTML, `robots.txt`, `sitemap.xml` and a custom 404 page. Sources are `scripts/public-pages.js` and `public/site-pages.css`; build outputs are ignored. Both hosting builds must run the build command.
- Vercel rewrites and Express routes serve the same pages. Express no longer returns a successful homepage for every unknown URL. Existing application and certificate verification paths are preserved.

## Owner actions before applying or activating ads

1. Review all published facts, policies and the contact address `admin@devharbour.in`. Confirm you can receive and answer mail there. No test email has been sent by this task. Add a legal operator name or other business details only when accurate; none have been invented.
2. Deploy this branch through the normal review/merge process to Vercel and Render. Recheck public URLs, HTTPS, mobile layout and application APIs on both apex and www domains. Local checks do not establish production availability or regional crawler access.
3. In AdSense add your site, complete the real account/ownership process and obtain its exact publisher ID or verification instructions. Add only Google's actual account-provided values. Do not fabricate an `ads.txt` seller entry, approval badge or ad unit.
4. Before activating ad scripts, configure Privacy & messaging and an appropriate Google-certified consent management platform for ads served to visitors in the EEA, UK and Switzerland. Verify consent withdrawal and regional behaviour. This change intentionally adds no ad scripts, analytics tags, fake consent banner or conversion tracking.
5. Update the advertising wording when advertising is activated and list any additional vendors actually used. Place any approved ads on useful public content; keep them away from sign-in, OTP, personal dashboards, workspace actions and certificate controls. Do not encourage ad clicks.
6. If using Google Ads to promote the site, use a functioning public HTML landing page as the campaign destination. Campaign setup, billing, identity checks, budgets and conversion tracking are separate from earning revenue with AdSense.

The sitemap lists the homepage and static editorial pages. It intentionally excludes private user resources. `robots.txt` is crawler guidance, not access control; API authentication remains the security boundary. External community/course destinations can change and require periodic review.

## Local validation

- Build, frontend TypeScript and ESLint passed.
- 34 isolated Node tests passed across public pages, security and email verification. Synthetic SQLite test databases were used, not Supabase writes.
- 21 distinct browser checks passed across public documents, editorial homepage, existing homepage interactions, grouped navigation, first-paint behaviour and shared platform navigation. Includes 390px mobile, 768px tablet and desktop checks; public documents also passed with JavaScript disabled. Two stale navigation tests were updated for the current grouped menu and guest sign-in rules, then passed on rerun.
- Every internal link in the generated public documents returned HTTP 200 locally; unknown page/asset paths returned HTTP 404. Direct loads, reload and back navigation were exercised. A mocked synthetic certificate ID verified the `/verify/:id` route without retrieving real participant records.
- Local `/api/health` returned HTTP 200, healthy, PostgreSQL. The private-config scan found no current local secrets in candidate Git files.
- Mobile guide screenshot was visually inspected. External-site uptime, contact inbox delivery, live Vercel rewrite execution and Google account approval were not verified by these local checks.

## Official references reviewed

- https://support.google.com/adsense/answer/7299563
- https://support.google.com/adsense/answer/1348695
- https://support.google.com/adsense/answer/13554116
- https://support.google.com/adspolicy/answer/6368661
