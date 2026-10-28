#!/usr/bin/env node
// Checks content/profile.json and the 4 site pages before publishing.
//   node scripts/check-profile.mjs
// Errors exit with code 1. TODOs are listed as warnings.
//
// Confidential words (client name, internal resource names...) are stored as
// SHA-256 hashes so this public file never spells them out. Extra plain-text
// terms (e.g. colleagues' names) can go in scripts/forbidden.local.txt, one per
// line; that file is git-ignored.

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROFILE = join(root, "content", "profile.json");
const PAGES = ["index.html", "index-en.html", "services.html", "services-en.html"];
const MY_EMAIL = "mehdi.masmoudi.contact@gmail.com";

const FORBIDDEN_TOKEN_HASHES = new Set([
  "9f2be91c0233367c81b318914d168202ce080050d3927417e55e55a3a10a6bbd",
  "08e09e0bfa9fb6ab932178b1cb031006c602b446bfe0c3120aefe4be1eef7d25",
  "6013de0381f648b7f21518885c02b40b7583adfb33c6d9b64d3aed52c3934798",
  "99cddae35c6ce152575cc406cd2e28b6a7d35e2e3b1320fc7b85f77dbf976f91",
  "6cf285ba906b48a885260866e88de5a9636b2dafa072a0a177d1036d92032798",
  "0fbc0a18208fbb8758898ce72443e60f98c6d0b090c1c8895e777e53dd05cc18",
  "a6f6aeb588d96b0ed060c33911f7a75b21a2fbd79156b775689384d4f4a4e2ce",
]);

const localTermsFile = join(root, "scripts", "forbidden.local.txt");
const LOCAL_TERMS = existsSync(localTermsFile)
  ? readFileSync(localTermsFile, "utf8")
      .split(/\r?\n/)
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l && !l.startsWith("#"))
  : [];

// Rules that apply to the JSON and to the pages.
const COMMON_RULES = [
  [/facebook|instagram|youtube/i, "social network other than LinkedIn/GitHub"],
  [/\b(password|passwd|mot de passe|api[_-]?key|secret|token)\b\s*[:=]/i, "looks like a secret"],
  [/\bsk-[A-Za-z0-9_-]{10,}|\beyJ[A-Za-z0-9_-]{15,}|-----BEGIN [A-Z ]*KEY/, "looks like a key or token"],
  [
    /\.azurecontainer\.io|\.azurecr\.io|\.database\.azure\.com|\.servicebus\.windows\.net|\.vault\.azure\.net|\.blob\.core\.windows\.net|\.azurewebsites\.net|dev\.azure\.com|visualstudio\.com|localhost|127\.0\.0\.1/i,
    "internal host or URL",
  ],
  [/\b[a-z0-9]+(?:-[a-z0-9]+)*-(?:rsg|rg|kv|asb|aif|azf|acr|psql|aca)\b/i, "looks like an Azure resource name"],
  [/\bPR\s*#?\s*\d+|(?:^|\s)#\d{3,}\b/i, "PR or ticket number"],
  [/[$€£]\s*\d|\d\s*[$€£]|\b\d+\s*(?:usd|eur|tnd)\b/i, "money amount"],
  [/passionn|expert en|expertise technique|leader technique|technical leader|\bsenior\b|solutions? innovantes?|innovative solutions?/i, "cliché or banned title"],
];

const errors = [];
const warnings = [];
const err = (where, msg) => errors.push(`${where}: ${msg}`);

const normalize = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const sha = (s) => createHash("sha256").update(s).digest("hex");

function checkText(where, text) {
  for (const [re, label] of COMMON_RULES) {
    const m = text.match(re);
    if (m) err(where, `${label}: "${m[0].trim()}"`);
  }
  const norm = normalize(text);
  for (const token of new Set(norm.split(/[^a-z0-9]+/))) {
    if (token && FORBIDDEN_TOKEN_HASHES.has(sha(token))) err(where, "confidential word (hashed list)");
  }
  for (const term of LOCAL_TERMS) {
    if (norm.includes(normalize(term))) err(where, `term from forbidden.local.txt: "${term}"`);
  }
  for (const email of text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/g) || []) {
    if (email.toLowerCase() !== MY_EMAIL) err(where, `e-mail other than mine: ${email}`);
  }
}

// ---------- profile.json ----------
let profile;
try {
  profile = JSON.parse(readFileSync(PROFILE, "utf8"));
} catch (e) {
  console.error(`✖ content/profile.json does not parse: ${e.message}`);
  process.exit(1);
}

// Digits allowed in narrative text: years, durations are written in words,
// software versions after a known name.
const ALLOWED_DIGITS = [
  /\b(?:19|20)\d\d\b/g,
  /\b(?:Node(?:\.js)?|React|Express|Angular|Vite|Prisma|Python|Zod)\s?\d+(?:\.\d+)*\b/g,
  /\b(?:HTML5|CSS3|CS50|Web3)\b/g,
  /\b[ABC][12]\b/g, // CEFR language levels
];
const NO_DIGIT_CHECK = new Set(["identity", "start", "end", "_sources", "certifications", "konami"]);

function shapeOf(v) {
  if (Array.isArray(v)) return `array(${v.length})`;
  if (v && typeof v === "object") return `object{${Object.keys(v).sort().join(",")}}`;
  return v === null ? "null" : typeof v;
}

function sameShape(path, a, b) {
  if (shapeOf(a) !== shapeOf(b)) {
    err(path, `FR/EN differ: fr is ${shapeOf(a)}, en is ${shapeOf(b)}`);
    return;
  }
  if (Array.isArray(a)) a.forEach((x, i) => sameShape(`${path}[${i}]`, x, b[i]));
  else if (a && typeof a === "object") for (const k of Object.keys(a)) sameShape(`${path}.${k}`, a[k], b[k]);
}

function walk(node, path, skipDigits) {
  if (typeof node === "string") {
    checkText(path, node);
    if (/\bTODO\b/.test(node)) warnings.push(`${path}: TODO`);
    if (!skipDigits) {
      let rest = node;
      for (const re of ALLOWED_DIGITS) rest = rest.replace(re, "");
      if (/\d/.test(rest)) err(path, `number in text (no internal numbers allowed): "${node}"`);
    }
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((x, i) => walk(x, `${path}[${i}]`, skipDigits));
    return;
  }
  if (node && typeof node === "object") {
    const hasFr = "fr" in node;
    const hasEn = "en" in node;
    if (hasFr !== hasEn) err(path, `has ${hasFr ? "fr" : "en"} but not ${hasFr ? "en" : "fr"}`);
    if (hasFr && hasEn) sameShape(path, node.fr, node.en);
    for (const [k, v] of Object.entries(node)) {
      walk(v, path ? `${path}.${k}` : k, skipDigits || NO_DIGIT_CHECK.has(k));
    }
  }
}

walk(profile, "", false);

// Text that the site shows must not be English-only or French-only.
for (const key of ["headline", "subline", "about"]) {
  if (!profile[key]?.fr || !profile[key]?.en) err(key, "missing fr or en");
}

// ---------- pages ----------
const visibleText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&amp;|&#39;|&quot;/g, " ");

for (const page of PAGES) {
  const file = join(root, page);
  if (!existsSync(file)) {
    err(page, "page not found");
    continue;
  }
  // Inline styles hold hex colours like #111827, not ticket numbers.
  const html = readFileSync(file, "utf8").replace(/\sstyle="[^"]*"/g, "");
  checkText(page, html);
  if (page.startsWith("services")) {
    const text = visibleText(html);
    const we = page.endsWith("-en.html") ? /\b(we|our|ours|us)\b/i : /\b(nous|notre|nos)\b/i;
    const m = text.match(we);
    if (m) err(page, `services page must speak in the first person singular, found "${m[0]}"`);
  }
}

// ---------- report ----------
if (warnings.length) {
  console.log(`⚠ ${warnings.length} TODO(s) to fill:`);
  for (const w of warnings) console.log(`  - ${w}`);
}
if (errors.length) {
  console.log(`✖ ${errors.length} error(s):`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exit(1);
}
console.log("✔ profile.json parses, FR/EN match, no forbidden item in the JSON or the 4 pages.");
