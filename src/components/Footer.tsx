import React from "react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: "linear-gradient(180deg, #0d0501 0%, #060302 100%)",
      borderTop: "1px solid rgba(242, 201, 110, 0.15)",
      padding: "64px 24px 32px",
      position: "relative",
      zIndex: 10,
      color: "#FDF0DC",
      fontFamily: "var(--font-sans), sans-serif"
    }}>
      {/* Dynamic Gold Sparkle Accent Top border */}
      <div style={{
        position: "absolute", top: 0, left: "10%", right: "10%", height: "1px",
        background: "linear-gradient(90deg, transparent, #F2C96E, transparent)",
        opacity: 0.8
      }} />

      <div style={{
        maxWidth: "1100px", margin: "0 auto",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "48px 32px", marginBottom: "48px"
      }}>
        
        {/* Column 1: Brand & Spiritual Identity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="om-pulse-slow" style={{ fontSize: "28px", display: "inline-block" }}>🕉️</span>
            <span className="gold-text-shimmer" style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "0.05em", fontFamily: "var(--font-cormorant), serif" }}>
              PoojaPath AI
            </span>
          </div>
          <p style={{ color: "rgba(253, 240, 220, 0.65)", fontSize: "13px", lineHeight: 1.7, margin: 0 }}>
            Bringing the ancient, sacred wisdom of Kashi together with Silicon Valley precision. Let AI elevate your daily spiritual sadhana.
          </p>
          <div style={{
            fontSize: "12px", fontStyle: "italic", color: "#F2C96E",
            borderLeft: "2px solid #E8600A", paddingLeft: "12px", marginTop: "8px"
          }}>
            “सर्वे भवन्तु सुखिनः, सर्वे सन्तु निरामयाः”
          </div>
        </div>

        {/* Column 2: Sacred Navigation */}
        <div>
          <h4 style={{ color: "#F2C96E", fontSize: "14px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>
            Sacred Services
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "📜 Janam Kundli", href: "/kundli" },
              { label: "📿 Digital Jaap Counter", href: "/jaap" },
              { label: "🧭 Vastu Shastra Scanner", href: "/vastu" },
              { label: "📱 Shloka Card Creator", href: "/shloka" },
              { label: "🖼️ AI Deity Wallpapers", href: "/wallpapers" },
              { label: "📖 Bhagavad Gita AI", href: "/gita" }
            ].map((link) => (
              <li key={link.label}>
                <Link href={link.href} style={{
                  color: "rgba(253, 240, 220, 0.7)", textDecoration: "none", fontSize: "13px",
                  transition: "all 0.3s ease", display: "inline-block"
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#F2C96E"; e.currentTarget.style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(253, 240, 220, 0.7)"; e.currentTarget.style.transform = "none"; }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Trust & Compliance */}
        <div>
          <h4 style={{ color: "#F2C96E", fontSize: "14px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "20px" }}>
            Trust & Legal
          </h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "🔐 Privacy Policy", href: "/privacy" },
              { label: "📜 Terms & Conditions", href: "/terms" },
              { label: "🪙 Refund Policy", href: "/terms" },
              { label: "📞 Support / Contact Us", href: "/contact" },
              { label: "🏆 Brand Ambassadors", href: "/referral" },
              { label: "📝 Spiritual Blog", href: "/blog" }
            ].map((link) => (
              <li key={link.label}>
                <Link href={link.href} style={{
                  color: "rgba(253, 240, 220, 0.7)", textDecoration: "none", fontSize: "13px",
                  transition: "all 0.3s ease", display: "inline-block"
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#E8600A"; e.currentTarget.style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(253, 240, 220, 0.7)"; e.currentTarget.style.transform = "none"; }}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Decorative Flickering Diya in Footer Bottom */}
      <div style={{
        textAlign: "center", borderTop: "1px solid rgba(242, 201, 110, 0.08)",
        paddingTop: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px"
      }}>
        {/* Animated Diya SVG */}
        <div style={{ position: "relative", width: "40px", height: "40px" }}>
          <svg viewBox="0 0 64 64" style={{ width: "100%", height: "100%" }}>
            {/* Diya Clay Base */}
            <path d="M 12 36 Q 32 60 52 36 Q 60 28 62 26 L 62 30 Q 62 56 32 60 Q 2 56 2 30 L 2 26 Q 4 28 12 36 Z" fill="#8c4312" />
            <path d="M 6 26 Q 32 44 58 26 Q 32 18 6 26 Z" fill="#a65219" />
            {/* Pulsing Flame */}
            <path className="diya-flame-pulse" d="M 32 6 C 26 16 28 26 32 26 C 36 26 38 16 32 6 Z" fill="#FFA500" />
            <path className="diya-flame-pulse" d="M 32 10 C 29 16 30 22 32 22 C 34 22 35 16 32 10 Z" fill="#FFD700" style={{ animationDelay: "0.2s" }} />
          </svg>
        </div>

        <div style={{ fontSize: "11px", color: "rgba(253, 240, 220, 0.45)", letterSpacing: "0.02em" }}>
          © {currentYear} PoojaPath AI. Made with devotion in India. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
