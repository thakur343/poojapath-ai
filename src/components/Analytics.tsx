"use client";
// /src/components/seo/Analytics.tsx
// Drop this in your root layout ONCE — handles:
//   ✅ Google Analytics 4 (GA4)
//   ✅ Google Tag Manager (GTM)
//   ✅ Meta Pixel (Facebook/Instagram ads)
//   ✅ Custom event tracking helpers (export these and use anywhere)
//
// Set env vars in .env.local:
//   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
//   NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
//   NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXX

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

// ── TYPE DEFINITIONS ─────────────────────────────────────────────────────────
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
    fbq: (...args: unknown[]) => void;
  }
}

// ── PAGE VIEW TRACKER ────────────────────────────────────────────────────────
function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID) return;
    const url = pathname + (searchParams.toString() ? `?${searchParams}` : "");
    window.gtag?.("config", GA_ID, { page_path: url });
  }, [pathname, searchParams]);

  return null;
}

// ── ANALYTICS COMPONENT ──────────────────────────────────────────────────────
export function Analytics() {
  return (
    <>
      {/* ── GOOGLE TAG MANAGER ─────────────────────────────────────── */}
      {GTM_ID && (
        <>
          <Script
            id="gtm"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${GTM_ID}');
              `,
            }}
          />
          {/* GTM No-Script fallback */}
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {/* ── GOOGLE ANALYTICS 4 ─────────────────────────────────────── */}
      {GA_ID && !GTM_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script
            id="ga4"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure',
                });
              `,
            }}
          />
          <Suspense fallback={null}>
            <PageViewTracker />
          </Suspense>
        </>
      )}

      {/* ── META PIXEL ─────────────────────────────────────────────── */}
      {META_PIXEL_ID && (
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
    </>
  );
}

// ── CUSTOM EVENT HELPERS (use these anywhere in your app) ────────────────────

/** Track when user clicks "Book Now" */
export function trackBookingStart(poojaType: string, price: number) {
  window.gtag?.("event", "begin_checkout", {
    currency: "INR",
    value: price,
    items: [{ item_name: poojaType, item_category: "pooja" }],
  });
  window.fbq?.("track", "InitiateCheckout", { value: price, currency: "INR" });
}

/** Track successful booking/payment */
export function trackBookingComplete(opts: {
  bookingId: string;
  poojaType: string;
  panditName: string;
  price: number;
}) {
  window.gtag?.("event", "purchase", {
    transaction_id: opts.bookingId,
    value: opts.price,
    currency: "INR",
    items: [
      {
        item_id: opts.bookingId,
        item_name: opts.poojaType,
        item_category: "pooja",
        price: opts.price,
      },
    ],
  });
  window.fbq?.("track", "Purchase", { value: opts.price, currency: "INR" });

  // GTM dataLayer push
  window.dataLayer?.push({
    event: "booking_complete",
    booking_id: opts.bookingId,
    pooja_type: opts.poojaType,
    pandit_name: opts.panditName,
    revenue: opts.price,
  });
}

/** Track AI chat message sent */
export function trackAIChat(query: string) {
  window.gtag?.("event", "ai_chat_message", {
    event_category: "engagement",
    event_label: query.slice(0, 50),
  });
}

/** Track share button */
export function trackShare(method: "whatsapp" | "instagram" | "copy") {
  window.gtag?.("event", "share", {
    method,
    content_type: "pooja_booking",
  });
  window.fbq?.("track", "Lead");
}