# Dev Harbour — Full-Stack Developer Platform

> **Learn. Build. Compete. Grow.**  
> A full-stack developer learning platform where courses, reading mode, coding challenges, XP ledger, community projects, and live leaderboards are connected through real persistent database records and server-side business rules.

---

## 🚀 Key Features Implemented

1. **Complete Design & Theme Preservation**
   - Preserves 100% of the Dev Harbour visual identity, typography (Manrope & Michroma), radial gradients, 3D tilt hero canvas, and responsive grid.
   - Preserves **Light (Lavender)**, **Dark (Pure Black)**, and **Mercury (Liquid Silver)** themes with account-synchronized persistence.

2. **Real Authentication & Profile Identity**
   - Secure registration, login, session tokens, and logout with password hashing via Node.js `scrypt`.
   - Authoritative user profiles linked to genuine database-backed metrics: XP, Level, Streaks, completed lessons, solved challenges, and published projects.
   - Enforced role segregation (`student`, `moderator`, `admin`).

3. **Curated Course Catalog & Working Redirection**
   - Verified official courses from **Coursera, edX, freeCodeCamp, and Microsoft Learn**.
   - Direct destination URLs opening the exact provider resource without broken redirects or placeholders.

4. **Internal Reading Mode**
   - Dedicated reading interface with table of contents, estimated reading time, section navigation, and syntax-highlighted code.
   - Persistent reading progress and anti-duplicate XP awards (+10 XP strictly once per verified completion).

5. **Sandboxed Code Execution & Hidden Test Evaluation**
   - Isolated, timeout-guarded Node.js VM sandbox with strict memory and execution limits (2.5s timeout).
   - Server-side evaluation against public AND secret hidden test cases (hidden test cases are never leaked to client source).
   - Real console output and execution time metrics.
   - Successful submissions award verified XP (+25 to +35 XP) recorded in an auditable ledger.

6. **Auditable XP Ledger & Live Leaderboard**
   - All XP events recorded in `xp_ledger` with unique constraints (`uq_xp_event`) to mathematically prevent duplicate rewards from page reloads or repeated requests.
   - Real-time leaderboard supporting **All-time**, **Weekly**, and **Monthly** timeframes derived dynamically from the XP ledger.
   - Personal user rank highlight.

7. **Featured Community Projects Directory**
   - Project directory with category filtering, tech stack search, and project detail modals.
   - Project submission with URL validation and ownership controls (+50 XP upon submission).
   - Real upvoting and bookmarking with uniqueness constraints (no duplicate voting).

---

## 📁 Project Structure

```
devharbour/
├── package.json               # Scripts & dependencies (Express, CORS, Dotenv)
├── .env.example               # Template environment configuration
├── .gitignore                 # Ignored files (node_modules, SQLite DBs, env)
├── README.md                  # Complete documentation and deployment guide
├── server/
│   ├── index.js               # Full-stack Express server
│   ├── db.js                  # Persistent database layer (Node v24 SQLite engine)
│   ├── auth.js                # Cryptographic hashing & session authorization
│   ├── execution.js           # Safe sandboxed code runner with hidden test evaluator
│   ├── schema.sql             # Complete PostgreSQL / Supabase migration schema
│   ├── data/
│   │   ├── courses.json       # Verified official course catalog
│   │   ├── lessons.json       # Reading mode curriculum content
│   │   ├── challenges.json    # Coding problems with public & hidden test suites
│   │   └── achievements.json  # Platform achievements catalog
│   └── routes/
│       ├── auth.js            # /api/auth endpoints
│       ├── courses.js         # /api/courses & /api/courses/lesson endpoints
│       ├── challenges.js      # /api/challenges & /api/challenges/:id/submit
│       ├── projects.js        # /api/projects & voting/bookmarking
│       ├── leaderboard.js     # /api/leaderboard (Weekly/Monthly/All-time)
│       ├── achievements.js    # /api/achievements
│       └── user.js            # /api/user/settings & profile summary
├── public/
│   ├── index.html             # Preserved Dev Harbour frontend with full integrations
│   ├── styles.css             # Modals, Reading Mode, and Auth styling
│   └── app.js                 # Client-side API controller & reactive UI state
└── tests/
    └── api.test.js            # Automated integration test suite (9 test suites)
```

---

## 🛠 Local Setup & Running

### Prerequisites
- Node.js v20+ or v24+ (Node v24 recommended for zero-dependency native SQLite support).

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

### 3. Run Automated Tests
```bash
npm test
```
*Executes all 9 integration suites verifying authentication, course catalog, reading progress, sandboxed code execution, XP ledger deduplication, leaderboards, and project voting.*

### 4. Start the Application
```bash
npm start
```
Open **http://localhost:3000** in your browser.

---

## 🗄 Database Configuration

### Option A: Local SQLite (Default - Ready Out of the Box)
The application automatically creates and seeds `devharbour.sqlite` on first boot with courses, lessons, challenges, and achievements.

### Option B: Supabase / PostgreSQL Deployment
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Paste and run the contents of [`server/schema.sql`](file:///server/schema.sql).
4. Configure your `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   SUPABASE_URL=https://[PROJECT-REF].supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   ```

---

## Innovative India certificate deployment

The certificate pages are `/my-certificate` and `/verify-certificate`. Participants enter their registration email on My Certificate. Gmail users confirm with Google and other participants can verify with an email code. Issuance requires the verified account to match the private event register. Public verification exposes the ID, event, issuer, issue date, and validity. The server overlays the name and ID as text on the redrawn vector master. To rebuild that master, run `scripts/draw_innovative_india_certificate.py` in a Python environment with ReportLab, pypdf, NumPy, and OpenCV. The supplied blank PDF remains the reference for the logos, seal, and signature.

### Prepare Supabase

1. Open the SQL Editor for the Supabase project used by this Vercel app. In a staging database first, run [the Innovative India migration](supabase/migrations/20261123074832_innovative_india_certificates.sql). Then apply [the access-control migration](supabase/migrations/20261123083623_harden_web_access.sql). Apply both to production in that order before deploying. Authentication in production uses the shared PostgreSQL rate counters.
2. Keep the participant register on an authorized machine in `server/data/innovative_india_participants.json`, which Git ignores. Its format is an array of objects with `name`, `email`, and an optional `credential_id`. Keep existing IDs when preparing the register. Validate it locally with:

   ```sh
   node scripts/seed_innovative_india.js server/data/innovative_india_participants.json
   ```

3. Set `DATABASE_URL` securely in the operator environment for the target database, confirm the project, and rerun the command with `--apply`. The importer preserves reservations and stops on conflicting assignments. It records eligibility and reserved IDs without issuing downloadable certificates.
4. For legacy accounts, populate a missing `users.certificate_name` only from trusted, original signup records matched to the account ID. The editable profile and the event roster do not establish the original signup name. Eligible users without an authoritative name are directed to support.

### Configure and deploy through GitHub and Vercel

1. In Vercel, select the existing project connected to `RujulaSharma/devharbour.in`. Verify that the production branch is `main`, the root is the repository root, and the Node.js version is 24.x. Keep the build command and output directory from `vercel.json`.
2. In **Settings → Environment Variables**, set the following for Production. Use separate database and email credentials when testing Preview.

   | Variable | Value |
   | --- | --- |
   | `DB_PROVIDER` | `postgresql` |
   | `DATABASE_URL` | Server-side Supabase pooler URL for the existing app database, using TLS and a role authorized to read app sessions and write certificates |
   | `APP_BASE_URL` | `https://devharbour.in` |
   | `EMAIL_VERIFICATION_SECRET` | Existing private secret, at least 32 random characters |
   | `RESEND_API_KEY` and `EMAIL_FROM` | Active Resend key and a verified sender for email signups |
   | `GOOGLE_CLIENT_ID` | Required Google OAuth web client ID. Add the exact site origin to its authorized JavaScript origins |

   Keep any existing Supabase or other application variables used by the rest of the site. The certificate flow does not require a new Supabase Auth integration or a browser service-role key.
3. From the local checkout, create a branch, stage the reviewed source, migration, blank template, font and download assets, and commit. Keep the private register, generated PDFs, and environment files out of the commit. Run:

   ```sh
   git switch -c codex/innovative-india-certificates
   npm ci
   npm run build
   npm test
   git add -- .gitignore README.md index.html package.json package-lock.json vercel.json
   git add -- api/certificates/download.js api/certificates/my-certificate.js "api/certificates/verify/[id].js"
   git add -- server/auth.js server/certificate_generator.js server/db.js server/db-postgres.js server/email.js server/innovative_certificates.js server/routes/auth.js server/routes/certificates.js
   git add -- assets/innovative_india_certificate.pdf assets/innovative_india_vector.pdf assets/fonts/GreatVibes-Regular.ttf assets/fonts/GreatVibes-OFL.txt assets/fonts/NotoSansDevanagari.ttf assets/fonts/NotoSansDevanagari-OFL.txt
   git add -- public/index.html public/devharbour_certificate_preview.html public/assets/eb-garamond-bold.ttf public/assets/innovative_india_certificate.webp public/assets/noto-sans-devanagari.ttf
   git add -- public/downloads/devharbour_standalone.html public/downloads/devharbour_standalone.zip scripts/build_standalone.js scripts/seed_innovative_india.js
   git add -- scripts/draw_innovative_india_certificate.py
   git add -- supabase/migrations/20261123074832_innovative_india_certificates.sql tests/certificates_innovative_india.test.js tests/google_auth.test.js tests/security_and_remediation.test.js
   git diff --cached --name-only
   git commit -m "feat: redesign Innovative India certificates"
   git push -u origin codex/innovative-india-certificates
   ```

4. Open a pull request into `main`. Use the Vercel Preview deployment with a staging participant to verify sign-in, PDF download, and public verification. After the production migration and private import are complete, merge the pull request to trigger the production deployment.
5. On production, check `/my-certificate`, verify an authorized test credential at `/verify-certificate`, and open that PDF on Android. If the older HTML download was cached by a CDN, clear that cached copy.

The replacement standalone downloads contain no attendee register. Earlier Git revisions and deployments may still contain the original shared register and require separate removal. Keep local auth helpers out of deployments, including deployments made directly from a working folder.

## 🧪 Verified Automated Test Results

| Test Suite | Status | Coverage |
|---|---|---|
| **1. System Health Check** | ✔ PASSED | Server uptime and health probe |
| **2. Authentication Flow** | ✔ PASSED | Signup, login, password hashing, session tokens, duplicate checks |
| **3. Course Catalog** | ✔ PASSED | Verified official provider URLs (edX, Coursera, freeCodeCamp, MS Learn) |
| **4. Reading Mode & Anti-Duplicate XP** | ✔ PASSED | Progress tracking, +10 XP credit, duplicate completion blocked |
| **5. Sandboxed Code Execution** | ✔ PASSED | Test evaluation, syntax error capture, infinite loop timeout protection |
| **6. Coding Challenge Submission** | ✔ PASSED | Hidden test case validation, +25 XP ledger transaction, re-submission deduplication |
| **7. Leaderboard Calculation** | ✔ PASSED | All-time, Weekly, Monthly rankings derived from authoritative XP ledger |
| **8. Featured Projects** | ✔ PASSED | Creation, URL validation, unique upvoting, bookmarking, authorization enforcement |
| **9. User Settings** | ✔ PASSED | Light, Dark, and Mercury theme account synchronization |
