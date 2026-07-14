// /src/app/api/og/route.tsx
// Dynamic Open Graph image generator — Next.js Edge Runtime
// Usage: /api/og?title=Satyanarayan+Pooja&subtitle=Book+now+from+₹501
//
// Generates a branded 1200×630 image on the fly — perfect for:
//   - Pooja category pages
//   - Blog posts (pooja knowledge base)
//   - Pandit profiles
//   - Booking confirmation shares

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get("title") ?? "Book Pandit Online";
  const subtitle =
    searchParams.get("subtitle") ?? "AI-Powered Pooja Platform";
  const type = searchParams.get("type") ?? "default"; // default | booking | blog | pandit

  const bgColor = type === "booking" ? "#1a0800" : "#0d0500";
  const accentColor = "#FF6B00";
  const goldColor = "#D4A843";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: bgColor,
          padding: "60px 72px",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* ── BACKGROUND PATTERN (decorative mandala lines) ──────────── */}
        <div
          style={{
            position: "absolute",
            right: "-40px",
            top: "-40px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            border: `2px solid ${accentColor}22`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: "20px",
            top: "20px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            border: `1px solid ${accentColor}33`,
            display: "flex",
          }}
        />

        {/* ── TOP BAR: LOGO + TYPE TAG ────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                backgroundColor: accentColor,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              🕉
            </div>
            <span style={{ color: "#fff", fontSize: "28px", fontWeight: "700", letterSpacing: "3px" }}>
              POOJAPATH
              <span style={{ color: accentColor }}>.AI</span>
            </span>
          </div>
          {type !== "default" && (
            <div
              style={{
                backgroundColor: `${accentColor}22`,
                border: `1px solid ${accentColor}55`,
                borderRadius: "50px",
                padding: "6px 18px",
                color: accentColor,
                fontSize: "14px",
                letterSpacing: "2px",
                display: "flex",
              }}
            >
              {type === "booking" ? "BOOK NOW" : type === "blog" ? "KNOWLEDGE" : "PANDIT"}
            </div>
          )}
        </div>

        {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "700px" }}>
          <div
            style={{
              color: goldColor,
              fontSize: "18px",
              letterSpacing: "4px",
              display: "flex",
            }}
          >
            ॥ श्री गणेशाय नमः ॥
          </div>
          <div
            style={{
              color: "#ffffff",
              fontSize: title.length > 40 ? "44px" : "56px",
              fontWeight: "700",
              lineHeight: "1.15",
              display: "flex",
            }}
          >
            {title}
          </div>
          <div style={{ color: "#ffffff99", fontSize: "24px", display: "flex" }}>
            {subtitle}
          </div>
        </div>

        {/* ── BOTTOM BAR ──────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
            borderTop: `1px solid ${accentColor}33`,
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", gap: "32px" }}>
            {["AI Panditji", "500+ Pandits", "₹51 onwards"].map((feat) => (
              <div key={feat} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: accentColor,
                    display: "flex",
                  }}
                />
                <span style={{ color: "#ffffff88", fontSize: "16px", display: "flex" }}>
                  {feat}
                </span>
              </div>
            ))}
          </div>
          <div style={{ color: "#ffffff55", fontSize: "16px", display: "flex" }}>
            poojapath.ai
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
