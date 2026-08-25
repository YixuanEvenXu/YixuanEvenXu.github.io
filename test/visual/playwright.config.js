const path = require("path");
const { devices } = require("@playwright/test");

const repoRoot = path.resolve(__dirname, "../..");

module.exports = {
  testDir: __dirname,
  timeout: 120000,
  expect: { timeout: 10000 },
  use: {
    baseURL: "http://127.0.0.1:4001",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "bundle exec jekyll serve --host 127.0.0.1 --port 4001 --no-watch --quiet",
    cwd: repoRoot,
    url: "http://127.0.0.1:4001/",
    reuseExistingServer: !process.env.CI,
    timeout: 300000,
  },
  projects: [
    {
      name: "desktop",
      use: { viewport: { width: 1366, height: 900 } },
    },
    {
      name: "mobile",
      use: { ...devices["iPhone 12"], browserName: "chromium" },
    },
  ],
};
