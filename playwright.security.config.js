const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "./tests/security-browser",
  workers: 1,
  timeout: 30000,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3101",
    headless: true,
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: "node scripts/start-security-test-server.js",
    url: "http://127.0.0.1:3101/api/health",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
