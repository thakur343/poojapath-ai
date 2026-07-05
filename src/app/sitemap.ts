import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://poojapath.ai";

  const deities = ['krishna','shiva','rama','hanuman','ganesha','durga','lakshmi','saraswati','kali','vishnu','brahma','surya','chandra','kartik','ayyappa'];
  const mantras = ['om-namah-shivaya','gayatri-mantra','mahamrityunjaya-mantra','hanuman-chalisa','vishnu-sahasranama','lalita-sahasranama','durga-chalisa','aarti-sangrah','shiv-tandav-stotram','ram-raksha-stotra'];
  const rashis = ['mesh','vrishabh','mithun','kark','singh','kanya','tula','vrischik','dhanu','makar','kumbh','meen'];
  const blogs = [
    'hanuman-chalisa-benefits-hindi',
    'om-namah-shivaya-meaning-hindi',
    'kundli-online-free-kaise-banaye',
    'krishna-aarti-lyrics-meaning',
    'pooja-vidhi-in-hindi-complete-guide',
    'vastu-shastra-tips-for-home',
    'gayatri-mantra-power-benefits',
    'navratri-pooja-vidhi-2026',
    'diwali-puja-samagri-list',
    'saturday-hanuman-puja-vidhi',
    'monday-shiv-puja-vidhi',
    'mangal-dosh-remedies-astrology',
    'best-time-for-morning-pooja',
    'how-to-do-rudra-abhishek',
    'mahamrityunjaya-mantra-108-times-benefits',
  ];
  const staticPages = [
    { path: '', priority: 1.0, freq: 'daily' as const },
    { path: '/kundli', priority: 0.95, freq: 'daily' as const },
    { path: '/jaap', priority: 0.9, freq: 'daily' as const },
    { path: '/vastu', priority: 0.85, freq: 'weekly' as const },
    { path: '/wallpapers', priority: 0.8, freq: 'daily' as const },
    { path: '/pandit', priority: 0.9, freq: 'weekly' as const },
    { path: '/gita', priority: 0.85, freq: 'weekly' as const },
    { path: '/blog', priority: 0.9, freq: 'daily' as const },
    { path: '/mantra', priority: 0.85, freq: 'weekly' as const },
    { path: '/referral', priority: 0.7, freq: 'monthly' as const },
    { path: '/about', priority: 0.6, freq: 'monthly' as const },
    { path: '/contact', priority: 0.6, freq: 'monthly' as const },
    { path: '/privacy', priority: 0.4, freq: 'yearly' as const },
    { path: '/terms', priority: 0.4, freq: 'yearly' as const },
    { path: '/refund', priority: 0.4, freq: 'yearly' as const },
  ];

  return [
    ...staticPages.map(p => ({
      url: `${siteUrl}${p.path}`,
      lastModified: new Date().toISOString(),
      changeFrequency: p.freq,
      priority: p.priority,
    })),
    ...deities.map(d => ({
      url: `${siteUrl}/deity/${d}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...mantras.map(m => ({
      url: `${siteUrl}/mantra/${m}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...rashis.map(r => ({
      url: `${siteUrl}/rashi/${r}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.75,
    })),
    ...blogs.map(b => ({
      url: `${siteUrl}/blog/${b}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
