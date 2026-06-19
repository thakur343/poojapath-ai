import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://poojapath.ai";
const SITE_NAME = "PoojaPath AI";

interface MetadataProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
}

/**
 * Generate standard, highly-optimized SEO metadata for Next.js pages.
 */
export function getPageMetadata({
  title,
  description,
  path,
  ogImage = "/og/default.jpg",
  noIndex = false,
}: MetadataProps): Metadata {
  const canonicalUrl = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`],
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}

/**
 * Generate Organization schema markup.
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: "AI-powered Hindu pooja guidance and Vedic astrology platform.",
    sameAs: [
      "https://twitter.com/poojapathai",
      "https://instagram.com/poojapathai",
      "https://youtube.com/@poojapathai",
    ],
  };
}

/**
 * Generate Breadcrumb schema markup.
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Generate Product schema with ratings for reports.
 */
export function getProductSchema(name: string, price: number, description: string, ratingValue = 4.9, reviewCount = 127) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: `${SITE_URL}/og/default.jpg`,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
    },
  };
}

/**
 * Generate FAQ schema markup.
 */
export function getFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
