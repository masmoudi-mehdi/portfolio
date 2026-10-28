// Keeps /sitemap.xml (the URL already given to Google Search Console) working:
// it now points to the sitemap that @astrojs/sitemap writes at build time.
import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const loc = new URL("/sitemap-0.xml", site).href;
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${loc}</loc></sitemap></sitemapindex>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
