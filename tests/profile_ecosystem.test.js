const test = require("node:test");
const assert = require("node:assert/strict");
const url = process.env.PROFILE_TEST_DATABASE_URL;
const enabled =
  url &&
  ["localhost", "127.0.0.1"].includes(new URL(url).hostname) &&
  new URL(url).pathname === "/profile_test";
test(
  "Prisma profile persistence, authorization and privacy on isolated PostgreSQL",
  { skip: !enabled },
  async (t) => {
    process.env.NODE_ENV = "development";
    process.env.DATABASE_URL = url;
    process.env.DB_PROVIDER = "postgresql";
    process.env.DB_PATH = ":memory:";
    process.env.REDIS_URL = "";
    process.env.PROFILE_ECOSYSTEM_ENABLED = "true";
    const db = require("../server/db"),
      pg = require("../server/db-postgres"),
      { profilePrisma } = require("../server/profile/prisma");
    const app = require("../server/index");
    const stamp = Date.now().toString().slice(-9);
    const make = async (name) => {
      const u = await db.createUser({
        email: name + stamp + "@profile-fixture.invalid",
        username: name + stamp,
        fullName: name + " Developer",
        passwordHash: "fixture",
        salt: "fixture",
      });
      await db.markEmailVerified(u.id);
      return { ...u, token: (await db.createSession(u.id)).token };
    };
    const alice = await make("alice"),
      bob = await make("bob");
    const server = app.listen(0, "127.0.0.1");
    await new Promise((r) => server.once("listening", r));
    t.after(async () => {
      await new Promise((r) => server.close(r));
      await profilePrisma().$disconnect();
      await pg.pool.end();
    });
    const request = async (
      path,
      { method = "GET", body, user = alice, origin } = {},
    ) => {
      const r = await fetch(
        "http://127.0.0.1:" + server.address().port + "/api/profile" + path,
        {
          method,
          headers: {
            ...(user ? { Authorization: "Bearer " + user.token } : {}),
            "Content-Type": "application/json",
            ...(origin ? { Origin: origin } : {}),
          },
          body: body === undefined ? undefined : JSON.stringify(body),
        },
      );
      return { status: r.status, body: await r.json().catch(() => ({})) };
    };
    let profile;
    await t.test("anonymous writes and cross-site writes fail", async () => {
      assert.equal((await request("/me", { user: null })).status, 401);
      assert.equal(
        (
          await request("/me", {
            method: "PATCH",
            body: { version: 0 },
            origin: "https://untrusted.example",
          })
        ).status,
        403,
      );
    });
    await t.test(
      "profile defaults private and returns only safe account fields",
      async () => {
        const r = await request("/me");
        assert.equal(r.status, 200);
        assert.equal(r.body.profile.visibility, "private");
        assert(!JSON.stringify(r.body).includes("password_hash"));
        assert.equal(
          (await request("/public/" + alice.username, { user: null })).status,
          404,
        );
      },
    );
    await t.test(
      "profile edit persists through Prisma; certificate name and XP stay unchanged",
      async () => {
        const before = await db.getUserById(alice.id);
        const r = await request("/me", {
          method: "PATCH",
          body: {
            version: 0,
            headline: "Building useful tools",
            account: { fullName: "Alice Updated" },
            visibility: "public",
            privacy: {
              about: "public",
              skills: "public",
              education: "private",
              experience: "private",
              links: "public",
            },
            links: { github: "https://github.com/example" },
          },
        });
        assert.equal(r.status, 200);
        profile = r.body.profile;
        assert.equal(profile.version, 1);
        const after = await db.getUserById(alice.id);
        assert.equal(after.full_name, "Alice Updated");
        assert.equal(after.certificate_name, before.certificate_name);
        assert.equal(await db.getUserTotalXp(alice.id), 0);
        assert.equal(
          (
            await request("/me", {
              method: "PATCH",
              body: { version: 0, headline: "stale" },
            })
          ).status,
          409,
        );
      },
    );
    let education, skill;
    await t.test(
      "education and skill CRUD enforce ownership and validation",
      async () => {
        education = (
          await request("/me/entries/education", {
            method: "POST",
            body: {
              institution: "Test University",
              degree: "Computer Science",
              startYear: "2024",
              endYear: "2028",
            },
          })
        ).body.entry;
        assert(education.id);
        assert.equal(
          (
            await request("/me/entries/" + education.id, {
              method: "DELETE",
              user: bob,
            })
          ).status,
          404,
        );
        skill = (
          await request("/me/skills", {
            method: "POST",
            body: {
              name: "JavaScript",
              category: "Programming Languages",
              proficiency: "Intermediate",
              pinned: true,
            },
          })
        ).body.skill;
        assert(skill.id);
        assert.equal(
          (
            await request("/me/skills/" + skill.id, {
              method: "PUT",
              body: {
                name: "JavaScript",
                category: "Programming Languages",
                proficiency: "Expert",
              },
              user: bob,
            })
          ).status,
          404,
        );
        assert.equal(
          (
            await request("/me", {
              method: "PATCH",
              body: { version: 1, links: { github: "javascript:alert(1)" } },
            })
          ).status,
          400,
        );
      },
    );
    await t.test(
      "public projection has no email, education, workspace or private media",
      async () => {
        const r = await request("/public/" + alice.username, { user: null });
        assert.equal(r.status, 200);
        const json = JSON.stringify(r.body);
        assert(!json.includes(alice.email));
        assert(!json.includes("Test University"));
        assert(!json.includes("password"));
        assert.equal(r.body.skills.length, 1);
        assert(!("workspace" in r.body));
        const legacy = await fetch(
          "http://127.0.0.1:" +
            server.address().port +
            "/api/user/profile/" +
            alice.username,
        );
        assert(
          !JSON.stringify(await legacy.json()).includes("Test University"),
        );
      },
    );
    await t.test(
      "follow is idempotent; block revokes public visibility",
      async () => {
        for (let i = 0; i < 2; i++)
          assert.equal(
            (
              await request("/connect/" + alice.username + "/follow", {
                method: "POST",
                body: {},
                user: bob,
              })
            ).status,
            200,
          );
        assert.equal((await request("/me")).body.connections.followers, 1);
        assert.equal(
          (
            await request("/connect/" + bob.username + "/block", {
              method: "POST",
              body: {},
            })
          ).status,
          200,
        );
        assert.equal(
          (await request("/public/" + alice.username, { user: bob })).status,
          404,
        );
        await request("/connect/" + bob.username + "/block", {
          method: "DELETE",
        });
      },
    );
    await t.test(
      "duplicate reads cannot create XP or contributions; dates validated",
      async () => {
        for (let i = 0; i < 3; i++)
          assert.equal((await request("/me/activity")).body.total, 0);
        assert.equal(await db.getUserTotalXp(alice.id), 0);
        assert.equal((await request("/me/activity/2026-02-31")).status, 400);
      },
    );
    await t.test(
      "missing integrations are explicit; files reject unauthorized reads",
      async () => {
        const r = await request("/integrations");
        assert.equal(r.body.ai.available, false);
        assert.equal(r.body.github.available, false);
        assert.equal(
          (await request("/media/not-found", { user: bob })).status,
          404,
        );
      },
    );
    await t.test("goal ownership and server-derived progress", async () => {
      const r = await request("/me/goals", {
        method: "POST",
        body: { title: "Finish five lessons", metric: "lessons", target: 5 },
      });
      assert.equal(r.status, 201);
      assert.equal((await request("/me/goals")).body.goals[0].progress, 0);
      assert.equal(
        (
          await request("/me/goals/" + r.body.goal.id, {
            method: "PUT",
            user: bob,
            body: { title: "bad", metric: "lessons", target: 10 },
          })
        ).status,
        404,
      );
    });
    await t.test("Prisma tables have RLS and no anonymous grants", async () => {
      const result = await pg.pool.query(
        "SELECT relrowsecurity FROM pg_class WHERE relname='developer_profiles'",
      );
      assert.equal(result.rows[0].relrowsecurity, true);
      const grants = await pg.pool.query(
        "SELECT privilege_type FROM information_schema.role_table_grants WHERE grantee IN ('anon','authenticated') AND table_name='developer_profiles'",
      );
      assert.equal(grants.rowCount, 0);
    });
    await t.test(
      "public HTML escapes markup and exports produce valid owner-only PDFs",
      async () => {
        const me = await request("/me");
        await request("/me", {
          method: "PATCH",
          body: {
            version: me.body.profile.version,
            account: { bio: "<script>alert(1)</script>" },
          },
        });
        const html = await fetch(
          "http://127.0.0.1:" +
            server.address().port +
            "/api/profile/public-html/" +
            alice.username,
        );
        assert.equal(html.status, 200);
        const text = await html.text();
        assert(text.includes("&lt;script&gt;"));
        assert(!text.includes("<script>alert(1)"));
        assert(!text.includes(alice.email));
        for (const kind of ["resume", "id"]) {
          const response = await fetch(
            "http://127.0.0.1:" +
              server.address().port +
              "/api/profile/me/exports/" +
              kind,
            { headers: { Authorization: "Bearer " + alice.token } },
          );
          assert.equal(response.status, 200);
          const pdf = Buffer.from(await response.arrayBuffer());
          assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
          assert(
            (await require("pdf-lib").PDFDocument.load(pdf)).getPageCount() >=
              1,
          );
        }
      },
    );
    await t.test(
      "large tied activity history paginates without duplicates or omissions",
      async () => {
        await pg.pool.query(
          "INSERT INTO xp_ledger (id,user_id,amount,source_type,reference_id,created_at) SELECT $2 || n::text,$1,5,'lesson_complete','profile-fixture:' || n::text,'2026-01-20T12:00:00.000Z' FROM generate_series(1,1001) n",
          [alice.id, "fixture-" + stamp + "-"],
        );
        let cursor = null,
          seen = new Set(),
          pages = 0;
        do {
          const r = await request(
            "/me/timeline?limit=50" +
              (cursor ? "&before=" + encodeURIComponent(cursor) : ""),
          );
          assert.equal(r.status, 200);
          for (const item of r.body.items) {
            assert(!seen.has(item.id));
            seen.add(item.id);
          }
          cursor = r.body.next;
          pages++;
          assert(pages < 30);
        } while (cursor);
        assert.equal(seen.size, 1001);
        const calendar = await request("/me/activity?year=2026");
        assert.equal(calendar.body.total, 1001);
        assert.equal(
          calendar.body.days.find((x) => x.date === "2026-01-20").count,
          1001,
        );
        const before = await db.getUserTotalXp(alice.id);
        await request("/me/activity");
        assert.equal(await db.getUserTotalXp(alice.id), before);
      },
    );
    await t.test(
      "XP goals use server ledger totals and report completion",
      async () => {
        const r = await request("/me/goals", {
          method: "POST",
          body: { title: "Earn ten more XP", metric: "xp", target: 10 },
        });
        assert.equal(r.status, 201);
        await pg.pool.query(
          "INSERT INTO xp_ledger (id,user_id,amount,source_type,reference_id,created_at) VALUES ($1,$2,10,'lesson_complete','goal-test',$3)",
          ["goal-" + stamp, alice.id, new Date().toISOString()],
        );
        const goals = await request("/me/goals"),
          goal = goals.body.goals.find((g) => g.id === r.body.goal.id);
        assert.equal(goal.progress, 10);
        assert.equal(goal.completed, true);
      },
    );
    await t.test(
      "block clears follows and endorsements; unblocking does not restore consent",
      async () => {
        await request("/connect/" + alice.username + "/follow", {
          method: "POST",
          body: {},
          user: bob,
        });
        await request("/skills/" + skill.id + "/endorsement", {
          method: "POST",
          body: {},
          user: bob,
        });
        assert.equal((await request("/me")).body.skills[0].endorsements, 1);
        await request("/connect/" + bob.username + "/block", {
          method: "POST",
          body: {},
        });
        assert.equal((await request("/me")).body.connections.followers, 0);
        assert.equal((await request("/me")).body.skills[0].endorsements, 0);
        await request("/connect/" + bob.username + "/block", {
          method: "DELETE",
        });
        assert.equal((await request("/me")).body.connections.followers, 0);
      },
    );
    await t.test(
      "all existing module adapters respond without leaking private workspaces",
      async () => {
        for (const name of [
          "overview",
          "coding",
          "learning",
          "hackathons",
          "certificates",
          "workspace",
          "xp",
          "projects",
          "achievements",
        ]) {
          const r = await request("/me/progress/" + name);
          assert.equal(r.status, 200, name);
          assert(r.body.data !== undefined);
        }
      },
    );
    await t.test(
      "resume snapshots are persisted, isolated and immutable across profile edits",
      async () => {
        const r = await request("/me/resume-versions", {
          method: "POST",
          body: {
            title: "My first version",
            summary: "A truthful summary",
            template: "minimal",
            sections: ["skills", "summary", "education"],
          },
        });
        assert.equal(r.status, 201);
        const snapshot = await profilePrisma().profileEntry.findUnique({
          where: { id: r.body.version.id },
        });
        assert.equal(snapshot.data.snapshot.name, "Alice Updated");
        assert(
          !snapshot.data.snapshot.entries.some(
            (x) => x.kind === "resume-version",
          ),
        );
        const me = await request("/me");
        await request("/me", {
          method: "PATCH",
          body: {
            version: me.body.profile.version,
            account: { fullName: "Alice Later" },
          },
        });
        assert.equal(
          (
            await profilePrisma().profileEntry.findUnique({
              where: { id: snapshot.id },
            })
          ).data.snapshot.name,
          "Alice Updated",
        );
        const url =
          "http://127.0.0.1:" +
          server.address().port +
          "/api/profile/me/resume-versions/" +
          snapshot.id +
          "/pdf";
        assert.equal(
          (
            await fetch(url, {
              headers: { Authorization: "Bearer " + bob.token },
            })
          ).status,
          404,
        );
        assert.equal(
          (
            await fetch(url, {
              headers: { Authorization: "Bearer " + alice.token },
            })
          ).status,
          200,
        );
        assert.equal(
          (
            await request("/me/resume-versions", {
              method: "POST",
              body: { title: "bad", sections: ["email", "password"] },
            })
          ).status,
          400,
        );
      },
    );
    await t.test(
      "yearly recap uses saved history and rejects unsupported years",
      async () => {
        const r = await request("/me/recap/2026");
        assert.equal(r.status, 200);
        assert.equal(r.body.contributions, 1002);
        assert.equal(r.body.activeDays, 2);
        assert.equal(r.body.problems, 0);
        assert.equal(r.body.eventRegistrations, 0);
        assert.equal((await request("/me/recap/1900")).status, 400);
        const readiness = await request("/me/readiness");
        assert.equal(readiness.status, 200);
        assert(readiness.body.notice.includes("employment"));
        assert(readiness.body.checks.length > 0);
      },
    );
    await t.test(
      "legacy settings cannot leave an advanced profile public after opting out",
      async () => {
        const url =
          "http://127.0.0.1:" + server.address().port + "/api/user/settings";
        const response = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + alice.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ profilePublic: false, theme: "light" }),
        });
        assert.equal(response.status, 200);
        assert.equal(
          (await request("/public/" + alice.username, { user: null })).status,
          404,
        );
        const legacy = await fetch(
          "http://127.0.0.1:" +
            server.address().port +
            "/api/user/profile/" +
            alice.username,
        );
        assert.equal(legacy.status, 404);
        const theme = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + alice.token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ theme: "dark" }),
        });
        assert.equal(theme.status, 200);
        assert.equal((await request("/me")).body.profile.visibility, "private");
      },
    );
    await t.test(
      "disabled rollout rejects the advanced API without touching existing accounts",
      async () => {
        process.env.PROFILE_ECOSYSTEM_ENABLED = "false";
        try {
          assert.equal((await request("/config")).body.enabled, false);
          assert.equal((await request("/me")).status, 503);
        } finally {
          process.env.PROFILE_ECOSYSTEM_ENABLED = "true";
        }
      },
    );
    await t.test(
      "invalid files fail before any storage transmission; unavailable storage stays explicit",
      async () => {
        const media = require("../server/profile/media");
        await assert.rejects(
          media.upload(
            alice.id,
            "avatar",
            Buffer.from("not an image"),
            "image/png",
          ),
          (e) => e.status === 400,
        );
        await assert.rejects(
          media.upload(
            alice.id,
            "resume",
            Buffer.from("not a pdf"),
            "application/pdf",
          ),
          (e) => e.status === 400,
        );
        const oldUrl = process.env.SUPABASE_URL,
          oldKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        delete process.env.SUPABASE_URL;
        delete process.env.SUPABASE_SERVICE_ROLE_KEY;
        try {
          const { PDFDocument, PDFName, PDFString } = require("pdf-lib");
          const active = await PDFDocument.create();
          active.addPage();
          active.catalog.set(
            PDFName.of("OpenAction"),
            active.context.register(
              active.context.obj({
                S: PDFName.of("JavaScript"),
                JS: PDFString.of("app.alert(1)"),
              }),
            ),
          );
          await assert.rejects(
            media.upload(
              alice.id,
              "resume",
              Buffer.from(await active.save({ useObjectStreams: true })),
              "application/pdf",
            ),
            (e) => e.status === 400,
          );
          const doc = await PDFDocument.create();
          doc.addPage();
          await assert.rejects(
            media.upload(
              alice.id,
              "resume",
              Buffer.from(await doc.save()),
              "application/pdf",
            ),
            (e) => e.status === 503,
          );
        } finally {
          if (oldUrl) process.env.SUPABASE_URL = oldUrl;
          if (oldKey) process.env.SUPABASE_SERVICE_ROLE_KEY = oldKey;
        }
      },
    );
  },
);

test("profile validation rejects hostile links, impossible dates and self-awarded skills", () => {
  const v = require("../server/profile/validation");
  assert.throws(() => v.url("https://user:password@example.com"));
  assert.throws(() => v.date("2026-02-31"));
  assert.throws(() => v.profile({ privacy: { resume: "everyone" } }));
  const s = v.skill({
    name: "Node.js",
    category: "Backend Development",
    verified: true,
  });
  assert(!("verified" in s));
});
