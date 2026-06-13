import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, "screenshots");
const gifFrames = path.join(root, "hero-gif-frames");
await mkdir(out, { recursive: true });
await mkdir(gifFrames, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function openHero(viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await page.goto("http://127.0.0.1:3115/", { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    const video = document.querySelector("video");
    video.muted = true;
    await video.play();
  });
  await page.waitForTimeout(900);
  return page;
}

const desktop = await openHero({ width: 1440, height: 900 });
await desktop.screenshot({ path: path.join(out, "01-video-hero-desktop.png"), fullPage: false });
await desktop.waitForTimeout(2600);
await desktop.screenshot({ path: path.join(out, "02-video-hero-desktop-later.png"), fullPage: false });

for (let i = 0; i < 48; i += 1) {
  await desktop.screenshot({ path: path.join(gifFrames, `hero-${String(i + 1).padStart(4, "0")}.png`), fullPage: false });
  await desktop.waitForTimeout(1000 / 12);
}
await desktop.close();

const mobile = await openHero({ width: 390, height: 844 });
await mobile.screenshot({ path: path.join(out, "03-video-hero-mobile.png"), fullPage: false });
await mobile.waitForTimeout(2200);
await mobile.screenshot({ path: path.join(out, "04-video-hero-mobile-later.png"), fullPage: false });
await mobile.close();

await browser.close();
