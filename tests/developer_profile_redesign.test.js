const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "dh-profile-redesign-"));
process.env.NODE_ENV = "test";
process.env.DB_PROVIDER = "sqlite";
process.env.DB_PATH = path.join(tmpDir, "test.sqlite");
process.env.PROFILE_ECOSYSTEM_ENABLED = "true";

const db = require("../server/db");
const app = require("../server/index");
const store = require("../server/profile/store");

let server;
let baseUrl;

async function req(urlPath, { method = "GET", token = "", body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${baseUrl}${urlPath}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const ct = res.headers.get("content-type") || "";
  const data = ct.includes("application/json")
    ? await res.json().catch(() => null)
    : Buffer.from(await res.arrayBuffer());
  return { status: res.status, headers: res.headers, body: data };
}

async function createVerifiedUser({ username, fullName, email, password = "Password123!", publicProfile = false }) {
  const user = await db.createUser({ email, username, fullName, passwordHash: "hash", salt: "salt" });
  await db.markEmailVerified(user.id);
  const { token } = await db.createSession(user.id);
  if (publicProfile) {
    await store.ensureSignupProfile(user.id, { publicProfile: true, isMinor: false });
  }
  return { user, token };
}

test("Developer Profile Redesign — End-to-End API, Privacy, Visitor Preview & Auth Scenarios", async (t) => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });

  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    db.db.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const owner = await createVerifiedUser({
    username: "rujula_dev",
    fullName: "Rujula Sharma",
    email: `rujula_${Date.now()}@devharbour.in`,
    publicProfile: true,
  });
  const visitor = await createVerifiedUser({
    username: "arjun_codes",
    fullName: "Arjun Verma",
    email: `arjun_${Date.now()}@devharbour.in`,
    publicProfile: true,
  });
  const privateUser = await createVerifiedUser({
    username: "hidden_dev",
    fullName: "Hidden Engineer",
    email: `hidden_${Date.now()}@devharbour.in`,
    publicProfile: false,
  });

  // Seed owner project, lesson, skill, education, experience, achievement, and XP
  const project = await db.createProject({
    userId: owner.user.id,
    title: "Dev Harbour Portfolio",
    description: "Interactive full-stack portfolio built cleanly.",
    category: "Web",
    techStack: ["React", "Node.js", "PostgreSQL"],
    repoUrl: "https://github.com/RujulaSharma/devharbour",
    demoUrl: "https://devharbour.in",
  });
  await db.awardXp(owner.user.id, 120, "challenge_pass", "two-sum", "Solved Two Sum");

  await t.test("1 & 6. Owner visits /profile, updates info, skills, experience, education & links", async () => {
    const me1 = await req("/api/profile/me", { token: owner.token });
    assert.equal(me1.status, 200);
    assert.equal(me1.body.user.username, "rujula_dev");
    assert.equal(me1.body.profile.visibility, "public");

    const patch = await req("/api/profile/me", {
      method: "PATCH",
      token: owner.token,
      body: {
        version: me1.body.profile.version,
        headline: "Full Stack Developer · Problem Solver",
        city: "New Delhi",
        country: "India",
        college: "Baba Patiram Vidya Mandir",
        company: "Dev Harbour",
        links: { github: "https://github.com/RujulaSharma", portfolio: "https://devharbour.in" },
        details: { openToWork: true, collaboration: true, showDeveloperId: true, showQrCode: true, allowResumeDownload: true },
        privacy: { education: "public", experience: "public", location: "public", availability: "public", achievements: "public", certificates: "public", resume: "public", learning: "public" },
        account: { bio: "Building scalable web apps and solving algorithmic problems." },
      },
    });
    assert.equal(patch.status, 200);

    const skillRes = await req("/api/profile/me/skills", {
      method: "POST",
      token: owner.token,
      body: { name: "PostgreSQL", category: "Database", proficiency: "Advanced", pinned: true },
    });
    assert.equal(skillRes.status, 201);

    const expRes = await req("/api/profile/me/entries/experience", {
      method: "POST",
      token: owner.token,
      body: { designation: "Web Development Intern", organization: "Dev Harbour", type: "Internship", startDate: "2025-06-01", endDate: "2025-08-31", description: "Built frontend architecture." },
    });
    assert.equal(expRes.status, 201);

    const eduRes = await req("/api/profile/me/entries/education", {
      method: "POST",
      token: owner.token,
      body: { institution: "Baba Patiram Vidya Mandir", degree: "Class 10", field: "Computer Science", startYear: "2024", endYear: "2026" },
    });
    assert.equal(eduRes.status, 201);

    // Owner public/own endpoint sees full owner flags
    const ownView = await req("/api/profile/public/rujula_dev", { token: owner.token });
    assert.equal(ownView.status, 200);
    assert.equal(ownView.body.viewerConnection.isOwner, true);
    assert.equal(ownView.body.user.email, undefined, "Public endpoint should never leak raw email");
    assert.equal(ownView.body.projects.length, 1);
    assert.equal(ownView.body.experience.length, 1);
    assert.equal(ownView.body.education.length, 1);
  });

  await t.test("2 & 3. Authenticated Visitor & Unauthenticated Visitor see public profile without private leaks + SPA OG tags", async () => {
    const anon = await req("/api/profile/public/rujula_dev");
    assert.equal(anon.status, 200);
    assert.equal(anon.body.viewerConnection.isOwner, false);
    assert.equal(anon.body.user.email, undefined);
    assert.equal(anon.body.bio, "Building scalable web apps and solving algorithmic problems.");
    assert.equal(anon.body.user.city, "New Delhi");
    assert.equal(anon.body.skills[0].name, "postgresql");
    assert.equal(anon.body.developerId.code.startsWith("DH-"), true);

    const htmlRes = await req("/u/rujula_dev");
    assert.equal(htmlRes.status, 200);
    const html = htmlRes.body.toString("utf8");
    assert.match(html, /Rujula Sharma \(@rujula_dev\)/);
    assert.match(html, /id="v-profile"/);
  });

  await t.test("4. Private profile is denied to visitors and hides details in SSR /u/:username", async () => {
    const r = await req("/api/profile/public/hidden_dev", { token: visitor.token });
    assert.equal(r.status, 404);
    const tabRes = await req("/api/profile/public/hidden_dev/tab/projects", { token: visitor.token });
    assert.equal(tabRes.status, 404);
    const privHtml = await req("/u/hidden_dev");
    assert.equal(privHtml.status, 200);
    assert.doesNotMatch(privHtml.body.toString("utf8"), /Hidden Engineer/);
    assert.match(privHtml.body.toString("utf8"), /noindex/);
  });

  await t.test("5. View as Visitor uses genuine server projection & never leaks private sections", async () => {
    const me = await req("/api/profile/me", { token: owner.token });
    await req("/api/profile/me", {
      method: "PATCH",
      token: owner.token,
      body: { version: me.body.profile.version, privacy: { experience: "private" } },
    });
    const preview = await req("/api/profile/public/rujula_dev?asVisitor=1", { token: owner.token });
    assert.equal(preview.status, 200);
    assert.equal(preview.body.viewerConnection.isOwner, false);
    assert.equal(preview.body.viewerConnection.isVisitorPreview, true);
    assert.equal(preview.body.sections.experience, false);
    assert.equal(preview.body.experience.length, 0);

    // Owner with private profile previewing ?asVisitor=1 gets safe previewPrivate notice
    const privMe = await req("/api/profile/me", { token: privateUser.token });
    assert.equal(privMe.body.profile.visibility, "private");
    const privPreview = await req("/api/profile/public/hidden_dev?asVisitor=1", { token: privateUser.token });
    assert.equal(privPreview.status, 200);
    assert.equal(privPreview.body.previewPrivate, true);

    // Stranger passing ?asVisitor=1 on a private profile must STILL be blocked 404
    const intruderPreview = await req("/api/profile/public/hidden_dev?asVisitor=1", { token: visitor.token });
    assert.equal(intruderPreview.status, 404);
  });

  await t.test("7. Unauthorized edit & IDOR checks reject cleanly", async () => {
    const unauth = await req("/api/profile/me", { method: "PATCH", body: { version: 1, headline: "Hacked" } });
    assert.ok([401, 403].includes(unauth.status));

    const otherSkillId = (await req("/api/profile/me", { token: owner.token })).body.skills[0].id;
    const delOtherSkill = await req(`/api/profile/me/skills/${otherSkillId}`, { method: "DELETE", token: visitor.token });
    assert.equal(delOtherSkill.status, 404);

    // Ensure owner's skill was NOT deleted
    const checkOwner = await req("/api/profile/me", { token: owner.token });
    assert.equal(checkOwner.body.skills.length, 1);
  });

  await t.test("8. Follow & Unfollow update counts accurately and prevent self-follow", async () => {
    const selfFollow = await req("/api/profile/connect/arjun_codes/follow", { method: "POST", token: visitor.token, body: {} });
    assert.equal(selfFollow.status, 400);

    const f1 = await req("/api/profile/connect/rujula_dev/follow", { method: "POST", token: visitor.token, body: {} });
    assert.equal(f1.status, 200);
    assert.equal(f1.body.connection.status, "accepted");

    // Duplicate follow is idempotent (count remains 1)
    const f2 = await req("/api/profile/connect/rujula_dev/follow", { method: "POST", token: visitor.token, body: {} });
    assert.equal(f2.status, 200);

    const pubAfterFollow = await req("/api/profile/public/rujula_dev", { token: visitor.token });
    assert.equal(pubAfterFollow.body.followers, 1);
    assert.equal(pubAfterFollow.body.viewerConnection.followingStatus, "accepted");

    const connList = await req("/api/profile/public/rujula_dev/connections?kind=follow");
    assert.equal(connList.status, 200);
    assert.equal(connList.body.items.length, 1);
    assert.equal(connList.body.items[0].username, "arjun_codes");

    const uf = await req("/api/profile/connect/rujula_dev/follow", { method: "DELETE", token: visitor.token });
    assert.equal(uf.status, 200);

    const pubAfterUnfollow = await req("/api/profile/public/rujula_dev", { token: visitor.token });
    assert.equal(pubAfterUnfollow.body.followers, 0);
    assert.equal(pubAfterUnfollow.body.viewerConnection.followingStatus, "none");
  });

  await t.test("9 & 10. Granular section privacy, in-progress learning gate & resume PDF privacy enforcement", async () => {
    const me = await req("/api/profile/me", { token: owner.token });
    const upd = await req("/api/profile/me", {
      method: "PATCH",
      token: owner.token,
      body: {
        version: me.body.profile.version,
        privacy: { location: "private", resume: "private", statistics: "private" },
      },
    });
    assert.equal(upd.status, 200);

    const pub = await req("/api/profile/public/rujula_dev");
    assert.equal(pub.body.sections.location, false);
    assert.equal(pub.body.user.city, undefined);
    assert.equal(pub.body.stats, undefined);
    assert.equal(pub.body.resume, null);

    const codingTab = await req("/api/profile/public/rujula_dev/tab/coding");
    assert.equal(codingTab.status, 200);
    assert.equal(codingTab.body.hidden, true);
    assert.equal(codingTab.body.coding, null);

    const deniedResume = await req("/api/profile/public/rujula_dev/resume");
    assert.equal(deniedResume.status, 403);

    // Re-enable resume download -> produces valid PDF bytes cleanly
    await req("/api/profile/me", {
      method: "PATCH",
      token: owner.token,
      body: { version: upd.body.profile.version, privacy: { resume: "public", statistics: "public" }, details: { allowResumeDownload: true } },
    });
    const allowedResume = await req("/api/profile/public/rujula_dev/resume");
    assert.equal(allowedResume.status, 200);
    assert.match(allowedResume.body.subarray(0, 5).toString("ascii"), /^%PDF-/);
  });

  await t.test("11 & 12 & 13. Verified certificate check, project views, discovery search & empty new user states", async () => {
    const fresh = await createVerifiedUser({
      username: "fresh_dev99",
      fullName: "Fresh User",
      email: `fresh_${Date.now()}@devharbour.in`,
      publicProfile: true,
    });
    const freshPub = await req("/api/profile/public/fresh_dev99");
    assert.equal(freshPub.status, 200);
    assert.equal(freshPub.body.user.verified, false, "New user without credential cannot be marked verified");
    assert.equal(freshPub.body.stats.totalXp, 0);
    assert.equal(freshPub.body.projects.length, 0);

    // Project view counter increments safely
    const viewRes = await req(`/api/projects/${encodeURIComponent(project.id)}/view`, { method: "POST" });
    assert.equal(viewRes.status, 200);
    assert.equal(viewRes.body.viewsCount, 1);

    // Discover endpoint searches skill & username without requiring auth and hides private accounts
    const discSkill = await req("/api/profile/discover?search=postgresql");
    assert.equal(discSkill.status, 200);
    assert.equal(discSkill.body.developers.some((d) => d.user.username === "rujula_dev"), true);
    assert.equal(discSkill.body.developers.some((d) => d.user.username === "hidden_dev"), false);

    // Signup consent defaults to publicProfile: false when explicitly unchecked or minor
    await store.ensureSignupProfile((await db.createUser({
      email: `minor_${Date.now()}@devharbour.in`,
      username: "minor_dev",
      fullName: "Minor User",
      passwordHash: "h",
      salt: "s",
    })).id, { publicProfile: true, isMinor: true });
    const minorCheck = await req("/api/profile/public/minor_dev");
    assert.equal(minorCheck.status, 404);
  });
});
