import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "local-admin-password-123";

test.describe("public site", () => {
  test("home page renders the site name and navigation", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Below the md breakpoint the links collapse behind a menu button, so accept
    // either affordance rather than assuming a desktop viewport.
    const desktopNav = page.getByRole("navigation", { name: "Main" });
    const menuButton = page.getByRole("button", { name: /Open menu|Close menu/ });

    await expect(desktopNav.or(menuButton).first()).toBeVisible();
  });

  test("mobile menu opens and exposes the links", async ({ page, viewport }) => {
    test.skip((viewport?.width ?? 0) >= 768, "desktop shows the links inline");

    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();

    const mobileNav = page.getByRole("navigation", { name: "Mobile" });
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByRole("link", { name: "Work" })).toBeVisible();
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

  test("about, writing, and services pages load", async ({ page }) => {
    for (const path of ["/about", "/writing", "/services"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBeLessThan(400);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("scroll-revealed content becomes visible", async ({ page }) => {
    await page.goto("/");

    const revealed = page.locator("[data-reveal]").first();
    await revealed.scrollIntoViewIfNeeded();

    // The reveal must finish — content that stays at opacity 0 is invisible
    // content, which is the failure mode worth guarding against.
    await expect(revealed).toHaveAttribute("data-revealed", "true", { timeout: 5_000 });
    await expect(revealed).toBeVisible();
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

    // Both outcomes are correct behaviour. Every browser project submits from the
    // same IP, and the API allows three messages per hour — so asserting only on
    // success would make this test fail purely because the previous project ran
    // first. What matters is that the form reaches a terminal state and says why.
    const confirmed = page.getByText("Message sent.");
    const rateLimited = page.getByText(/sent a few messages recently/i);

    await expect(confirmed.or(rateLimited).first()).toBeVisible({ timeout: 10_000 });
  });

  test("theme toggle switches and persists", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /Switch to .* mode/ }).click();
    const chosen = await page.locator("html").getAttribute("data-theme");
    expect(chosen).toMatch(/light|dark/);

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", chosen!);
  });
});

test.describe("admin", () => {
  // Signing in runs a deliberately slow bcrypt comparison, and these specs sign
  // in repeatedly across parallel browser projects. The default 30s is tight
  // enough to fail on load rather than on a defect.
  test.setTimeout(60_000);

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

    // The editor fetches the record after routing, so wait for the form itself
    // rather than assuming it is present the moment the URL changes.
    const titleField = page.getByLabel("Title");
    await expect(titleField).toBeVisible({ timeout: 20_000 });

    const title = `E2E project ${Date.now()}`;
    await titleField.fill(title);
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
