import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poojapath.ai';
  return {
    rules: [
      {
        // All crawlers — allow everything except API/admin
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/auth/'],
      },
      {
        // Google — full access for maximum indexing
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        // Bingbot — full access so Bing indexes poojapath.ai
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        // DuckDuckGo crawler
        userAgent: 'DuckDuckBot',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
