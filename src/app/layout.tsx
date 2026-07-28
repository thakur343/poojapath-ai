import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";
import OmCanvas from "@/components/OmCanvas";
import { AuthProvider } from "@/lib/firebase/AuthProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { Analytics } from "@/components/Analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const tiro = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: ["400"],
  variable: "--font-tiro",
  display: "swap",
});

// ─── SITE CONFIG ──────────────────────────────────────────────────────────────
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://poojapath.ai";
const siteName = "PoojaPath AI";
const siteDescription =
  "PoojaPath AI — India #1 AI-powered online pooja booking platform. Book certified pandit at home, get AI mantra guidance, free Janam Kundli, Digital Jaap counter & live temple darshan. Serving all cities in India. Starting ₹51 only.";

// ─── ROOT METADATA (used by every page unless overridden) ────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  // ── TITLE TEMPLATE ──────────────────────────────────────────────────────────
  title: {
    default: "PoojaPath AI — Book Pandit Online | Free Kundli | AI Mantra | Online Puja Booking India",
    template: `%s | PoojaPath AI — Online Pooja Booking`,
  },

  // ── DESCRIPTION ─────────────────────────────────────────────────────────────
  description: siteDescription,

  // ── KEYWORDS — targeting all competitor searches + high-volume terms ────────
  keywords: [
    // Brand & product terms
    "poojapath", "poojapath ai", "pooja path ai", "poojapath.ai",
    // Competitor overlap — same searches as poojapaath.in, pujapath.live etc
    "online pooja booking", "online puja booking", "book pandit online",
    "online pandit booking", "pandit booking app india", "puja booking india",
    "pujapath", "pooja paath online", "online hawan booking", "online katha booking",
    // High-volume Hindi searches
    "ऑनलाइन पूजा बुकिंग", "पंडित बुकिंग", "ऑनलाइन पंडित",
    "पूजा पाठ ऑनलाइन", "मंत्र जाप", "जन्म कुंडली",
    // Specific puja types
    "Satyanarayan pooja booking", "Griha Pravesh pandit", "Navratri pooja online",
    "Ganesh puja online", "Durga puja booking", "Shiv puja online",
    "Hanuman puja online", "Lakshmi puja booking", "online havan booking",
    "mundan ceremony pandit", "naamkaran pandit online", "vivah muhurat pandit",
    // Features — AI & Tech angle
    "AI pooja guidance", "AI mantra generator", "AI pandit chat",
    "free kundli online", "janam kundli free", "online kundli maker",
    "digital jaap counter", "mantra jaap counter online", "vedic astrology AI",
    "vastu shastra online", "bhagavad gita AI", "mantra audio online",
    // City-specific (high traffic)
    "pandit booking delhi", "pandit booking mumbai", "pandit booking bangalore",
    "pandit booking hyderabad", "pandit booking pune", "pandit booking jaipur",
    "pandit booking varanasi", "pandit booking ahmedabad", "pandit booking kolkata",
    // Long-tail high-intent
    "book pandit at home", "certified vedic pandit online", "pandit for pooja at home",
    "online temple darshan", "live aarti online", "virtual pooja india",
    "NRI pooja booking", "online pooja for NRI", "pooja abroad online",
  ],

  // ── AUTHORS & PUBLISHER ─────────────────────────────────────────────────────
  authors: [{ name: "PoojaPath AI", url: siteUrl }],
  creator: "PoojaPath AI",
  publisher: "PoojaPath AI",

  // ── CANONICAL & ALTERNATES ──────────────────────────────────────────────────
  alternates: {
    canonical: siteUrl,
    languages: {
      "en-IN": `${siteUrl}/en`,
      "hi-IN": `${siteUrl}/hi`,
      "x-default": siteUrl,
    },
  },

  // ── OPEN GRAPH ──────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "PoojaPath AI",
    title: "PoojaPath AI — Book Pandit Online | Free Kundli | AI Mantra Guidance",
    description: siteDescription,
    images: [
      {
        url: "/og/default.jpg",
        width: 1200,
        height: 630,
        alt: "PoojaPath AI — India's #1 AI-powered Online Pooja Booking Platform",
      },
    ],
  },

  // ── TWITTER / X ─────────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@poojapathai",
    creator: "@poojapathai",
    title: "PoojaPath AI — Book Pandit Online | Free Kundli | AI Mantra",
    description: siteDescription,
    images: ["/og/default.jpg"],
  },

  // ── ROBOTS ──────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── PWA / APP ────────────────────────────────────────────────────────────────
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: "/favicon.ico",
  },

  // ── APP-SPECIFIC (iOS Safari, Android) ──────────────────────────────────────
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PoojaPath AI",
  },

  // ── VERIFICATION ─────────────────────────────────────────────────────────────
  // Add your Google & Bing verification codes below after getting them
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
    other: {
      // Bing Webmaster Tools verification — get from bing.com/webmasters
      "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
      // Yandex verification
      "yandex-verification": process.env.YANDEX_SITE_VERIFICATION || "",
    },
  },

  // ── CATEGORY ─────────────────────────────────────────────────────────────────
  category: "religion & spirituality",
};

// ─── VIEWPORT ─────────────────────────────────────────────────────────────────
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF6B00" },
    { media: "(prefers-color-scheme: dark)", color: "#1a0a00" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable} ${tiro.variable}`}>
      <head>
        {/* ── PRECONNECT (performance) ───────────────────────────────── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ── JSON-LD STRUCTURED DATA ──────────────────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
        />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          <AuthProvider>
            <OmCanvas />
            {children}
          </AuthProvider>
        </LanguageProvider>
        {/* ── ANALYTICS (GA4 + Meta Pixel) ───────────────────── */}
        <Analytics />
        {/* ── VERCEL ANALYTICS ───────────────────────────────── */}
        <VercelAnalytics />
        {/* ── VERCEL SPEED INSIGHTS ─────────────────────────── */}
        <SpeedInsights />
      </body>
    </html>
  );
}

// ─── STRUCTURED DATA (JSON-LD) ────────────────────────────────────────────────
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description: siteDescription,
  sameAs: [
    "https://twitter.com/poojapathai",
    "https://instagram.com/poojapathai",
    "https://youtube.com/@poojapathai",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English", "Hindi"],
  },
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteName,
  applicationCategory: "ReligionApplication",
  operatingSystem: "Web, iOS, Android",
  offers: {
    "@type": "Offer",
    price: "51",
    priceCurrency: "INR",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "127",
  },
};
