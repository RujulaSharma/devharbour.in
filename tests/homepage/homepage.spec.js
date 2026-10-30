const { test, expect } = require("@playwright/test");
const root = (page) => page.locator("#dh-homepage");
async function open(page) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(root(page).locator("h1")).toBeVisible();
}
test("public data, curriculum and page navigation use existing features", async ({
  page,
  request,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const courses = (await (await request.get("/api/courses")).json()).courses;
  await open(page);
  await expect(root(page).locator(".course-card")).toHaveCount(courses.length);
  await expect(root(page).locator(".course-card").first()).toContainText(
    courses[0].title,
  );
  await expect(root(page).locator(".challenge-event")).toContainText(
    "ORCATHON 2026",
  );
  await expect(root(page).locator(".roadmap-list")).toContainText(
    "Full-Stack Web Development",
  );
  const rankings=(await (await request.get("/api/leaderboard?timeframe=All-time&limit=50")).json()).rankings;
  await expect(root(page).locator(".leader-row")).toHaveCount(Math.min(3,rankings.length));
  const missing = await root(page).evaluate((host) =>
    Array.from(host.shadowRoot.querySelectorAll('a[href^="#"]'))
      .map((a) => a.getAttribute("href"))
      .filter(
        (href) =>
          !href.startsWith("#platform-") &&
          !host.shadowRoot.getElementById(href.slice(1)),
      ),
  );
  expect(missing).toEqual([]);
  await root(page).locator('.nav-links summary').filter({hasText:/^Learn/}).click();
  await root(page).locator('.nav-links a').filter({ hasText: /^Courses$/ }).click();
  await expect(page.locator("#v-learn")).toHaveClass(/on/);
  await expect(page).toHaveURL(/\/courses$/);
  await expect(page.locator("#intro")).toHaveClass(/out/);
  expect(errors).toEqual([]);
});
test('single hero has no carousel and motion can be paused',async({page})=>{
 await open(page);await expect(root(page).locator('.hero-dots')).toHaveCount(0);await expect(root(page).locator('.harbour-scene')).toHaveCount(1);
 const title=await root(page).locator('h1').textContent();await page.waitForTimeout(4500);expect(await root(page).locator('h1').textContent()).toBe(title);
 await root(page).getByRole('button',{name:'Pause hero motion'}).click();await expect(root(page).locator('.harbour-art')).toHaveClass(/is-still/);
 await root(page).getByRole('button',{name:'Resume hero motion'}).click();await expect(root(page).locator('.harbour-art')).not.toHaveClass(/is-still/);
});
test("existing login modal and dashboard routes remain accessible", async ({
  page,
}) => {
  await open(page);
  await root(page).getByRole("link", { name: "Sign In", exact: true }).click();
  await expect(page.locator("#dh-auth-modal.open")).toBeVisible();
  await expect(page.locator("#dh-auth-modal.open")).toContainText("Sign In");
  // Reload closes the modal without issuing authentication or database writes.
  await open(page);
  for (const view of [
    "practice",
    "work",
    "projects",
    "learn",
    "hack",
    "comm",
  ]) {
    const paths = { work: "/workspace", projects: "/projects", learn: "/courses", hack: "/hackathons", comm: "/community" };
    const path = paths[view];
    await root(page).locator(path ? `footer a[href="${path}"]` : `a[href="#platform-${view}"]`).first().click();
    await expect(page.locator(`#v-${view}`)).toHaveClass(/on/);
    await expect(page.locator("#intro")).toHaveClass(/out/);
    await page.evaluate(() => window.goLanding());
    await expect(root(page).locator("h1")).toBeVisible();
  }
  await page.goto('/dashboard',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#dh-auth-modal.open')).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
});
test("navbar uses page URLs with reload, back and forward support", async ({ page }) => {
  await open(page);
  const nav = root(page).locator('.nav-links');
  await nav.locator('summary').filter({hasText:/^Learn/}).click();
  await nav.getByRole('link', { name: 'Courses', exact: true }).click();
  await expect(page).toHaveURL(/\/courses$/);
  await expect(page.locator('#v-learn')).toHaveClass(/on/);
  await page.evaluate(() => window.goLanding());
  await nav.locator('summary').filter({hasText:/^Build/}).click();
  await nav.getByRole('link', { name: 'Project Gallery', exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(root(page).locator('h1')).toBeVisible();
  await page.goForward();
  await expect(page.locator('#v-projects')).toHaveClass(/on/);
  await page.reload();
  await expect(page).toHaveURL(/\/projects$/);
  await expect(page.locator('#v-projects')).toHaveClass(/on/);
  await expect(page.locator('#intro')).toHaveClass(/out/);
  const platformNav=page.locator('#dh-platform-navigation .nav-links');
  await platformNav.locator('summary').filter({hasText:/^Learn/}).click();
  await platformNav.getByRole('link', { name: 'Courses', exact: true }).click();
  await expect(page).toHaveURL(/\/courses$/);
  await page.goto('/community');
  await expect(page.locator('#v-comm')).toHaveClass(/on/);
  await expect(page.locator('#intro')).toHaveClass(/out/);
});

test("desktop competition rows retain 70/30 proportions", async ({ page }) => {
  await open(page);
  await root(page).locator("#hackathons").scrollIntoViewIfNeeded();
  const ratio = await root(page).evaluate((host) => {
    const q = (s) => host.shadowRoot.querySelector(s).getBoundingClientRect();
    return q(".challenge-event").width / q(".challenge-leaderboard").width;
  });
  expect(ratio).toBeGreaterThan(2.2);
  expect(ratio).toBeLessThan(2.5);
  await expect(root(page).locator(".challenge-event")).toHaveCSS(
    "opacity",
    "1",
  );
  await page.screenshot({ path: ".local/homepage-competitions.png" });
});
for (const width of [768, 390])
  test(`responsive layout at ${width}px and reduced motion`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await open(page);
    const title = await root(page).locator("h1").textContent();
    await page.waitForTimeout(4400);
    expect(await root(page).locator("h1").textContent()).toBe(title);
    const overflow = await page.evaluate(() => {
      const intro = document.getElementById("intro");
      return intro.scrollWidth - intro.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(1);
    const layout = await root(page).evaluate((host) => {
      const q = (s) => host.shadowRoot.querySelector(s).getBoundingClientRect();
      return {
        buttons: q(".hero-buttons").bottom,
        stats: q(".hero-socials").top,
      };
    });
    expect(layout.stats).toBeGreaterThan(layout.buttons);
    await root(page).getByRole("button", { name: "Toggle navigation" }).click();
    await expect(root(page).locator(".mobile-menu")).toBeVisible();
    await root(page).locator('.mobile-menu summary').filter({hasText:/^Build/}).click();
    await root(page).locator('.mobile-menu a[href="/projects"]').click();
    await expect(page.locator("#v-projects")).toHaveClass(/on/);
    await expect(page.locator("#intro")).toHaveClass(/out/);
    await page.evaluate(() => window.goLanding());
    await page.evaluate(() => document.getElementById("intro").scrollTo(0, 0));
    await page.screenshot({ path: `.local/homepage-${width}.png` });
  });
test("API outages show honest unavailable states without breaking the page", async ({
  page,
}) => {
  await page.route("**/api/courses", (route) =>
    route.fulfill({ status: 503, json: { error: "unavailable" } }),
  );
  await page.route("**/api/projects", (route) =>
    route.fulfill({ status: 503, json: { error: "unavailable" } }),
  );
  await open(page);
  await expect(root(page).getByRole("status")).toContainText("courses");
  await expect(root(page).locator(".project-mini").first()).toContainText(
    "Projects unavailable",
  );
  await expect(root(page).locator(".course-card")).toHaveCount(0);
});
