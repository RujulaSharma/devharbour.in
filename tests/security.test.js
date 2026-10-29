const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  os = require("node:os"),
  path = require("node:path");
process.env.NODE_ENV = "test";
process.env.DB_PROVIDER = "sqlite";
const directory = fs.mkdtempSync(
  path.join(os.tmpdir(), "devharbour-security-"),
);
process.env.DB_PATH = path.join(directory, "test.sqlite");
// The database module initializes a fresh isolated test database.
const app = require("../server/index"),
  db = require("../server/database");
let server, base, alice, bob;
async function api(route, { method = "GET", body, headers = {} } = {}) {
  const response = await fetch(base + route, {
    method,
    headers: { "Content-Type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return {
    status: response.status,
    headers: response.headers,
    data: await response.json(),
  };
}
const bearer = (user) => ({ Authorization: "Bearer " + user.token });
test.before(async () => {
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  base = "http://127.0.0.1:" + server.address().port;
  for (const name of ["alice", "bob"]) {
    const response = await api("/api/auth/signup", {
      method: "POST",
      body: {
        email: name + "@security.example.test",
        username: "security_" + name,
        fullName: "Security " + name,
        password: "Test-fixture-p@ssword-82",
      },
    });
    assert.equal(response.status, 201);
    if (name === "alice") alice = response.data;
    else bob = response.data;
  }
});
test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
  await db.close();
  if (
    !path
      .resolve(directory)
      .startsWith(path.resolve(os.tmpdir()) + path.sep + "devharbour-security-")
  )
    throw Error("Unsafe cleanup path");
  fs.rmSync(directory, { recursive: true, force: true });
});
test("password hashes and salts never leave signup or profile responses", async () => {
  for (const user of [alice, bob]) {
    assert.equal(user.user.password_hash, undefined);
    assert.equal(user.user.salt, undefined);
    assert.equal(user.user.password, undefined);
  }
  const response = await api("/api/auth/profile", {
    method: "PUT",
    headers: bearer(alice),
    body: { bio: "Security regression fixture" },
  });
  assert.equal(response.status, 200);
  assert.equal(response.data.user.password_hash, undefined);
  assert.equal(response.data.user.salt, undefined);
});
test("HTTP-only cookies work; query-string tokens cannot authenticate", async () => {
  const login = await api("/api/auth/login", {
    method: "POST",
    body: { login: "security_alice", password: "Test-fixture-p@ssword-82" },
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie");
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  const me = await api("/api/auth/me", {
    headers: { Cookie: cookie.split(";")[0] },
  });
  assert.equal(me.status, 200);
  assert.equal((await api("/api/auth/me?token=" + alice.token)).status, 401);
  assert.equal(
    (await api("/api/auth/me", { headers: bearer(alice) })).status,
    200,
  );
});
test("cookies require same-origin writes and untrusted origins receive no CORS access", async () => {
  const cookie = "dh_session=" + alice.token;
  assert.equal(
    (
      await api("/api/auth/profile", {
        method: "PUT",
        headers: { Cookie: cookie },
        body: { bio: "blocked" },
      })
    ).status,
    403,
  );
  const cross = await api("/api/auth/login", {
    method: "POST",
    headers: { Origin: "https://attacker.example" },
    body: { login: "x", password: "x" },
  });
  assert.equal(cross.status, 403);
  assert.equal(cross.headers.get("access-control-allow-origin"), null);
  const allowed = await api("/api/auth/profile", {
    method: "PUT",
    headers: { Cookie: cookie, Origin: base },
    body: { bio: "Allowed same-origin profile update" },
  });
  assert.equal(allowed.status, 200);
});
test("private exports, dotfiles and database files are not downloadable", async () => {
  for (const route of [
    "/data/orcathon_participants.json",
    "/data/orcathon_participants.js",
    "/assets/orcathon_participants.json",
    "/assets/orcathon_participants.js",
    "/data/%6frcathon_participants.json",
    "/assets//orcathon_participants.json",
    "/assets%2forcathon_participants.json",
    "/.env",
    "/devharbour.sqlite",
  ])
    assert.equal((await fetch(base + route)).status, 404, route);
});
test("HTML injections, unsafe URLs and malformed bodies are rejected", async () => {
  for (const body of [
    { location: "<img src=x onerror=alert(1)>" },
    { avatarUrl: "javascript:alert(1)" },
    { fullName: { value: "not a string" } },
  ])
    assert.equal(
      (
        await api("/api/auth/profile", {
          method: "PUT",
          headers: bearer(alice),
          body,
        })
      ).status,
      400,
    );
  assert.equal(
    (
      await api("/api/auth/login", {
        method: "POST",
        body: { login: { bad: 1 }, password: "x" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await api("/api/auth/login", {
        method: "POST",
        body: { login: "x", password: "x".repeat(1025) },
      })
    ).status,
    400,
  );
  const poisoned = await fetch(base + "/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: '{"__proto__":{"polluted":true}}',
  });
  assert.equal(poisoned.status, 400);
  assert.equal({}.polluted, undefined);
  assert.equal((await api("/api/courses?category[x]=web")).status, 400);
});
test("votes require authentication and projects cannot be edited by other users", async () => {
  const created = await api("/api/projects", {
    method: "POST",
    headers: bearer(alice),
    body: {
      title: "Security ownership fixture",
      description: "Only its owner can edit this regression fixture.",
      category: "Web",
      repoUrl: "https://example.test/repo",
      techStack: ["Node"],
    },
  });
  assert.equal(created.status, 201);
  const id = created.data.project.id;
  assert.equal(
    (await api("/api/projects/" + id + "/vote", { method: "POST" })).status,
    401,
  );
  assert.equal(
    (
      await api("/api/projects/" + id, {
        method: "PUT",
        headers: bearer(bob),
        body: { title: "Stolen project" },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await api("/api/projects/" + id, {
        method: "PUT",
        headers: bearer(alice),
        body: { repoUrl: "javascript:alert(1)" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await api("/api/projects/" + id, {
        method: "DELETE",
        headers: bearer(bob),
      })
    ).status,
    403,
  );
});
test("workspace items remain private to their owners and reject injected metadata", async () => {
  const created = await api("/api/workspace/tasks", {
    method: "POST",
    headers: bearer(alice),
    body: { title: "Private task" },
  });
  assert.equal(created.status, 201);
  const id = created.data.task.id;
  assert.equal(
    (
      await api("/api/workspace/tasks/" + id, {
        method: "PUT",
        headers: bearer(bob),
        body: { title: "Stolen task" },
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await api("/api/workspace/tasks", {
        method: "POST",
        headers: bearer(alice),
        body: { title: "Injected date", dueDate: '"><img src=x>' },
      })
    ).status,
    400,
  );
});
test("certificate issuance is staff-only and incomplete credential IDs never verify", async () => {
  assert.equal(
    (
      await api("/api/certificates/claim", {
        method: "POST",
        body: { email: "test@example.test" },
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await api("/api/certificates/claim", {
        method: "POST",
        headers: bearer(alice),
        body: { email: "test@example.test" },
      })
    ).status,
    403,
  );
  const fake = await api("/api/certificates/verify/1");
  assert.equal(fake.status, 404);
  assert.equal(fake.data.verified, false);
});
test("seeded administrator sessions are disabled without deleting its data", async () => {
  const user = await db.getUserById("usr-admin-parth");
  assert.ok(user);
  const session = await db.createSession(user.id);
  assert.equal(
    (
      await api("/api/auth/me", {
        headers: { Authorization: "Bearer " + session.token },
      })
    ).status,
    401,
  );
});
test("brute-force login attempts receive HTTP 429", async () => {
  let response;
  for (let i = 0; i < 16; i++) {
    response = await api("/api/auth/login", {
      method: "POST",
      body: {
        login: "does_not_exist_security",
        password: "Wrong-password-88!",
      },
    });
    if (response.status === 429) break;
  }
  assert.equal(response.status, 429);
  assert.ok(response.headers.get("ratelimit"));
});

test('privacy updates preserve other preferences and reject invalid values', async () => {
  const headers = bearer(alice);
  let result = await api('/api/user/settings', {method:'POST',headers,body:{theme:'dark',emailNotifications:false,profilePublic:true}});
  assert.equal(result.status,200);
  result = await api('/api/user/settings',{method:'POST',headers,body:{profilePublic:false}});
  assert.equal(result.status,200);
  assert.equal(result.data.settings.theme,'dark');
  assert.equal(Number(result.data.settings.email_notifications),0);
  assert.equal(Number(result.data.settings.profile_public),0);
  assert.equal((await api('/api/user/settings',{method:'POST',headers,body:{profilePublic:'yes'}})).status,400);
});

test('learning library, saved courses, and lesson progress are private and persistent', async () => {
  assert.equal((await api('/api/user/learning')).status,401);
  const headers=bearer(alice), other=bearer(bob);
  const before=await api('/api/user/learning',{headers});assert.equal(before.status,200);
  const course=before.data.courses.find(c=>c.nextLesson);assert.ok(course);
  const url='/api/user/learning/'+encodeURIComponent(course.id)+'/save';
  assert.equal((await api(url,{method:'POST',headers,body:{}})).status,200);
  assert.equal((await api(url,{method:'POST',headers,body:{}})).status,200);
  let own=await api('/api/user/learning',{headers});assert.equal(own.data.courses.find(c=>c.id===course.id).saved,true);
  const otherData=await api('/api/user/learning',{headers:other});assert.equal(otherData.data.courses.find(c=>c.id===course.id).saved,false);
  const lesson='/api/courses/lesson/'+encodeURIComponent(course.nextLesson.id);
  assert.equal((await api(lesson+'/progress',{method:'POST',headers,body:{readingSeconds:10}})).status,200);
  own=await api('/api/user/learning',{headers});assert.equal(own.data.courses.find(c=>c.id===course.id).started,true);
  await api(lesson+'/complete',{method:'POST',headers,body:{}});
  own=await api('/api/user/learning',{headers});assert.ok(own.data.courses.find(c=>c.id===course.id).completedLessons>0);
  assert.equal((await api(url,{method:'DELETE',headers:other})).status,200);
  assert.equal((await api('/api/user/learning',{headers})).data.courses.find(c=>c.id===course.id).saved,true);
  await api(url,{method:'DELETE',headers});assert.equal((await api('/api/user/learning',{headers})).data.courses.find(c=>c.id===course.id).saved,false);
});

test('private dashboard details exclude other users and submission source code',async()=>{assert.equal((await api('/api/user/dashboard')).status,401);const result=await api('/api/user/dashboard',{headers:bearer(alice)});assert.equal(result.status,200);assert.ok(Array.isArray(result.data.history));assert.equal(result.data.dailyGoalSupported,false);assert.equal(JSON.stringify(result.data).includes('password_hash'),false);assert.equal('code' in result.data,false);});

test('personal dashboard project and workspace lists cannot select another account',async()=>{
 const first=await api('/api/user/dashboard',{headers:bearer(alice)});
 const second=await api('/api/user/dashboard?userId='+alice.user?.id,{headers:bearer(bob)});
 assert.equal(first.status,200);assert.equal(second.status,200);
 const project=first.data.projects[0];if(project)assert.equal(second.data.projects.some(p=>p.id===project.id),false);
 for(const key of ['tasks','notes','assignments','snippets','bookmarks']){
  const ids=new Set(first.data.workspace[key].map(row=>row.id));
  assert.equal(second.data.workspace[key].some(row=>ids.has(row.id)),false);
 }
 assert.equal(first.data.submissions.some(row=>'code'in row||'error_message'in row),false);
});
