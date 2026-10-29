const { test, expect } = require("@playwright/test");
test("browser authentication uses HttpOnly cookies and persists across reloads without password storage", async ({
  page,
}) => {
  const stamp = Date.now();
  const password = "Browser-test-p@ssword-77!";
  await page.goto("/");
  await page.locator("#dh-homepage .nav-btn").click();
  await page.locator("#su-name").fill("Browser Security Fixture");
  await page.locator("#su-user").fill("browser_" + stamp);
  await page.locator("#su-email").fill("browser_" + stamp + "@example.test");
  await page.locator("#su-pass").fill(password);
  await page.locator("#form-signup button[type=submit]").click();
  await expect(page.locator("#dh-auth-modal")).not.toHaveClass(/open/);
  await expect(page.locator("#v-home")).toHaveClass(/on/);
  const cookies = await page.context().cookies();
  expect(cookies.find((cookie) => cookie.name === "dh_session")?.httpOnly).toBe(
    true,
  );
  expect(await page.evaluate(() => document.cookie)).not.toContain(
    "dh_session",
  );
  const storage = await page.evaluate(() => JSON.stringify(localStorage));
  expect(storage).not.toContain(password);
  expect(storage).not.toContain("dh_users_db");
  expect(storage).not.toContain("dh_token");
  await page.reload();
  await expect
    .poll(() => page.evaluate(() => window.isAuthenticated()))
    .toBe(true);
  await page.evaluate(() => window.handleLogout());
  await expect
    .poll(() => page.evaluate(() => window.isAuthenticated()))
    .toBe(false);
  await expect
    .poll(async () => {
      const response = await page.request.get("/api/auth/me");
      return response.status();
    })
    .toBe(401);
});
test("failed backend login never accepts a forged local account", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem(
      "dh_users_db",
      JSON.stringify([
        {
          username: "forged_admin",
          password: "ForgedPassword!",
          role: "admin",
        },
      ]),
    );
    localStorage.setItem(
      "dh_current_user",
      JSON.stringify({ username: "forged_admin", role: "admin" }),
    );
    localStorage.setItem("dh_token", "local-token-forged");
  });
  await page.reload();
  await page.locator("#dh-homepage .nav-auth a").first().click();
  await page.locator("#li-user").fill("forged_admin");
  await page.locator("#li-pass").fill("ForgedPassword!");
  await page.route("**/api/auth/login", (route) =>
    route.fulfill({ status: 401, json: { error: "Invalid credentials" } }),
  );
  const rejected = page.waitForResponse((response) =>
    response.url().endsWith("/api/auth/login"),
  );
  await page.locator("#form-login button[type=submit]").click();
  await rejected;
  await expect(page.locator("#li-msg")).toContainText("Invalid credentials");
  expect(await page.evaluate(() => window.isAuthenticated())).toBe(false);
  expect(
    await page.evaluate(() => localStorage.getItem("dh_users_db")),
  ).toBeNull();
});
test("forged locally cached certificates are not treated as verified", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem(
      "dh_cert_FORGED",
      JSON.stringify({
        credential_id: "FORGED",
        recipient_name: "Forged Credential",
      }),
    ),
  );
  await page.evaluate(() => loadCertificateVerification("FORGED"));
  expect(
    await page.evaluate(
      () =>
        typeof currentCertificate === "undefined" ||
        !currentCertificate ||
        currentCertificate.credential_id !== "FORGED",
    ),
  ).toBe(true);
});

test("workspace caches cannot cross accounts and stored markup renders as text", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(() => {
    const before = currentUser;
    currentUser = { id: "browser_account_a", username: "account_a" };
    window.currentUser = currentUser;
    LocalDB.workspace._save("tasks", [
      {
        id: "task_fixture",
        title: "PRIVATE ACCOUNT A TASK",
        status: "pending",
        priority: "high",
      },
    ]);
    currentUser = { id: "browser_account_b", username: "account_b" };
    window.currentUser = currentUser;
    const otherTasks = LocalDB.workspace.getTasks();
    LocalDB.workspace._save("notes", [
      {
        id: "note_fixture",
        title: '<img src=x onerror="window.__xssExecuted=true">',
        content: "Safe note body",
        link_url: "javascript:window.__xssExecuted=true",
      },
    ]);
    WorkspaceManager.renderNotes();
    const notes = document.getElementById("ws-notes-list");
    const outcome = {
      otherTasks,
      hasInjectedImage: !!notes.querySelector("img"),
      badLinks: [...notes.querySelectorAll("a")].some((a) =>
        a.getAttribute("href").startsWith("javascript:"),
      ),
      executed: !!window.__xssExecuted,
    };
    currentUser = before;
    window.currentUser = before;
    return outcome;
  });
  expect(
    result.otherTasks.some((task) => task.title === "PRIVATE ACCOUNT A TASK"),
  ).toBe(false);
  expect(result.hasInjectedImage).toBe(false);
  expect(result.badLinks).toBe(false);
  expect(result.executed).toBe(false);
});
