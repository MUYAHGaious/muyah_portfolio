import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests against a running stack.
 *
 * These do not start the app — bring it up first, either with
 * `docker compose up -d` or `npm run dev` alongside the API, then:
 *   BASE_URL=http://localhost:3000 npm run test:e2e
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    // The local stack uses Caddy's internal CA, which is not publicly trusted.
    ignoreHTTPSErrors: true,
  },
  /**
   * `channel: "chrome"` drives the Chrome already installed on the machine
   * instead of Playwright's bundled build. That avoids a ~150MB download and
   * keeps the suite runnable anywhere Chrome exists. Drop the channel and run
   * `npx playwright install chromium` if you would rather pin the browser.
   */
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
});
