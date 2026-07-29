"use client";

import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useLang } from "@/lib/i18n/LanguageContext";

const DivineHeroCanvas = dynamic(() => import("./DivineHeroCanvas"), { ssr: false });

export default function HeroSection() {
  const { t } = useLang();
  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        .hero-section {
          position: relative;
          min-height: 90vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: clamp(80px, 12vw, 120px) 16px clamp(48px, 8vw, 80px);
          overflow: hidden;
          text-align: center;
        }
        .hero-content {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .hero-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(232,96,10,.1);
          border: 1px solid rgba(232,96,10,.2);
          backdrop-filter: blur(12px);
          border-radius: 100px;
          padding: 7px 20px;
          font-size: clamp(9px, 2vw, 11px);
          color: #F5841F;
          font-weight: 600;
          margin-bottom: clamp(20px, 4vw, 32px);
          letter-spacing: .08em;
          text-transform: uppercase;
          box-shadow: 0 0 20px rgba(232,96,10,.15);
        }
        .hero-h1 {
          font-family: var(--font-cormorant), serif;
          font-size: clamp(38px, 7.5vw, 82px);
          font-weight: 300;
          line-height: 1.06;
          color: rgba(253,240,220,.95);
          margin-bottom: clamp(8px, 1.5vw, 12px);
        }
        .hero-h1 em { font-style: italic; color: #F5841F; }
        .hero-h1 strong {
          font-weight: 700;
          background: linear-gradient(135deg, #F2C96E, #E8600A, #F2C96E);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200%;
          animation: gradShift 4s ease infinite;
        }
        .hero-sub {
          font-size: clamp(13px, 2vw, 17px);
          color: rgba(200,175,140,.65);
          font-weight: 300;
          line-height: 1.75;
          max-width: min(560px, 90vw);
          margin: 0 auto clamp(24px, 4vw, 36px);
        }
        .hero-sanskrit {
          font-family: var(--font-tiro), serif;
          font-size: clamp(18px, 4vw, 34px);
          color: #C9922B;
          margin-bottom: clamp(28px, 5vw, 44px);
          letter-spacing: 3px;
          animation: omGlow 3s ease-in-out infinite;
          word-break: break-word;
          padding: 0 8px;
        }
        .hero-btns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
          width: 100%;
        }
        .hero-btn-primary {
          position: relative;
          overflow: hidden;
          border: none;
          border-radius: 16px;
          padding: clamp(13px, 2.5vw, 16px) clamp(24px, 5vw, 40px);
          font-size: clamp(13px, 2vw, 15px);
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-sans), sans-serif;
          letter-spacing: .02em;
          background: linear-gradient(135deg, #E8600A, #B84A08);
          color: #fff;
          box-shadow: 0 8px 32px rgba(232,96,10,.4);
          transition: all .35s;
          flex: 1;
          min-width: min(180px, 100%);
          max-width: 260px;
        }
        .hero-btn-primary:hover { transform: translateY(-4px); box-shadow: 0 14px 48px rgba(232,96,10,.55); }
        .hero-btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,.15);
          transform: translateY(100%);
          transition: transform .3s ease;
        }
        .hero-btn-primary:hover::after { transform: translateY(0); }
        .hero-btn-secondary {
          border: 1.5px solid rgba(218,165,32,.35);
          border-radius: 16px;
          padding: clamp(13px, 2.5vw, 16px) clamp(24px, 5vw, 40px);
          font-size: clamp(13px, 2vw, 15px);
          font-weight: 600;
          cursor: pointer;
          font-family: var(--font-sans), sans-serif;
          letter-spacing: .02em;
          background: rgba(20,10,0,.75);
          color: #F2C96E;
          backdrop-filter: blur(12px);
          transition: all .35s;
          flex: 1;
          min-width: min(160px, 100%);
          max-width: 240px;
        }
        .hero-btn-secondary:hover {
          border-color: #DAA520;
          box-shadow: 0 0 40px rgba(218,165,32,.2);
          transform: translateY(-3px);
        }
        .hero-price-badge {
          font-size: clamp(8px, 1.5vw, 10px);
          background: linear-gradient(135deg, #FFD700, #DAA520);
          color: #1C0A00;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 800;
          margin-left: 6px;
          letter-spacing: .04em;
          vertical-align: middle;
        }

        /* Trust strip below hero */
        .hero-trust-strip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: clamp(14px, 4vw, 28px);
          flex-wrap: wrap;
          padding: clamp(12px, 2vw, 16px) clamp(16px, 4vw, 36px);
          border-top: 1px solid rgba(200,145,60,.1);
          border-bottom: 1px solid rgba(200,145,60,.1);
          background: rgba(8,4,2,.55);
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 20;
        }
        .hero-trust-item {
          display: flex;
          align-items: center;
          gap: clamp(6px, 1.5vw, 8px);
          font-size: clamp(10px, 2vw, 12px);
          color: rgba(200,175,140,.5);
          transition: all .3s;
          cursor: default;
          white-space: nowrap;
        }
        .hero-trust-item:hover { color: rgba(242,201,110,.8); transform: translateY(-2px); }
        .hero-trust-item span { font-size: clamp(13px, 3vw, 16px); }

        /* Mobile: stack buttons vertically on very small screens */
        @media (max-width: 480px) {
          .hero-btns { flex-direction: column; align-items: center; }
          .hero-btn-primary, .hero-btn-secondary { max-width: 280px; width: 100%; }
          .hero-trust-strip { gap: 10px; }
          .hero-trust-item { font-size: 10px; }
        }
        @media (max-width: 360px) {
          .hero-section { padding: 60px 12px 36px; }
          .hero-h1 { font-size: 34px; }
          .hero-sanskrit { font-size: 16px; letter-spacing: 1px; }
        }
      `}</style>

      {/* ── HERO SECTION ── */}
      <section className="hero-section">
        <DivineHeroCanvas />

        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="hero-badge-pill">
              <span style={{ fontSize: 14 }}>👁️</span>
              {t("hero_badge")}
            </div>
          </motion.div>

          <motion.h1
            className="hero-h1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {t("hero_h1_a")} <em>{t("hero_h1_b")}</em><br/>
            <strong>{t("hero_h1_c")}</strong>
          </motion.h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {t("hero_sub")}
          </motion.p>

          <motion.div
            className="hero-sanskrit"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
          >
            ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं
          </motion.div>

          <motion.div
            className="hero-btns"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <button className="hero-btn-primary" onClick={() => scrollToSection("#form-sec")}>
              {t("hero_btn1")}
              <span className="hero-price-badge">₹51</span>
            </button>
            <button className="hero-btn-secondary" onClick={() => scrollToSection("#darshan-sec")}>
              {t("hero_btn2")}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div className="hero-trust-strip">
        {[
          { icon: "⚡", key: "hero_stat1" },
          { icon: "🔒", key: "hero_stat2" },
          { icon: "📜", key: "hero_stat3" },
          { icon: "🕉️", key: "hero_stat4" },
        ].map(({ icon, key }) => (
          <div className="hero-trust-item" key={key}>
            <span>{icon}</span>
            {t(key as Parameters<typeof t>[0])}
          </div>
        ))}
      </div>
    </>
  );
}
