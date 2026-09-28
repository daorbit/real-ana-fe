import { defineConfig, devices } from "@playwright/test";
import { API_URL, BACKEND_DIR, BASE_URL, BE_PORT, FE_PORT } from "./e2e/support/env";

const reuse = !process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./e2e/.results",
  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 3,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { outputFolder: "e2e/.report", open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: "node scripts/build-tracker.mjs && node --import tsx src/index.ts",
      cwd: BACKEND_DIR,
      port: BE_PORT,
      env: { PORT: String(BE_PORT), CLOUDFLARE_SECRET_KEY: "" },
      reuseExistingServer: reuse,
      timeout: 180_000,
    },
    {
      command: `npx vite --mode e2e --port ${FE_PORT} --strictPort`,
      url: BASE_URL,
      env: { API_PROXY_TARGET: API_URL },
      reuseExistingServer: reuse,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: "desktop",
      testMatch: /onboarding\/(?!responsive).*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      testMatch: /onboarding\/responsive\.spec\.ts/,
      use: { ...devices["Pixel 7"] },
    },
  ],
});
