"use client";
import React from "react";
import Link from "next/link";

const SERVICES = [
  { label: "📜 Janam Kundli",          href: "/kundli" },
  { label: "📿 Digital Jaap Counter",  href: "/jaap" },
  { label: "🧭 Vastu Scanner",         href: "/vastu" },
  { label: "🖼️ AI Deity Wallpapers",  href: "/wallpapers" },
  { label: "📖 Bhagavad Gita AI",      href: "/gita" },
  { label: "🧘 Talk with Pandit Ji",   href: "/pandit" },
];

const LEGAL = [
  { label: "🔐 Privacy Policy",        href: "/privacy" },
  { label: "📜 Terms & Conditions",    href: "/terms" },
  { label: "🪙 Refund Policy",         href: "/terms" },
  { label: "📞 Contact Us",            href: "/contact" },
  { label: "🏆 Brand Ambassadors",     href: "/referral" },
  { label: "📝 Spiritual Blog",        href: "/blog" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <style>{`
        .footer-root {
          background: linear-gradient(180deg, #0d0501 0%, #060302 100%);
          border-top: 1px solid rgba(242,201,110,.15);
          position: relative;
          z-index: 10;
          font-family: var(--font-sans), sans-serif;
          color: #FDF0DC;
        }
        .footer-gold-line {
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, #F2C96E 50%, transparent);
          opacity: .8;
        }
        .footer-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 60px 24px 0;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 40px 32px;
          margin-bottom: 48px;
        }
        /* Brand column */
        .footer-brand { display: flex; flex-direction: column; gap: 14px; }
        .footer-logo {
          display: flex; align-items: center; gap: 10px;
          font-family: var(--font-cormorant), serif;
          font-size: 22px; font-weight: 800; letter-spacing: .05em;
        }
        .footer-tagline {
          font-size: 13px;
          color: rgba(253,240,220,.6);
          line-height: 1.7;
          max-width: 280px;
        }
        .footer-shloka {
          font-size: 12px;
          font-style: italic;
          color: #F2C96E;
          border-left: 2px solid #E8600A;
          padding-left: 12px;
          line-height: 1.6;
        }
        .footer-socials {
          display: flex;
          gap: 10px;
          margin-top: 4px;
          flex-wrap: wrap;
        }
        .footer-social-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 100px;
          border: 1px solid rgba(201,146,43,.18);
          background: rgba(201,146,43,.05);
          color: rgba(253,240,220,.55);
          font-size: 11px;
          font-weight: 600;
          text-decoration: none;
          transition: all .2s;
          white-space: nowrap;
        }
        .footer-social-btn:hover {
          border-color: rgba(201,146,43,.45);
          color: var(--gl);
          background: rgba(201,146,43,.1);
          transform: translateY(-2px);
        }
        /* Link columns */
        .footer-col h4 {
          font-size: 11px;
          font-weight: 700;
          color: #F2C96E;
          letter-spacing: .12em;
          text-transform: uppercase;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .footer-col h4::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(242,201,110,.12);
        }
        .footer-links {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-links a {
          color: rgba(253,240,220,.6);
          text-decoration: none;
          font-size: 13px;
          transition: all .2s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 2px 0;
        }
        .footer-links a:hover {
          color: #F2C96E;
          transform: translateX(4px);
        }
        /* Bottom bar */
        .footer-bottom {
          border-top: 1px solid rgba(242,201,110,.08);
          padding: 28px 24px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          max-width: 1100px;
          margin: 0 auto;
        }
        .footer-copyright {
          font-size: 11px;
          color: rgba(253,240,220,.35);
          letter-spacing: .02em;
        }
        .footer-diya {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          color: rgba(253,240,220,.3);
        }
        .footer-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 100px;
          border: 1px solid rgba(201,146,43,.12);
          background: rgba(201,146,43,.04);
          font-size: 10px;
          color: rgba(201,146,43,.5);
        }

        /* ── RESPONSIVE ───────────────────────────────── */
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr; }
          .footer-brand { grid-column: 1 / -1; }
          .footer-tagline { max-width: 100%; }
        }
        @media (max-width: 600px) {
          .footer-inner { padding: 44px 16px 0; }
          .footer-grid { grid-template-columns: 1fr; gap: 32px; }
          .footer-brand { gap: 12px; }
          .footer-logo { font-size: 20px; }
          .footer-bottom {
            flex-direction: column;
            text-align: center;
            padding: 24px 16px 32px;
            gap: 12px;
          }
          .footer-socials { justify-content: flex-start; }
        }
        @media (max-width: 400px) {
          .footer-social-btn { padding: 6px 10px; font-size: 10px; }
          .footer-links a { font-size: 12px; }
        }
      `}</style>

      <footer className="footer-root">
        <div className="footer-gold-line" />

        <div className="footer-inner">
          <div className="footer-grid">

            {/* ── Brand Column ── */}
            <div className="footer-brand">
              <div className="footer-logo">
                <span className="om-pulse-slow" style={{ fontSize: 28 }}>🕉️</span>
                <span className="gold-text-shimmer">PoojaPath AI</span>
              </div>

              <p className="footer-tagline">
                Bringing the ancient, sacred wisdom of Kashi together with Silicon Valley precision. Let AI elevate your daily spiritual sadhana.
              </p>

              <div className="footer-shloka">
                "सर्वे भवन्तु सुखिनः, सर्वे सन्तु निरामयाः"<br/>
                <span style={{ fontSize: 10, opacity: 0.6 }}>May all beings be happy and free from illness</span>
              </div>

              <div className="footer-socials">
                <a href="https://wa.me/?text=🙏 PoojaPath AI - India's #1 Online Pooja Platform! https://poojapath.ai" target="_blank" rel="noopener noreferrer" className="footer-social-btn">
                  💬 WhatsApp
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn">
                  📷 Instagram
                </a>
                <a href="https://twitter.com/intent/tweet?text=🕉️ PoojaPath AI — Book Pandits online, free Kundli, AI Mantra! https://poojapath.ai" target="_blank" rel="noopener noreferrer" className="footer-social-btn">
                  🐦 Twitter/X
                </a>
              </div>
            </div>

            {/* ── Services Column ── */}
            <div className="footer-col">
              <h4>Sacred Services</h4>
              <ul className="footer-links">
                {SERVICES.map(l => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Legal Column ── */}
            <div className="footer-col">
              <h4>Trust & Legal</h4>
              <ul className="footer-links">
                {LEGAL.map(l => (
                  <li key={l.href + l.label}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © {year} PoojaPath AI. Made with devotion in India 🇮🇳. All Rights Reserved.
          </div>
          <div className="footer-diya">
            <div className="footer-badge">🪔 Powered by AI + Bhakti</div>
            <svg viewBox="0 0 64 64" style={{ width: 28, height: 28, flexShrink: 0 }}>
              <path d="M12 36Q32 60 52 36Q60 28 62 26L62 30Q62 56 32 60Q2 56 2 30L2 26Q4 28 12 36Z" fill="#8c4312"/>
              <path d="M6 26Q32 44 58 26Q32 18 6 26Z" fill="#a65219"/>
              <path className="diya-flame-pulse" d="M32 6C26 16 28 26 32 26C36 26 38 16 32 6Z" fill="#FFA500"/>
              <path className="diya-flame-pulse" d="M32 10C29 16 30 22 32 22C34 22 35 16 32 10Z" fill="#FFD700" style={{ animationDelay: ".2s" }}/>
            </svg>
          </div>
        </div>
      </footer>
    </>
  );
}
