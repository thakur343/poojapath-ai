import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://poojapath.ai";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/kundli", "/jaap", "/matching", "/horoscope", "/blog"],
      disallow: ["/api/", "/dashboard/", "/payment-success", "/admin/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
