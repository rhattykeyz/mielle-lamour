/**
 * Writes static HTML shells with unique titles/descriptions for public routes.
 * Hostinger can serve these files directly, which is stronger for SEO than a
 * single empty SPA shell. The same JS bundle still hydrates each page.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const dist = join(process.cwd(), "dist");
const template = readFileSync(join(dist, "index.html"), "utf8");

const pages = [
  {
    path: "",
    title: "Mielle L'Amour | Nail, Beauty & Spa in Accra",
    description:
      "Mielle L'Amour is a nail, beauty and spa salon in Accra, Ghana. Book manicures, pedicures, facials, massages and bridal packages online.",
  },
  {
    path: "services",
    title: "Services & Prices | Mielle L'Amour",
    description:
      "Browse nail, beauty and spa services at Mielle L'Amour in Accra. Durations, prices and online booking.",
  },
  {
    path: "gallery",
    title: "Gallery | Mielle L'Amour",
    description: "A look at nail art, beauty and spa work from Mielle L'Amour in Accra.",
  },
  {
    path: "about",
    title: "About & Team | Mielle L'Amour",
    description: "The story and team behind Mielle L'Amour, a floral luxury salon in Accra.",
  },
  {
    path: "book",
    title: "Book an appointment | Mielle L'Amour",
    description: "Choose a service, stylist and time. Pay in person at the salon in Accra.",
  },
  {
    path: "contact",
    title: "Contact | Mielle L'Amour",
    description: "Find Mielle L'Amour in Accra. Hours, map, WhatsApp and contact form.",
  },
  {
    path: "privacy",
    title: "Privacy notice | Mielle L'Amour",
    description: "How Mielle L'Amour collects and uses booking information.",
  },
  {
    path: "cancellation",
    title: "Cancellation policy | Mielle L'Amour",
    description: "Please cancel or reschedule at least 24 hours before your appointment.",
  },
];

function inject(html, { title, description, canonical }) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`)
    .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${title}" />`)
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
      `<meta property="og:description" content="${description}" />`,
    );
}

const site = process.env.VITE_SITE_URL || "https://example.com";

for (const page of pages) {
  const canonical = `${site.replace(/\/$/, "")}/${page.path}`;
  const html = inject(template, { ...page, canonical });
  if (!page.path) {
    writeFileSync(join(dist, "index.html"), html);
    continue;
  }
  const file = join(dist, page.path, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const urls = pages
  .map((p) => `  <url><loc>${site.replace(/\/$/, "")}/${p.path}</loc><changefreq>weekly</changefreq></url>`)
  .join("\n");

writeFileSync(
  join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

copyFileSync(join(dist, "favicon.svg"), join(dist, "favicon.svg"));
console.log(`Prerendered ${pages.length} HTML shells and sitemap.xml`);
