import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "local-admin-password-123";

test.describe("public site", () => {
  test("home page renders the site name and navigation", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
  });

  test("work index links through to a case study", async ({ page }) => {
    await page.goto("/work");

    const firstProject = page.locator("main a[href^='/work/']").first();
    test.skip((await firstProject.count()) === 0, "no published projects to open");

    const href = await firstProject.getAttribute("href");
    await firstProject.click();

    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("about and writing pages load", async ({ page }) => {
    for (const path of ["/about", "/writing"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("an unknown URL returns the 404 page", async ({ page }) => {
    await page.goto("/definitely-not-a-real-page");
    await expect(page.getByText(/doesn't exist/i)).toBeVisible();
  });

  test("contact form submits and confirms", async ({ page }) => {
    await page.goto("/contact");

    await page.getByLabel("Your name").fill("Playwright Test");
    await page.getByLabel("Email", { exact: true }).fill("playwright@example.com");
    await page
      .getByLabel("Message")
      .fill("This message was sent by the end-to-end smoke test.");

    // The API rejects submissions faster than 2s as bot traffic.
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Send message" }).click();

    await expect(page.getByText("Message sent.")).toBeVisible({ timeout: 10_000 });
  });

  test("theme toggle switches and persists", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /Switch to .* theme/ }).click();
    const chosen = await page.locator("html").getAttribute("data-theme");
    expect(chosen).toMatch(/light|dark/);

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", chosen!);
  });
});

test.describe("admin", () => {
  test("signed-out visitors get the login form, not the panel", async ({ page }) => {
    await page.goto("/admin/projects");

    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Projects" })).toHaveCount(0);
  });

  test("signing in reveals the panel, and a new project appears on the site", async ({ page }) => {
    await page.goto("/admin");

    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

    // Create → publish → confirm it is publicly visible.
    await page.getByRole("link", { name: "Projects" }).click();
    await page.getByRole("button", { name: "New project" }).click();
    await expect(page).toHaveURL(/\/admin\/projects\/\d+$/);

    const title = `E2E project ${Date.now()}`;
    await page.getByLabel("Title").fill(title);
    await page.getByLabel("Published").check();
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Saved.")).toBeVisible();

    const slug = await page.getByLabel("Slug").inputValue();
    await page.goto(`/work/${slug}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  });

  test("signing out ends the session", async ({ page }) => {
    await page.goto("/admin");
    await page.getByLabel("Email").fill(ADMIN_EMAIL);
    await page.getByLabel("Password").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });
});
