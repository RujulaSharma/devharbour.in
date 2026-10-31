const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./tests/homepage",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  reporter: "list",
  use: {
    baseURL: process.env.HOMEPAGE_BASE_URL || "http://127.0.0.1:3000",
    headless: true,
    viewport: { width: 1440, height: 1000 },
  },
});
