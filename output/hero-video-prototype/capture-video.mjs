import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const jobs = [
  { name: "desktop", file: "source-desktop.html", width: 1280, height: 720, frames: 192 },
  { name: "mobile", file: "source-mobile.html", width: 540, height: 960, frames: 192 },
];

const browser = await chromium.launch({ headless: true });

for (const job of jobs) {
  const dir = path.join(root, "frames", job.name);
  await mkdir(dir, { recursive: true });
  const page = await browser.newPage({
    viewport: { width: job.width, height: job.height },
    deviceScaleFactor: 1,
  });
  await page.goto(`file://${path.join(root, job.file).replaceAll("\\", "/")}`);
  await page.waitForLoadState("load");
  for (let i = 0; i < job.frames; i += 1) {
    await page.screenshot({
      path: path.join(dir, `frame-${String(i + 1).padStart(4, "0")}.png`),
      animations: "allow",
    });
    await page.waitForTimeout(1000 / 24);
  }
  await page.close();
}

await browser.close();
