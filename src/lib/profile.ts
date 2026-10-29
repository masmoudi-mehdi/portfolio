// Single entry point to content/profile.json. Every visible text of the site
// comes from that file; this module only adds routing and formatting helpers.
import profile from "../../content/profile.json";

export const p = profile;
export const ui = profile.site;

export type Lang = "fr" | "en";
export const LANGS: Lang[] = ["fr", "en"];

type Localized<T> = { fr: T; en: T };

/** Picks the right language from a { fr, en } value; plain values pass through. */
export function t<T>(value: Localized<T> | T, lang: Lang): T {
  if (value && typeof value === "object" && "fr" in value && "en" in value) {
    return (value as Localized<T>)[lang];
  }
  return value as T;
}

export type PageKey = "home" | "services";

export const ROUTES: Record<PageKey, Record<Lang, string>> = {
  home: { fr: "/", en: "/en/" },
  services: { fr: "/services", en: "/en/services" },
};

export const CV_URL: Record<Lang, string> = {
  fr: "/assets/cv/cv-francais.pdf",
  en: "/assets/cv/cv-anglais.pdf",
};

export const CV_DOWNLOAD_NAME: Record<Lang, string> = {
  fr: "CV-Mehdi-Masmoudi-FR.pdf",
  en: "CV-Mehdi-Masmoudi-EN.pdf",
};

export const projectHref = (slug: string, lang: Lang): string =>
  lang === "fr" ? `/projets/${slug}` : `/en/projects/${slug}`;

export const FORMSPREE_URL = "https://formspree.io/f/mnnjqokj";

export const otherLang = (lang: Lang): Lang => (lang === "fr" ? "en" : "fr");

/** "2025-03" -> "mars 2025" / "Mar 2025". */
export function formatMonth(ym: string, lang: Lang): string {
  const [year, month] = ym.split("-").map(Number);
  const date = new Date(Date.UTC(year, (month ?? 1) - 1, 1));
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatRange(start: string, end: string | null, lang: Lang): string {
  const to = end ? formatMonth(end, lang) : t(ui.experience.present, lang);
  return `${formatMonth(start, lang)} – ${to}`;
}

/** Link from a page to a section of the home page, in the right language. */
export function sectionHref(page: PageKey, lang: Lang, id: string): string {
  return page === "home" ? `#${id}` : `${ROUTES.home[lang]}#${id}`;
}
