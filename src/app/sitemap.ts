import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://poojapath.ai";

  const paths = [
    "",
    "/kundli",
    "/jaap",
    "/matching",
    "/horoscope",
    "/blog",
    "/nakshatra-guide",
    "/zodiac-guide",
    "/dasha-calculator",
    "/contact",
    "/about",
  ];

  return paths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1.0 : 0.8,
  }));
}
