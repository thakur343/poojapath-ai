"use client";

import { useEffect, useState, useRef } from "react";
import { useLang } from "@/lib/i18n/LanguageContext";

// ── Day-aware deity config ────────────────────────────────
const DAY_META: Record<number, { deity: string; color: string; emoji: string }> = {
  0: { deity: "Surya Dev",  color: "#E8600A", emoji: "☀️" },
  1: { deity: "Shiv Ji",    color: "#6366f1", emoji: "🔱" },
  2: { deity: "Hanuman Ji", color: "#dc2626", emoji: "🙏" },
  3: { deity: "Ganesh Ji",  color: "#16a34a", emoji: "🐘" },
  4: { deity: "Vishnu Ji",  color: "#ca8a04", emoji: "🪷" },
  5: { deity: "Lakshmi Ji", color: "#db2777", emoji: "🌸" },
  6: { deity: "Shani Dev",  color: "#64748b", emoji: "⚖️" },
};

// ── Notification messages per language ───────────────────
const MESSAGES = {
  en: [
    { icon: "🪔", text: "Today's Shubh Muhurat: 06:15 AM – 07:45 AM · Perfect for prayers & new beginnings" },
    { icon: "🕉️", text: "Daily Mantra: Om Namah Shivaya · Chant 108 times for peace and divine blessings" },
    { icon: "🌸", text: "PoojaPath.ai is live — AI-powered Vedic guidance, 24/7. Try Pandit Ji free →" },
    { icon: "⭐", text: "Ekadashi Vrat this week — fasting brings spiritual merit. Consult Pandit Ji for details" },
    { icon: "🪷", text: "Kundli Insight: Jupiter is strong this month — ideal for education, travel & wealth rituals" },
    { icon: "🔱", text: "Sacred tip: Light a diya at sunset & chant Gayatri Mantra for divine protection" },
    { icon: "📿", text: "Nama Jaap session: Start with 21 repetitions & gradually increase to 108 daily" },
    { icon: "🌙", text: "Purnima (Full Moon) approaching — ideal time for gratitude meditation & ancestral prayers" },
  ],
  hi: [
    { icon: "🪔", text: "आज का शुभ मुहूर्त: प्रातः 06:15 – 07:45 · पूजा और नए कार्यों के लिए श्रेष्ठ" },
    { icon: "🕉️", text: "दैनिक मंत्र: ॐ नमः शिवाय · मन की शांति के लिए 108 बार जाप करें" },
    { icon: "🌸", text: "PoojaPath.ai — AI द्वारा संचालित वैदिक मार्गदर्शन, 24 घंटे उपलब्ध। पंडित जी से बात करें →" },
    { icon: "⭐", text: "इस सप्ताह एकादशी व्रत — उपवास से आत्मिक शक्ति मिलती है। पंडित जी से पूछें" },
    { icon: "🪷", text: "कुंडली ज्ञान: इस माह गुरु बलशाली हैं — शिक्षा, यात्रा और धन के लिए शुभ" },
    { icon: "🔱", text: "पवित्र सुझाव: सूर्यास्त पर दीया जलाएं और गायत्री मंत्र का जाप करें" },
    { icon: "📿", text: "नाम जाप: पहले 21 बार से शुरुआत करें, धीरे-धीरे 108 तक पहुँचें" },
    { icon: "🌙", text: "पूर्णिमा आ रही है — कृतज्ञता ध्यान और पितृ प्रार्थना का उत्तम समय" },
  ],
  sa: [
    { icon: "🪔", text: "अद्य शुभमुहूर्तः: प्रातः 06:15 – 07:45 · पूजायाः नवकार्याणाम् च कृते श्रेष्ठम्" },
    { icon: "🕉️", text: "दैनिकं मन्त्रम्: ॐ नमः शिवाय · मनःशान्त्यर्थं 108 वारं जपत" },
    { icon: "🌸", text: "PoojaPath.ai — AI चालितं वैदिकमार्गदर्शनम्, सर्वदा उपलब्धम् · पण्डितजीना सह वदत →" },
    { icon: "⭐", text: "अस्मिन् सप्ताहे एकादशीव्रतम् — उपवासेन आत्मिकशक्तिः वर्धते" },
    { icon: "🪷", text: "कुण्डलीज्ञानम्: अस्मिन् मासे गुरुः बलशाली — विद्यायात्राधनकृत्यानां कृते शुभम्" },
    { icon: "🔱", text: "पवित्रसुझावः: सूर्यास्ते दीपं प्रज्वालयत गायत्रीमन्त्रं च जपत" },
    { icon: "📿", text: "नामजपः: प्रथमं 21 वारम् आरभत, क्रमशः 108 पर्यन्तं गच्छत" },
    { icon: "🌙", text: "पूर्णिमा आगच्छति — कृतज्ञताध्यानस्य पितृप्रार्थनायाश्च उत्तमः कालः" },
  ],
};

export default function SpiritualNotificationBar() {
  const { lang } = useLang();
  const [visible, setVisible]   = useState(true);
  const [msgIdx, setMsgIdx]     = useState(0);
  const [animIn, setAnimIn]     = useState(true);
  const intervalRef             = useRef<ReturnType<typeof setInterval> | null>(null);

  const day    = new Date().getDay();
  const meta   = DAY_META[day];
  const msgs   = MESSAGES[lang];
  const curr   = msgs[msgIdx % msgs.length];

  // Rotate message every 5 seconds with fade animation
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setAnimIn(false);
      setTimeout(() => {
        setMsgIdx(i => (i + 1) % msgs.length);
        setAnimIn(true);
      }, 350);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [msgs.length, lang]);

  // Reset index on language change
  useEffect(() => { setMsgIdx(0); setAnimIn(true); }, [lang]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes snbMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes snbFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes snbFadeOut {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(4px); }
        }
        @keyframes snbDiyaPulse {
          0%,100% { filter: drop-shadow(0 0 4px ${meta.color}); opacity: .8; }
          50%      { filter: drop-shadow(0 0 10px ${meta.color}); opacity: 1; }
        }
        @keyframes snbBarGlow {
          0%,100% { box-shadow: 0 1px 0 rgba(201,146,43,.08), inset 0 0 60px rgba(201,146,43,.02); }
          50%      { box-shadow: 0 1px 0 rgba(201,146,43,.18), inset 0 0 80px rgba(201,146,43,.06); }
        }
        @keyframes snbRing {
          0%   { transform: scale(1);   opacity: .6; }
          70%  { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        .snb-bar {
          position: relative;
          z-index: 300;
          width: 100%;
          background: linear-gradient(90deg,
            rgba(6,3,2,.97) 0%,
            rgba(14,6,2,.98) 30%,
            rgba(28,10,0,.98) 50%,
            rgba(14,6,2,.98) 70%,
            rgba(6,3,2,.97) 100%
          );
          border-bottom: 1px solid rgba(201,146,43,.15);
          animation: snbBarGlow 4s ease-in-out infinite;
          overflow: hidden;
        }

        /* Shimmer line at top */
        .snb-bar::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(201,146,43,.4) 20%,
            rgba(255,200,80,.7) 50%,
            rgba(201,146,43,.4) 80%,
            transparent 100%
          );
          animation: gradShift 3s ease infinite;
          background-size: 200%;
        }

        .snb-inner {
          display: flex;
          align-items: center;
          gap: 0;
          height: 34px;
          padding: 0 12px;
        }

        /* Left: day deity badge */
        .snb-deity {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 14px 0 4px;
          border-right: 1px solid rgba(201,146,43,.15);
          margin-right: 14px;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .snb-deity-dot {
          position: relative;
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .snb-deity-dot-core {
          width: 8px; height: 8px; border-radius: 50%;
          position: absolute;
        }
        .snb-deity-dot-ring {
          position: absolute;
          inset: 0; border-radius: 50%;
          animation: snbRing 2s ease-out infinite;
        }
        .snb-deity-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .06em;
          text-transform: uppercase;
        }

        /* Om divider */
        .snb-om {
          font-size: 12px;
          color: rgba(201,146,43,.3);
          padding: 0 10px;
          flex-shrink: 0;
          animation: snbDiyaPulse 3s ease-in-out infinite;
          font-family: var(--font-tiro);
        }

        /* Message area */
        .snb-msg-wrap {
          flex: 1;
          overflow: hidden;
          position: relative;
          height: 100%;
          display: flex;
          align-items: center;
        }
        .snb-msg {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11.5px;
          color: rgba(242,201,110,.7);
          white-space: nowrap;
          transition: opacity .35s, transform .35s;
        }
        .snb-msg.in  { animation: snbFadeIn  .35s ease forwards; }
        .snb-msg.out { animation: snbFadeOut .35s ease forwards; }
        .snb-msg-icon { font-size: 13px; flex-shrink: 0; }
        .snb-msg-text { letter-spacing: .01em; }

        /* Right: diya flames + close */
        .snb-right {
          display: flex;
          align-items: center;
          gap: 8px;
          padding-left: 14px;
          border-left: 1px solid rgba(201,146,43,.12);
          margin-left: 14px;
          flex-shrink: 0;
        }
        .snb-diya {
          font-size: 14px;
          animation: snbDiyaPulse 2.5s ease-in-out infinite;
          cursor: default;
        }
        .snb-diya:last-of-type { animation-delay: 1.25s; }
        .snb-close {
          width: 20px; height: 20px;
          border-radius: 50%;
          border: 1px solid rgba(201,146,43,.2);
          background: rgba(201,146,43,.06);
          color: rgba(201,146,43,.5);
          font-size: 10px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all .2s;
          flex-shrink: 0;
        }
        .snb-close:hover {
          background: rgba(232,96,10,.15);
          border-color: rgba(232,96,10,.4);
          color: var(--cream);
        }

        /* Nav sticky top adjustment when bar is visible */
        .snb-spacer-active nav {
          top: 34px;
        }
      `}</style>

      <div className="snb-bar" role="marquee" aria-live="polite">
        <div className="snb-inner">

          {/* Left deity badge */}
          <div className="snb-deity">
            <div className="snb-deity-dot">
              <div className="snb-deity-dot-core" style={{ background: meta.color }} />
              <div className="snb-deity-dot-ring"  style={{ background: meta.color }} />
            </div>
            <span style={{ fontSize: 13 }}>{meta.emoji}</span>
            <span className="snb-deity-label" style={{ color: meta.color }}>
              {meta.deity}
            </span>
          </div>

          <span className="snb-om">ॐ</span>

          {/* Rotating message */}
          <div className="snb-msg-wrap">
            <div className={`snb-msg ${animIn ? "in" : "out"}`}>
              <span className="snb-msg-icon">{curr.icon}</span>
              <span className="snb-msg-text">{curr.text}</span>
            </div>
          </div>

          {/* Dot nav */}
          <div style={{ display: "flex", gap: 4, alignItems: "center", paddingLeft: 12, flexShrink: 0 }}>
            {msgs.map((_, i) => (
              <button
                key={i}
                onClick={() => { setMsgIdx(i); setAnimIn(true); }}
                style={{
                  width: i === msgIdx % msgs.length ? 14 : 5,
                  height: 5,
                  borderRadius: 3,
                  border: "none",
                  background: i === msgIdx % msgs.length
                    ? meta.color
                    : "rgba(201,146,43,.2)",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all .3s",
                }}
                aria-label={`Notification ${i + 1}`}
              />
            ))}
          </div>

          {/* Right diya + close */}
          <div className="snb-right">
            <span className="snb-diya">🪔</span>
            <span className="snb-diya">🪔</span>
            <button
              className="snb-close"
              onClick={() => setVisible(false)}
              aria-label="Dismiss notification bar"
            >
              ✕
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
