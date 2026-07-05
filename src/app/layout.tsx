import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";
import OmCanvas from "@/components/OmCanvas";
import { AuthProvider } from "@/lib/firebase/AuthProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

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
  "AI-powered Hindu pooja booking platform. Book a pandit, get personalised mantra guidance from Panditji AI, and perform sacred rituals from anywhere in India.";

// ─── ROOT METADATA (used by every page unless overridden) ────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  // ── TITLE TEMPLATE ─────────────────────────────────────────────────────────
  title: {
    default: `${siteName} — Book Pandit Online | AI Pooja Guidance`,
    template: `%s | ${siteName}`,
  },

  // ── DESCRIPTION ────────────────────────────────────────────────────────────
  description: siteDescription,

  // ── KEYWORDS (long-tail + trending spiritual + AI angle) ───────────────────
  keywords: [
    "book pandit online",
    "online pooja booking",
    "AI pooja guidance",
    "Hindu rituals online",
    "pandit at home",
    "pooja path AI",
    "puja booking app India",
    "online katha booking",
    "Satyanarayan pooja booking",
    "Griha pravesh pandit",
    "Navratri pooja online",
    "AI spiritual guidance",
    "mantra guidance AI",
    "Hindu festival rituals",
    "online havan booking",
    "panditji AI chat",
    "sacred rituals app",
    "pooja samagri online",
    "vedic astrology AI",
    "virtual pooja India",
  ],

  // ── AUTHORS & PUBLISHER ────────────────────────────────────────────────────
  authors: [{ name: "PoojaPath AI", url: siteUrl }],
  creator: "PoojaPath AI",
  publisher: "PoojaPath AI",

  // ── CANONICAL & ALTERNATES ─────────────────────────────────────────────────
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/en",
      "hi-IN": "/hi",
    },
  },

  // ── OPEN GRAPH ─────────────────────────────────────────────────────────────
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName,
    title: `${siteName} — Book Pandit Online | AI Pooja Guidance`,
    description: siteDescription,
    images: [
      {
        url: "/og/default.jpg",   // 1200×630 — generate with /api/og
        width: 1200,
        height: 630,
        alt: "PoojaPath AI — Sacred rituals, simplified by AI",
      },
    ],
  },

  // ── TWITTER / X ────────────────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@poojapathai",
    creator: "@poojapathai",
    title: `${siteName} — Book Pandit Online | AI Pooja Guidance`,
    description: siteDescription,
    images: ["/og/default.jpg"],
  },

  // ── ROBOTS ─────────────────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── PWA / APP ───────────────────────────────────────────────────────────────
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

  // ── APP-SPECIFIC (iOS Safari, Android) ─────────────────────────────────────
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteName,
  },

  // ── VERIFICATION (add your real codes here) ────────────────────────────────
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "",
    // bing: "...",
  },

  // ── CATEGORY ───────────────────────────────────────────────────────────────
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
        {/* ── PRECONNECT (performance) ─────────────────────────────────── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* ── JSON-LD STRUCTURED DATA ───────────────────────────────────── */}
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