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
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
