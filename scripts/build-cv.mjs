#!/usr/bin/env node
// Builds the French and English CVs from content/profile.json.
//   npm run cv
// 1. fills cv/template.html (+ cv/cv.css) with the fr / en data,
// 2. writes the filled pages to cv/build/ (git-ignored, handy to preview),
// 3. prints them with Playwright (Chromium) to public/assets/cv/cv-francais.pdf and
//    public/assets/cv/cv-anglais.pdf, served by the site at /assets/cv/.
// What the CV keeps (profile text, bullets, projects) is set in profile.json > cv.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = JSON.parse(readFileSync(join(root, "content", "profile.json"), "utf8"));
// Comments are for whoever edits the template; they don't go into the CV.
const template = readFileSync(join(root, "cv", "template.html"), "utf8").replace(/<!--[\s\S]*?-->\s*/g, "");

const OUTPUT = {
  fr: join(root, "public", "assets", "cv", "cv-francais.pdf"),
  en: join(root, "public", "assets", "cv", "cv-anglais.pdf"),
};
const MAX_PAGES = 2;

const UI = {
  fr: {
    docTitle: "CV",
    present: "aujourd'hui",
    months: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
    colon: " :",
    client: "Client",
    stack: "Stack",
    h: {
      profile: "Profil",
      experience: "Expérience professionnelle",
      projects: "Projets sélectionnés",
      skills: "Compétences",
      education: "Formation et certifications",
      languages: "Langues",
    },
  },
  en: {
    docTitle: "Resume",
    present: "Present",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    colon: ":",
    client: "Client",
    stack: "Stack",
    h: {
      profile: "Profile",
      experience: "Experience",
      projects: "Selected Projects",
      skills: "Skills",
      education: "Education & Certifications",
      languages: "Languages",
    },
  },
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const t = (v, lang) => (v && typeof v === "object" && "fr" in v ? v[lang] : v);
const sep = '<span class="sep">·</span>';
const noTrailingDot = (s) => s.replace(/\.\s*$/, "");

function month(ym, lang) {
  const [y, m] = ym.split("-");
  return m ? `${UI[lang].months[Number(m) - 1]} ${y}` : y;
}
const range = (start, end, lang) => `${month(start, lang)} – ${end ? month(end, lang) : UI[lang].present}`;
const yearRange = (start, end) => {
  const a = start.slice(0, 4);
  const b = (end || start).slice(0, 4);
  return a === b ? a : `${a} – ${b}`;
};

function yearsOfExperience() {
  const job = p.experience.find((e) => e.id === p.cv.yearsFrom);
  if (!job) throw new Error(`cv.yearsFrom: no experience with id "${p.cv.yearsFrom}"`);
  const [y, m] = job.start.split("-").map(Number);
  const now = new Date();
  return Math.floor((now.getFullYear() * 12 + now.getMonth() - (y * 12 + (m - 1))) / 12);
}

const link = (href, text) => `<a href="${esc(href)}">${esc(text)}</a>`;
const bareUrl = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

function experience(lang) {
  const ui = UI[lang];
  return p.experience
    .map((e) => {
      const keep = p.cv.bullets[e.id];
      const all = e.bullets[lang];
      const bullets = keep ? keep.map((i) => all[i]) : all.slice(0, 2);
      if (bullets.some((b) => b == null)) throw new Error(`cv.bullets.${e.id}: index out of range`);
      const client = e.client
        ? `\n  <p class="meta">${ui.client}${ui.colon} ${esc(t(e.client, lang))}</p>`
        : "";
      return `<article class="job">
  <div class="row">
    <h3>${esc(t(e.role, lang))} — <span class="org">${esc(e.company)}</span><span class="place">, ${esc(t(e.location, lang))}</span></h3>
    <span class="dates">${range(e.start, e.end, lang)}</span>
  </div>${client}
  <ul class="bullets">
${bullets.map((b) => `    <li>${esc(b)}</li>`).join("\n")}
  </ul>
</article>`;
    })
    .join("\n");
}

function projects(lang) {
  const ui = UI[lang];
  return p.cv.projects
    .map((slug) => {
      const pr = p.projects.find((x) => x.slug === slug);
      if (!pr) throw new Error(`cv.projects: no project with slug "${slug}"`);
      const sub = noTrailingDot(t(pr.context, lang) || t(pr.oneLiner, lang));
      return `<article class="project">
  <h3>${esc(t(pr.name, lang))} <span class="place">— ${esc(sub)}</span></h3>
  <p>${esc(t(pr.built, lang))}</p>
  <p><span class="label">${ui.stack}${ui.colon}</span> ${esc(pr.stack.join(", "))}</p>
</article>`;
    })
    .join("\n");
}

function skills(lang) {
  const ui = UI[lang];
  return p.skills
    .map(
      (g) =>
        `<li><span class="label">${esc(t(g.group, lang))}${ui.colon}</span> ${esc(g.items.map((i) => t(i, lang)).join(", "))}</li>`,
    )
    .join("\n          ");
}

function education(lang) {
  const rows = [
    ...p.education.map((e) => [t(e.degree, lang), t(e.school, lang), yearRange(e.start, e.end)]),
    ...p.certifications.map((c) => [c.name, c.issuer, yearRange(c.start, c.end)]),
  ];
  // Dates stay inline here: right-aligned dates on consecutive short rows are
  // read by text extractors (and ATS) as a separate column, cut from their row.
  return rows
    .map(
      ([what, where, when]) =>
        `<p class="edu"><span class="what">${esc(what)}</span> — ${esc(where)} ${sep} <span class="dates">${esc(when)}</span></p>`,
    )
    .join("\n");
}

function languages(lang) {
  const ui = UI[lang];
  return p.languages
    .map((l) => `<span class="label">${esc(t(l.name, lang))}${ui.colon}</span> ${esc(t(l.level, lang))}`)
    .join(` ${sep} `);
}

function fill(lang) {
  const id = p.identity;
  const ui = UI[lang];
  const values = {
    lang,
    name: esc(id.name),
    title: esc(t(id.title, lang)),
    docTitle: esc(`${id.name} – ${ui.docTitle} – ${t(id.title, lang)}`),
    contactLine1: [
      esc(t(id.location, lang)),
      link(`mailto:${id.email}`, id.email),
      link(`tel:${id.phoneE164}`, id.phone),
    ].join(` ${sep} `),
    contactLine2: [
      link(id.website, bareUrl(id.website)),
      link(id.linkedin, bareUrl(id.linkedin).replace(/^www\./, "")),
      link(id.github, bareUrl(id.github)),
    ].join(` ${sep} `),
    profile: esc(t(p.cv.profile, lang).replace("{years}", yearsOfExperience())),
    experience: experience(lang),
    projects: projects(lang),
    skills: skills(lang),
    education: education(lang),
    languages: languages(lang),
    ...Object.fromEntries(Object.entries(ui.h).map(([k, v]) => [`h.${k}`, esc(v)])),
  };
  const html = template.replace(/\{\{([\w.]+)\}\}/g, (m, key) => {
    if (!(key in values)) throw new Error(`template: unknown placeholder ${m}`);
    return values[key];
  });
  if (/\bTODO\b/.test(html)) throw new Error(`${lang}: the CV still contains a TODO`);
  return html;
}

const countPages = (pdf) => (pdf.toString("latin1").match(/\/Type\s*\/Page(?![a-z])/g) || []).length;

const buildDir = join(root, "cv", "build");
mkdirSync(buildDir, { recursive: true });
mkdirSync(dirname(OUTPUT.fr), { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const lang of ["fr", "en"]) {
    const htmlFile = join(buildDir, `cv-${lang}.html`);
    // The page sits next to cv.css so its relative links (CSS, fonts) resolve.
    writeFileSync(htmlFile, fill(lang).replace('href="cv.css"', 'href="../cv.css"'));
    await page.goto(pathToFileURL(htmlFile).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({
      path: OUTPUT[lang],
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
    });
    const pages = countPages(pdf);
    console.log(`✔ ${lang}: ${OUTPUT[lang].slice(root.length + 1)} (${pages} page${pages > 1 ? "s" : ""})`);
    if (pages > MAX_PAGES) {
      console.error(`✖ ${lang}: ${pages} pages, the CV must fit in ${MAX_PAGES}.`);
      process.exitCode = 1;
    }
  }
} finally {
  await browser.close();
}
