#!/usr/bin/env node
// Writes the content of content/profile.json into the 4 static pages.
//   node scripts/apply-profile.mjs
// Each generated block sits between <!-- profile:NAME --> and <!-- /profile:NAME -->.
// Edit the JSON, not the HTML inside those markers: it is overwritten on every run.
// Then run `npm run build:css` if new Tailwind classes appear.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = JSON.parse(readFileSync(join(root, "content", "profile.json"), "utf8"));

const UI = {
  fr: {
    present: "aujourd'hui",
    months: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
    client: "Client",
    problem: "Problème",
    built: "Ce que j'ai construit",
    role: "Mon rôle",
    result: "Résultat",
    context: "Contexte",
    askEmail: "Demander par email",
    contact: "Me contacter",
    contactHref: "index.html#contact",
    emailSubject: "Demande de devis",
  },
  en: {
    present: "present",
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    client: "Client",
    problem: "Problem",
    built: "What I built",
    role: "My role",
    result: "Result",
    context: "Context",
    askEmail: "Ask by email",
    contact: "Contact me",
    contactHref: "index-en.html#contact",
    emailSubject: "Project request",
  },
};

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const t = (v, lang) => (v && typeof v === "object" && "fr" in v ? v[lang] : v);
const filled = (v, lang) => {
  const s = t(v, lang);
  return s != null && s !== "" && !/\bTODO\b/.test(String(s));
};
const ind = (n, s) => s.split("\n").map((l) => (l ? " ".repeat(n) + l : l)).join("\n");

function month(ym, lang) {
  const [y, m] = ym.split("-");
  return m ? `${UI[lang].months[Number(m) - 1]} ${y}` : y;
}
const range = (start, end, lang) =>
  `${month(start, lang)} – ${end ? month(end, lang) : UI[lang].present}`;
const yearRange = (start, end, lang) =>
  `${start.slice(0, 4)} – ${end ? end.slice(0, 4) : UI[lang].present}`;

const TAG = "px-3 py-1 rounded-full text-sm bg-cyan-500/10 text-cyan-200 border border-cyan-500/30";
const SMALL_TAG = "px-2 py-0.5 rounded-full text-xs bg-gray-700 text-gray-200";

// ---------- blocks ----------

function meta(page, lang) {
  const seo = p.seo[page];
  const keywords = [p.identity.name, t(p.identity.title, lang), ...p.skills.flatMap((g) => g.items.map((i) => t(i, lang)))]
    .slice(0, 16)
    .join(", ");
  return [
    `<title>${esc(t(seo.title, lang))}</title>`,
    `<meta name="description" content="${esc(t(seo.description, lang))}" />`,
    `<meta name="keywords" content="${esc(keywords)}" />`,
    `<meta property="og:title" content="${esc(t(seo.title, lang))}" />`,
    `<meta property="og:description" content="${esc(t(seo.description, lang))}" />`,
  ].join("\n");
}

function jsonLd(lang) {
  const current = p.experience.find((e) => !e.end);
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.identity.name,
    jobTitle: t(p.identity.title, lang),
    url: p.identity.website,
    image: `${p.identity.website}/assets/images/mehdi-960.webp`,
    description: t(p.subline, lang),
    sameAs: [p.identity.linkedin, p.identity.github],
    worksFor: current ? { "@type": "Organization", name: current.company } : undefined,
    knowsAbout: p.skills.flatMap((g) => g.items.map((i) => t(i, lang))),
    address: { "@type": "PostalAddress", addressLocality: "Tunis", addressCountry: "TN" },
    email: p.identity.email,
    telephone: p.identity.phoneE164,
  };
  return `<script type="application/ld+json">\n${ind(2, JSON.stringify(data, null, 2))}\n</script>`;
}

function hero(lang, headline, subline, big) {
  const h1 = big
    ? "text-4xl sm:text-5xl md:text-7xl font-bold leading-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent max-w-5xl mx-auto"
    : "text-4xl md:text-6xl font-bold leading-tight mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent max-w-4xl mx-auto";
  const sub = big ? "text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto" : "text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12";
  return [
    `<h1 class="${h1}">`,
    `  ${esc(t(headline, lang))}`,
    `</h1>`,
    `<p class="${sub}">`,
    `  ${esc(t(subline, lang))}`,
    `</p>`,
  ].join("\n");
}

function timeline(lang) {
  return p.experience
    .map((e) => {
      const lines = [
        `<div class="timeline-item" data-year="${esc(yearRange(e.start, e.end, lang))}">`,
        `  <div class="timeline-content text-left">`,
        `    <h3 class="text-xl font-bold">${esc(e.company)}</h3>`,
        `    <p class="text-cyan-400 font-medium">${esc(t(e.role, lang))}</p>`,
        `    <p class="text-sm text-gray-400 mb-3">${esc(range(e.start, e.end, lang))} · ${esc(t(e.location, lang))}</p>`,
      ];
      const colon = lang === "fr" ? " :" : ":";
      if (e.client) lines.push(`    <p class="text-sm text-gray-300 mb-2">${UI[lang].client}${colon} ${esc(t(e.client, lang))}</p>`);
      lines.push(`    <ul class="list-disc pl-5 space-y-1 text-sm text-gray-300">`);
      for (const b of t(e.bullets, lang)) lines.push(`      <li>${esc(b)}</li>`);
      lines.push(`    </ul>`, `  </div>`, `</div>`);
      return lines.join("\n");
    })
    .join("\n");
}

function projects(lang) {
  const cards = p.projects.map((pr) => {
    const rows = ["context", "problem", "built", "role", "result"]
      .filter((k) => filled(pr[k], lang))
      .map(
        (k) =>
          `    <div>\n      <dt class="font-semibold text-gray-100">${UI[lang][k]}</dt>\n      <dd>${esc(t(pr[k], lang))}</dd>\n    </div>`
      );
    const stack = pr.stack.map((s) => `    <li class="${SMALL_TAG}">${esc(s)}</li>`).join("\n");
    const link = pr.link
      ? `\n  <a href="${esc(pr.link)}" class="mt-4 text-cyan-400 hover:text-cyan-300" target="_blank" rel="noopener noreferrer">${esc(pr.link)}</a>`
      : "";
    return [
      `<article class="bg-gray-800/60 border border-gray-700 rounded-xl p-6 flex flex-col">`,
      `  <h3 class="text-xl font-bold text-white mb-1">${esc(t(pr.name, lang))}</h3>`,
      `  <p class="text-cyan-400 text-sm mb-4">${esc(t(pr.oneLiner, lang))}</p>`,
      `  <dl class="space-y-3 text-sm text-gray-300 mb-4">`,
      ...rows,
      `  </dl>`,
      `  <ul class="mt-auto flex flex-wrap gap-2">`,
      stack,
      `  </ul>${link}`,
      `</article>`,
    ].join("\n");
  });
  return `<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">\n${ind(2, cards.join("\n"))}\n</div>`;
}

function skills(lang) {
  const groups = p.skills.map((g) =>
    [
      `<div class="bg-gray-800/60 border border-gray-700 rounded-xl p-6">`,
      `  <h3 class="text-lg font-semibold text-cyan-400 mb-4">${esc(t(g.group, lang))}</h3>`,
      `  <ul class="flex flex-wrap gap-2">`,
      ...g.items.map((i) => `    <li class="${TAG}">${esc(t(i, lang))}</li>`),
      `  </ul>`,
      `</div>`,
    ].join("\n")
  );
  return `<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">\n${ind(2, groups.join("\n"))}\n</div>`;
}

function about(lang) {
  return t(p.about, lang)
    .map((line) => `<p class="mb-4">${esc(line)}</p>`)
    .join("\n");
}

function social() {
  const link = (href, label, icon) =>
    [
      `<a`,
      `  href="${esc(href)}"`,
      `  target="_blank" rel="noopener noreferrer"`,
      `  class="text-gray-300 hover:text-cyan-400 transition-colors p-2"`,
      `  aria-label="${label}"`,
      `>`,
      `  <i class="fab ${icon} text-2xl"></i>`,
      `</a>`,
    ].join("\n");
  return [link(p.identity.linkedin, "LinkedIn", "fa-linkedin"), link(p.identity.github, "GitHub", "fa-github")].join("\n");
}

function serviceCards(lang) {
  const ui = UI[lang];
  const mail = `mailto:${p.identity.email}?subject=${encodeURIComponent(ui.emailSubject)}`;
  const cards = p.services.map((s) =>
    [
      `<div class="service-card group">`,
      `  <div class="h-full p-8 bg-gray-800 rounded-lg shadow-xl transition-all duration-300 hover:shadow-cyan-500/20 hover:translate-y-[-5px] flex flex-col">`,
      `    <div class="flex items-center mb-6">`,
      `      <div class="w-12 h-12 shrink-0 bg-cyan-500/20 rounded-lg flex items-center justify-center mr-4">`,
      `        <i class="fas ${esc(s.icon)} text-2xl text-cyan-400" aria-hidden="true"></i>`,
      `      </div>`,
      `      <h2 class="text-2xl font-bold text-white">${esc(t(s.title, lang))}</h2>`,
      `    </div>`,
      `    <p class="text-gray-300 mb-6">${esc(t(s.description, lang))}</p>`,
      `    <ul class="space-y-2 mb-6">`,
      ...t(s.points, lang).map(
        (pt) => `      <li class="flex items-start"><i class="fas fa-check text-cyan-400 mr-2 mt-1" aria-hidden="true"></i><span>${esc(pt)}</span></li>`
      ),
      `    </ul>`,
      `    <p class="text-sm text-gray-400 italic mb-6">${esc(t(s.example, lang))}</p>`,
      `    <div class="mt-auto flex flex-col gap-3">`,
      `      <span class="text-xl font-bold text-cyan-400">${esc(t(p.servicesPage.pricing, lang))}</span>`,
      `      <a href="${esc(mail)}" class="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg transition-colors text-center">${ui.askEmail}</a>`,
      `      <a href="${ui.contactHref}" class="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg transition-colors text-center">${ui.contact}</a>`,
      `    </div>`,
      `  </div>`,
      `</div>`,
    ].join("\n")
  );
  return `<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">\n${ind(2, cards.join("\n"))}\n</div>`;
}

function processSteps(lang) {
  return p.servicesPage.process
    .map((step, i) => {
      const side =
        i % 2 === 0
          ? "md:ml-0 md:mr-[calc(50%+2rem)] md:pr-8 md:text-right"
          : "md:mr-0 md:ml-[calc(50%+2rem)] md:pl-8";
      return [
        `<div class="relative">`,
        `  <div class="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">`,
        `    <span class="text-white font-bold">${i + 1}</span>`,
        `  </div>`,
        `  <div class="ml-auto mr-auto ${side} w-full md:w-[calc(50%-2rem)]">`,
        `    <h3 class="text-2xl font-bold text-white mb-2">${esc(t(step.title, lang))}</h3>`,
        `    <p class="text-gray-300">${esc(t(step.text, lang))}</p>`,
        `  </div>`,
        `</div>`,
      ].join("\n");
    })
    .join("\n");
}

// ---------- apply ----------

const PAGES = {
  "index.html": { lang: "fr", kind: "index" },
  "index-en.html": { lang: "en", kind: "index" },
  "services.html": { lang: "fr", kind: "services" },
  "services-en.html": { lang: "en", kind: "services" },
};

function blocksFor(kind, lang) {
  if (kind === "index") {
    return {
      meta: meta("index", lang),
      jsonld: jsonLd(lang),
      hero: hero(lang, p.headline, p.subline, true),
      timeline: timeline(lang),
      projects: projects(lang),
      skills: skills(lang),
      about: about(lang),
      social: social(),
    };
  }
  return {
    meta: meta("services", lang),
    hero: hero(lang, p.servicesPage.headline, p.servicesPage.subline, false),
    services: serviceCards(lang),
    process: processSteps(lang),
    social: social(),
  };
}

let failed = false;
for (const [file, { lang, kind }] of Object.entries(PAGES)) {
  const path = join(root, file);
  const raw = readFileSync(path, "utf8");
  const crlf = raw.includes("\r\n");
  let html = raw.replace(/\r\n/g, "\n");
  for (const [name, content] of Object.entries(blocksFor(kind, lang))) {
    const re = new RegExp(`([ \\t]*)<!-- profile:${name} -->[\\s\\S]*?<!-- /profile:${name} -->`);
    const m = html.match(re);
    if (!m) {
      console.error(`✖ ${file}: marker <!-- profile:${name} --> not found`);
      failed = true;
      continue;
    }
    const pad = m[1];
    const body = content
      .split("\n")
      .map((l) => (l ? pad + l : l))
      .join("\n");
    html = html.replace(re, () => `${pad}<!-- profile:${name} -->\n${body}\n${pad}<!-- /profile:${name} -->`);
  }
  writeFileSync(path, crlf ? html.replace(/\n/g, "\r\n") : html);
  console.log(`✔ ${file}`);
}
process.exitCode = failed ? 1 : 0;
