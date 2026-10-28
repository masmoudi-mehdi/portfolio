// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

const SITE = "https://www.mehdimasmoudi.com";

// Old URLs of the hand-written site. Each redirect is written as <name>.html,
// and GitHub Pages serves that file at both /<name> and /<name>.html.
// /index.html and /services.html need no entry: the new build writes those
// exact files, so they keep working.
const redirects = {
  "/index-en": "/en/",
  "/services-en": "/en/services",
};

export default defineConfig({
  site: SITE,
  // "preserve" maps src/pages/services.astro to services.html (served at
  // /services, like the old site) and src/pages/en/index.astro to en/index.html.
  build: { format: "preserve" },
  trailingSlash: "ignore",
  redirects,
  integrations: [
    sitemap({
      i18n: { defaultLocale: "fr", locales: { fr: "fr", en: "en" } },
      filter: (page) => !/\/404|index-en|services-en/.test(page),
      // The EN home lives at /en/ (a folder): list it with its final slash,
      // like the canonical link, so Google does not see a redirect.
      serialize(item) {
        const fix = (url) => url.replace(/\/en$/, "/en/");
        item.url = fix(item.url);
        item.links = item.links?.map((l) => ({ ...l, url: fix(l.url) }));
        return item;
      },
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
