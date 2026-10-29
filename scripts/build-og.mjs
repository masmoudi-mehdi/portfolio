#!/usr/bin/env node
// Builds the 1200x630 share images (Open Graph / LinkedIn / WhatsApp previews).
//   npm run og
// Renders name, title and photo from content/profile.json with Playwright and
// writes public/assets/images/og-fr.png and og-en.png. The PNGs are committed,
// so the deploy build does not need a browser: run this only when the name,
// the title or the photo changes.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = JSON.parse(readFileSync(join(root, "content", "profile.json"), "utf8"));
const photo = `data:image/webp;base64,${readFileSync(join(root, "src", "assets", "mehdi.webp")).toString("base64")}`;
const domain = new URL(p.identity.website).host;

const page = (lang) => `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    display: flex; align-items: center; gap: 72px; padding: 0 96px;
    font-family: "Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif;
    color: #f3f4f6;
    background:
      radial-gradient(circle at 15% 20%, rgb(34 211 238 / 0.22), transparent 55%),
      linear-gradient(135deg, #111827 0%, #0f172a 60%, #172554 100%);
  }
  img {
    width: 280px; height: 280px; flex: none; border-radius: 50%; object-fit: cover;
    border: 6px solid #22d3ee; box-shadow: 0 0 60px rgb(34 211 238 / 0.35);
  }
  h1 { font-size: 84px; line-height: 1.05; font-weight: 800; letter-spacing: -1px; }
  .title {
    margin-top: 20px; font-size: 46px; font-weight: 700; line-height: 1.2;
    background: linear-gradient(90deg, #22d3ee, #3b82f6);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .meta { margin-top: 28px; font-size: 30px; color: #9ca3af; }
  .meta b { color: #d1d5db; font-weight: 600; }
</style></head><body>
  <img src="${photo}" alt="">
  <div>
    <h1>${p.identity.name}</h1>
    <div class="title">${p.identity.title[lang]}</div>
    <div class="meta">${p.identity.location[lang]} · <b>${domain}</b></div>
  </div>
</body></html>`;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const lang of ["fr", "en"]) {
  const tab = await context.newPage();
  await tab.setContent(page(lang));
  await tab.evaluate(() => document.fonts.ready);
  const file = join(root, "public", "assets", "images", `og-${lang}.png`);
  writeFileSync(file, await tab.screenshot({ type: "png" }));
  console.log(`wrote ${file}`);
}
await browser.close();
