# Dev Harbour — Full-Stack Developer Platform

> **Learn. Build. Compete. Grow.**  
> A full-stack developer learning platform where courses, reading mode, coding challenges, XP ledger, community projects, and live leaderboards are connected through real persistent database records and server-side business rules.

The redesigned homepage setup, integration details, preview limitations, and verification commands are documented in [HOMEPAGE-SETUP.md](HOMEPAGE-SETUP.md).

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
│   ├── database.js            # Explicit PostgreSQL / offline SQLite provider selection
│   ├── db-postgres.js         # Prisma repositories and transactional business rules
│   ├── prisma.js              # Server-only PostgreSQL adapter and Prisma client
│   ├── db.js                  # Preserved Node v24 SQLite fallback and test database
│   ├── auth.js                # Cryptographic hashing & session authorization
│   ├── execution.js           # Safe sandboxed code runner with hidden test evaluator
│   ├── schema.sql             # Legacy SQL reference; use prisma/migrations for Prisma
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
- Node.js v24+ (also required by the retained SQLite test/fallback database).

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
On Windows PowerShell, use `Copy-Item .env.example .env` only if `.env` does not
already exist. Set `DB_PROVIDER=postgresql`, `DATABASE_URL`, and `DIRECT_URL`
locally, then run `npm run db:generate`. Keep credentials out of Git and chat.

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

### Supabase PostgreSQL through Prisma (default)
The Express routes use Prisma 7 and its PostgreSQL adapter. Connection details
belong in the ignored `.env`; migrations use `DIRECT_URL` and runtime queries use
`DATABASE_URL`. `npm run db:check` verifies both connections without writing data.

The initial migration is in `prisma/migrations`. The approved existing SQLite
records have been imported into Supabase. Startup does not apply migrations,
seed users, or overwrite records. The older `server/schema.sql` is retained for
reference and must not be run as the Prisma migration.

See [the Prisma setup guide](prisma/README.md) for run commands, testing,
migration details, and the explicit offline SQLite fallback.

### Optional local Redis cache
Public course listings can use authenticated Redis from `compose.yaml`.
Run `npm run redis:setup`, `docker compose up -d --wait redis`, and
`npm run redis:check`. The application continues to work when Redis is stopped.
See [the Redis guide](docs/REDIS.md) for persistence, invalidation, tests, and
startup/shutdown commands. Supabase is not part of this Compose configuration.

---

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
