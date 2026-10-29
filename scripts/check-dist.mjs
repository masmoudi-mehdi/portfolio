#!/usr/bin/env node
// Checks the built site in dist/ for SEO and sharing mistakes.
//   npm run build && npm run check:dist
// Per page: unique <title> and description, canonical = the page's own URL,
// FR/EN hreflang pairs that point at each other (+ x-default), a 1200x630 share
// image that exists, noindex only on the 404, and a valid JSON-LD Person on the
// home pages. Also checks that every internal link points at a built file.
// Exits with code 1 on any problem.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const SITE = "https://www.mehdimasmoudi.com";

// Redirect stubs written by Astro for the old URLs (they only hold a meta refresh).
const REDIRECTS = new Set(["index-en.html", "services-en.html"]);

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

/** dist file -> public URL path (GitHub Pages serves foo.html at /foo and /foo.html). */
const urlOf = (file) => {
  const rel = relative(dist, file).replace(/\\/g, "/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel.replace(/\.html$/, "")}`;
};

/** Public URL path -> file that GitHub Pages would serve, or null. */
const fileFor = (path) => {
  const clean = decodeURIComponent(path.split(/[?#]/)[0]);
  const candidates = clean.endsWith("/")
    ? [`${clean}index.html`]
    : [clean, `${clean}.html`, `${clean}/index.html`];
  return candidates.map((c) => join(dist, c)).find((c) => existsSync(c) && statSync(c).isFile()) ?? null;
};

const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const metaContent = (html, key, value) => {
  const tag = html.match(new RegExp(`<meta[^>]*\\b${key}="${value}"[^>]*>`))?.[0];
  return tag && decode(attr(tag, "content") ?? "");
};

const problems = [];
const fail = (page, msg) => problems.push(`${page}: ${msg}`);

const pages = walk(dist)
  .filter((f) => f.endsWith(".html") && !REDIRECTS.has(relative(dist, f).replace(/\\/g, "/")))
  .map((file) => {
    const html = readFileSync(file, "utf8");
    return { file, url: urlOf(file), html, is404: file.endsWith("404.html") };
  });

const byUrl = new Map(pages.map((pg) => [pg.url, pg]));
const titles = new Map();
const descriptions = new Map();

for (const pg of pages) {
  const { html, url } = pg;
  const lang = html.match(/<html[^>]*\blang="([^"]+)"/)?.[1];
  if (!lang) fail(url, "missing <html lang>");

  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "").trim();
  if (!title) fail(url, "missing <title>");
  else if (titles.has(title)) fail(url, `title already used by ${titles.get(title)}`);
  else titles.set(title, url);

  const description = metaContent(html, "name", "description");
  if (!description) fail(url, "missing meta description");
  else {
    if (descriptions.has(description)) fail(url, `description already used by ${descriptions.get(description)}`);
    descriptions.set(description, url);
    if (description.length > 170) fail(url, `description is ${description.length} characters (keep it under 170)`);
  }

  const robots = metaContent(html, "name", "robots");
  if (pg.is404) {
    if (!/noindex/.test(robots ?? "")) fail(url, "the 404 page should be noindex");
    continue; // no canonical / hreflang on the 404
  }
  if (/noindex/.test(robots ?? "")) fail(url, "indexable page is marked noindex");

  // Canonical: absolute and equal to the page's own URL (the EN home keeps its trailing slash).
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*>/)?.[0];
  const canonicalHref = canonical && attr(canonical, "href");
  if (!canonicalHref) fail(url, "missing canonical");
  else if (canonicalHref !== `${SITE}${url}`) fail(url, `canonical is ${canonicalHref}, expected ${SITE}${url}`);

  // hreflang: fr + en + x-default, self-referencing, and each target links back.
  const alternates = Object.fromEntries(
    [...html.matchAll(/<link[^>]*rel="alternate"[^>]*hreflang="[^"]*"[^>]*>/g)].map((m) => [attr(m[0], "hreflang"), attr(m[0], "href")]),
  );
  for (const key of ["fr", "en", "x-default"]) if (!alternates[key]) fail(url, `missing hreflang="${key}"`);
  if (alternates[lang] !== canonicalHref) fail(url, `hreflang="${lang}" (${alternates[lang]}) is not the canonical URL`);
  if (alternates["x-default"] !== alternates.fr) fail(url, "x-default should point at the FR page");
  for (const [key, href] of Object.entries(alternates)) {
    if (key === "x-default" || !href) continue;
    const target = byUrl.get(new URL(href).pathname);
    if (!target) {
      fail(url, `hreflang="${key}" points at ${href}, which is not a built page`);
      continue;
    }
    const back = target.html.match(new RegExp(`<link[^>]*hreflang="${lang}"[^>]*>`))?.[0];
    if (!back || attr(back, "href") !== `${SITE}${url}`) fail(url, `${href} does not link back with hreflang="${lang}"`);
  }

  // Share card.
  const og = metaContent(html, "property", "og:image");
  if (!og) fail(url, "missing og:image");
  else {
    const file = fileFor(new URL(og).pathname);
    if (!file) fail(url, `og:image ${og} is not in dist`);
    else {
      const png = readFileSync(file);
      const [w, h] = [png.readUInt32BE(16), png.readUInt32BE(20)];
      if (w !== 1200 || h !== 630) fail(url, `og:image is ${w}x${h}, expected 1200x630`);
    }
  }
  if (metaContent(html, "property", "og:url") !== canonicalHref) fail(url, "og:url differs from the canonical");
  if (metaContent(html, "name", "twitter:card") !== "summary_large_image") fail(url, "twitter:card is not summary_large_image");

  // JSON-LD: parseable; the home pages must carry a complete Person.
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const parsed = blocks.map((raw) => {
    try {
      return JSON.parse(raw);
    } catch (error) {
      fail(url, `invalid JSON-LD: ${error.message}`);
      return null;
    }
  });
  const isHome = url === "/" || url === "/en/";
  const person = parsed.find((j) => j?.["@type"] === "Person");
  if (isHome && !person) fail(url, "missing JSON-LD Person");
  if (person) {
    if (person["@context"] !== "https://schema.org") fail(url, "JSON-LD @context should be https://schema.org");
    for (const key of ["name", "jobTitle", "url", "image", "sameAs"]) if (!person[key]?.length) fail(url, `JSON-LD Person is missing "${key}"`);
    if (person.url !== canonicalHref) fail(url, `JSON-LD url ${person.url} is not the canonical URL`);
  }

  // Internal links must hit a built file (fragments are checked against ids).
  for (const m of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)) {
    const href = decode(m[1]);
    if (/^(mailto:|tel:|https?:\/\/(?!www\.mehdimasmoudi\.com))/.test(href)) continue;
    const target = new URL(href, `${SITE}${url}`);
    if (target.origin !== SITE) continue;
    const file = fileFor(target.pathname);
    if (!file) {
      fail(url, `broken link ${href}`);
      continue;
    }
    if (target.hash && file.endsWith(".html") && !new RegExp(`\\bid="${target.hash.slice(1)}"`).test(readFileSync(file, "utf8"))) {
      fail(url, `link ${href} points at a missing #${target.hash.slice(1)}`);
    }
  }
}

console.log(`Checked ${pages.length} pages: ${pages.map((pg) => pg.url).join("  ")}`);
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log("All good.");
