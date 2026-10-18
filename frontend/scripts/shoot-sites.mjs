// Screenshot a list of live sites for use as project covers.
//   node frontend/scripts/shoot-sites.mjs <outDir> <url> [<url> ...]
// Desktop viewport, above the fold, JPEG. Waits for network idle and a
// moment more so hero animations settle.

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { chromium } from "playwright";

const [outDir, ...urls] = process.argv.slice(2);
if (!outDir || urls.length === 0) {
  console.error("usage: shoot-sites.mjs <outDir> <url> [...]");
  process.exit(1);
}
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
});

for (const url of urls) {
  const page = await context.newPage();
  const name = new URL(url).hostname.replace(/^www\./, "").replace(/[^a-z0-9.-]/gi, "_");
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
    await page.waitForTimeout(2500);
    const file = join(outDir, `${name}.jpg`);
    await page.screenshot({ path: file, type: "jpeg", quality: 88 });
    console.log(`ok   ${url} -> ${file}`);
  } catch (error) {
    console.log(`FAIL ${url}: ${error instanceof Error ? error.message.split("\n")[0] : error}`);
  } finally {
    await page.close();
  }
}
await browser.close();
