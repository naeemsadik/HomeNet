import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DOMAIN = "https://www.homenetbd.com";
const API_URL = (process.env.EXPO_PUBLIC_API_BASE_URL || "https://api.homenetbd.com").replace(/\/$/, "");

// Core static pages with priority and change frequency
const STATIC_ROUTES = [
  { path: "", priority: "1.0", changefreq: "daily" },
  { path: "/buy", priority: "0.9", changefreq: "daily" },
  { path: "/rent", priority: "0.9", changefreq: "daily" },
  { path: "/sold", priority: "0.7", changefreq: "weekly" },
  { path: "/explore", priority: "0.8", changefreq: "daily" },
  { path: "/sell", priority: "0.8", changefreq: "weekly" },
  { path: "/market", priority: "0.7", changefreq: "weekly" },
  { path: "/ai-finder", priority: "0.7", changefreq: "weekly" },
  { path: "/guides", priority: "0.8", changefreq: "weekly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/privacy", priority: "0.4", changefreq: "monthly" },
  { path: "/terms", priority: "0.4", changefreq: "monthly" },
];

function formatDate(dateString) {
  try {
    const d = dateString ? new Date(dateString) : new Date();
    return d.toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

// Extract guide slugs from curatedGuides.ts
function getCuratedGuides() {
  try {
    const filePath = resolve(ROOT, "src/content/curatedGuides.ts");
    const content = readFileSync(filePath, "utf8");
    const guideMatches = [...content.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
    return [...new Set(guideMatches)];
  } catch (err) {
    console.warn("Could not read curatedGuides.ts:", err.message);
    return [
      "namzari-mutation-bangladesh-guide",
      "how-to-verify-khatian-cs-sa-rs-bs",
      "dhaka-flat-registration-costs-breakdown",
      "understanding-katha-bigha-decimal-sqft",
      "dhaka-apartment-buyer-inspection-checklist",
      "direct-listing-saves-broker-commission-dhaka",
    ];
  }
}

// Fetch all live properties from API with pagination
async function getLiveProperties() {
  const allProperties = [];
  let page = 1;
  const limit = 100;

  try {
    while (true) {
      const res = await fetch(`${API_URL}/v1/properties?page=${page}&limit=${limit}`);
      if (!res.ok) {
        console.warn(`API returned HTTP ${res.status} on page ${page}`);
        break;
      }
      const json = await res.json();
      const items = json.data?.items || [];
      for (const item of items) {
        allProperties.push({
          id: item.id,
          updatedAt: item.updated_at || item.created_at,
        });
      }
      const total = json.data?.total || items.length;
      if (allProperties.length >= total || items.length === 0) {
        break;
      }
      page++;
    }
    return allProperties;
  } catch (err) {
    console.warn("Could not fetch live properties from API:", err.message);
    return allProperties;
  }
}

async function buildSitemap() {
  const today = formatDate();
  const guides = getCuratedGuides();
  const properties = await getLiveProperties();

  console.log(`Generating sitemap with:`);
  console.log(`- ${STATIC_ROUTES.length} static routes`);
  console.log(`- ${guides.length} guides`);
  console.log(`- ${properties.length} live properties from ${API_URL}`);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n`;
  xml += `        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9\n`;
  xml += `        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">\n`;

  // Static routes
  for (const route of STATIC_ROUTES) {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}${route.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += `  </url>\n`;
  }

  // Guide pages
  for (const slug of guides) {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/guides/${slug}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  // Property detail pages
  for (const prop of properties) {
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/property/${encodeURIComponent(prop.id)}</loc>\n`;
    xml += `    <lastmod>${formatDate(prop.updatedAt)}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += `</urlset>\n`;

  const publicSitemapPath = resolve(ROOT, "public/sitemap.xml");
  writeFileSync(publicSitemapPath, xml, "utf8");
  console.log(`Wrote ${publicSitemapPath}`);

  // Also write to dist/sitemap.xml if dist exists
  const distDir = resolve(ROOT, "dist");
  if (existsSync(distDir)) {
    writeFileSync(resolve(distDir, "sitemap.xml"), xml, "utf8");
    console.log(`Wrote ${resolve(distDir, "sitemap.xml")}`);
  }

  // Create robots.txt
  const robotsTxt = `# HomeNet Robots Configuration
User-agent: *
Allow: /

# Private & User Account Routes
Disallow: /admin
Disallow: /admin/*
Disallow: /seller
Disallow: /seller/*
Disallow: /dashboard
Disallow: /my-properties
Disallow: /profile
Disallow: /profile/*
Disallow: /settings
Disallow: /notifications
Disallow: /saved
Disallow: /delete-account
Disallow: /verification

# Sitemap
Sitemap: ${DOMAIN}/sitemap.xml
`;

  const publicRobotsPath = resolve(ROOT, "public/robots.txt");
  writeFileSync(publicRobotsPath, robotsTxt, "utf8");
  console.log(`Wrote ${publicRobotsPath}`);

  if (existsSync(distDir)) {
    writeFileSync(resolve(distDir, "robots.txt"), robotsTxt, "utf8");
    console.log(`Wrote ${resolve(distDir, "robots.txt")}`);
  }

  return xml;
}

buildSitemap().catch((err) => {
  console.error("Failed to generate sitemap:", err);
  process.exit(1);
});
