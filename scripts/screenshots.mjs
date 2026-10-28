#!/usr/bin/env node
// Takes full-page screenshots of the built site and checks each page for
// console errors and horizontal scrolling.
//   npm run build && npm run preview      (in another terminal)
//   node scripts/screenshots.mjs [--widths 375,1280] [--themes light,dark] [--pages /,/en/]
// Screenshots go to screenshots/ (git-ignored). Exits with code 1 on any problem.

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "screenshots");

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1].split(",") : fallback;
};

const BASE = process.env.BASE_URL ?? "http://localhost:4321";
const PAGES = arg("pages", ["/", "/en/", "/services", "/en/services", "/404.html"]);
const WIDTHS = arg("widths", ["375", "768", "1280"]).map(Number);
const THEMES = arg("themes", ["light", "dark"]);

const slug = (path) => path.replace(/^\/|\/$|\.html$/g, "").replace(/\//g, "-") || "home-fr";

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const problems = [];

for (const theme of THEMES) {
  for (const width of WIDTHS) {
    // Reduced motion: the scroll reveal would otherwise hide blocks that are
    // below the fold in a full-page capture.
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      colorScheme: theme,
      reducedMotion: "reduce",
    });
    for (const path of PAGES) {
      const page = await context.newPage();
      const errors = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(BASE + path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const file = join(OUT, `${slug(path)}-${width}-${theme}.png`);
      await page.screenshot({ path: file, fullPage: true });
      // A 404 response is expected for the 404 page itself.
      const real = errors.filter((e) => !(path.includes("404") && /404/.test(e)));
      if (real.length) problems.push(`${path} @${width} ${theme}: console errors: ${real.join(" | ")}`);
      if (overflow > 0) problems.push(`${path} @${width} ${theme}: horizontal scroll (${overflow}px)`);
      console.log(`✔ ${file}`);
      await page.close();
    }
    await context.close();
  }
}

await browser.close();
if (problems.length) {
  console.log(`✖ ${problems.length} problem(s):`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log("✔ no console error, no horizontal scroll.");
