"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n/LanguageContext";

// ── Data ──────────────────────────────────────────────────────────────────────
const scholars = [
  {
    id: 1,
    nameHindi: "पंडित धीरेन्द्र कृष्ण शास्त्री",
    nameEnglish: "Pandit Dhirendra Krishna Shastri",
    alias: "Bageshwar Dham Sarkar",
    title: "Divya Darbar Katha Vachak",
    location: "Bageshwar Dham, Chhatarpur, MP",
    quote: "जो राम को लाये हैं, हम उनके गुण गाएंगे। श्रद्धा और विश्वास से हर कठिनाई दूर होती है।",
    quoteEn: "Faith in Ram removes every obstacle. Surrender to the divine with full devotion.",
    quoteSource: "Public Katha Discourse, 2023",
    proof: "2.5 Cr+ YouTube Subscribers",
    proofIcon: "▶",
    color: "#FF6B35",
    glowColor: "rgba(255,107,53,0.35)",
    avatar: "🙏",
    initial: "D",
  },
  {
    id: 2,
    nameHindi: "प्रदीप मिश्रा जी",
    nameEnglish: "Pandit Pradeep Mishra Ji",
    alias: "Sehore Wale Baba",
    title: "Shiv Mahapuran Katha Vachak",
    location: "Sehore, Madhya Pradesh",
    quote: "शिव की भक्ति में वो शक्ति है जो दुनिया की कोई भी ताकत नहीं दे सकती।",
    quoteEn: "The devotion to Shiva holds a power that no worldly force can ever match.",
    quoteSource: "Shiv Katha Pravachan, Ujjain 2022",
    proof: "1.8 Cr+ YouTube Subscribers",
    proofIcon: "▶",
    color: "#FFD700",
    glowColor: "rgba(255,215,0,0.3)",
    avatar: "🕉️",
    initial: "P",
  },
  {
    id: 3,
    nameHindi: "देवकीनंदन ठाकुर जी",
    nameEnglish: "Devkinandan Thakur Ji",
    alias: "Vrindavan Wale",
    title: "Bhagwat Katha Vachak & Preacher",
    location: "Vrindavan, Uttar Pradesh",
    quote: "भागवत की एक भी कथा सुनने से जन्मों के पाप नष्ट हो जाते हैं। हरि कथा अमृत है।",
    quoteEn: "Even one hearing of the Bhagwat destroys sins of lifetimes. Hari Katha is nectar.",
    quoteSource: "Bhagwat Saptah Pravachan, Delhi 2023",
    proof: "80 Lakh+ YouTube Subscribers",
    proofIcon: "▶",
    color: "#8B0000",
    glowColor: "rgba(139,0,0,0.4)",
    avatar: "📿",
    initial: "D",
  },
  {
    id: 4,
    nameHindi: "कुमार विश्वास",
    nameEnglish: "Dr. Kumar Vishwas",
    alias: "Sahitya Yogi",
    title: "Hindi Poet, Author & Spiritual Orator",
    location: "Pilakhua, Uttar Pradesh",
    quote: "रामायण सिर्फ एक ग्रंथ नहीं, यह जीवन जीने की सबसे सुंदर पाठशाला है।",
    quoteEn: "Ramayana is not just a scripture — it is the most beautiful school of living life.",
    quoteSource: "Shri Ram Katha, Doordarshan 2022",
    proof: "1.2 Cr+ YouTube Subscribers",
    proofIcon: "▶",
    color: "#FF6B35",
    glowColor: "rgba(255,107,53,0.3)",
    avatar: "✍️",
    initial: "K",
  },
  {
    id: 5,
    nameHindi: "अनुराधा आचार्य",
    nameEnglish: "Anuradha Acharya",
    alias: "Vedic Wisdom Guide",
    title: "Vedic Astrologer & Spiritual Guide",
    location: "New Delhi",
    quote: "ग्रह आपका भाग्य नहीं बनाते, वे केवल संकेत देते हैं। भाग्य बनाता है आपका कर्म और साधना।",
    quoteEn: "Planets don't create your destiny — they only give signals. Your karma and sadhana shape your fate.",
    quoteSource: "Public Discourse on Vedic Jyotish, 2023",
    proof: "Vedic Astrology Expert",
    proofIcon: "⭐",
    color: "#FFD700",
    glowColor: "rgba(255,215,0,0.35)",
    avatar: "🔮",
    initial: "A",
  },
];

// ── Typewriter Hook ───────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 28, active = false) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) { setDisplayed(""); setDone(false); return; }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(interval); setDone(true); }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, active]);

  return { displayed, done };
}

// ── Scholar Card ──────────────────────────────────────────────────────────────
function ScholarCard({ s, active }: { s: typeof scholars[0]; active: boolean }) {
  const { displayed } = useTypewriter(s.quote, 22, active);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="sv-card"
      style={{
        "--glow": s.glowColor,
        "--accent": s.color,
        transform: hovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? `0 24px 60px ${s.glowColor}, 0 0 0 1px ${s.color}44`
          : `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,215,0,0.08)`,
      } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Diya flicker corners */}
      <span className="sv-diya sv-diya--tl" aria-hidden>🪔</span>
      <span className="sv-diya sv-diya--br" aria-hidden>🪔</span>

      {/* Om watermark */}
      <div className="sv-om-bg" aria-hidden>ॐ</div>

      {/* Avatar */}
      <div className="sv-avatar-wrap">
        <div
          className="sv-avatar"
          style={{ borderColor: s.color, boxShadow: `0 0 20px ${s.glowColor}` }}
        >
          <span className="sv-avatar-emoji">{s.avatar}</span>
          <div className="sv-avatar-initial" style={{ background: s.color }}>{s.initial}</div>
        </div>
        {/* Verified badge */}
        <div className="sv-badge" style={{ background: s.color }}>✓</div>
      </div>

      {/* Name */}
      <div className="sv-names">
        <div className="sv-name-hi">{s.nameHindi}</div>
        <div className="sv-name-en">{s.nameEnglish}</div>
        {s.alias && <div className="sv-alias">"{s.alias}"</div>}
      </div>

      {/* Title */}
      <div className="sv-title-badge" style={{ borderColor: `${s.color}44`, color: s.color }}>
        {s.title}
      </div>
      <div className="sv-location">📍 {s.location}</div>

      {/* Divider */}
      <div className="sv-divider" style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />

      {/* Quote */}
      <div className="sv-quote-wrap">
        <div className="sv-quote-mark" style={{ color: s.color }}>"</div>
        <p className="sv-quote-hi">
          {active ? displayed : s.quote}
          {active && displayed.length < s.quote.length && (
            <span className="sv-cursor" style={{ borderColor: s.color }}>|</span>
          )}
        </p>
        <p className="sv-quote-en">{s.quoteEn}</p>
        <div className="sv-quote-source">— {s.quoteSource}</div>
      </div>

      {/* Inspired tag */}
      <div className="sv-inspired">
        <span>🙏</span>
        <span>Inspired by their teachings</span>
      </div>

      {/* Social proof */}
      <div className="sv-proof" style={{ background: `${s.color}18`, borderColor: `${s.color}33` }}>
        <span style={{ color: s.color }}>{s.proofIcon}</span>
        <span>{s.proof}</span>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SacredVoices() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const { t } = useLang();

  // Intersection observer for fade-in
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActiveIdx((i) => (i + 1) % scholars.length);
    }, 4500);
    return () => clearInterval(t);
  }, [paused]);

  // Scroll active card into view — scroll only inside track, NOT the page
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[activeIdx] as HTMLElement;
    if (!card) return;
    const trackLeft = track.getBoundingClientRect().left;
    const cardLeft  = card.getBoundingClientRect().left;
    const offset    = cardLeft - trackLeft - (track.clientWidth / 2) + (card.clientWidth / 2);
    track.scrollBy({ left: offset, behavior: "smooth" });
  }, [activeIdx]);

  return (
    <section
      ref={sectionRef}
      className="sv-section"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}
    >
      {/* Background lotus watermark */}
      <div className="sv-bg-lotus" aria-hidden>🪷</div>
      <div className="sv-bg-glow1" aria-hidden />
      <div className="sv-bg-glow2" aria-hidden />

      {/* Header */}
      <div className="sv-header">
        <div className="sec-eye"><span>🕉️</span> दिव्य विचार · Divya Vichar</div>
        <h2 className="sec-title">
          Sacred <em>Voices</em> of Bharat
        </h2>
        <p className="sec-sub">
          Wisdom from revered saints & scholars who light the path of dharma.
          <br />
          <span style={{ fontSize: "11px", opacity: 0.5, display: "block", marginTop: 4 }}>
            ⚖️ Disclaimer: All quotes are from public discourses. "Inspired by" — not an endorsement.
          </span>
        </p>
      </div>

      {/* Carousel Track */}
      <div
        className="sv-track"
        ref={trackRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {scholars.map((s, i) => (
          <div
            key={s.id}
            className={`sv-card-wrap ${i === activeIdx ? "sv-card-wrap--active" : ""}`}
            onClick={() => setActiveIdx(i)}
          >
            <ScholarCard s={s} active={i === activeIdx} />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="sv-dots">
        {scholars.map((s, i) => (
          <button
            key={i}
            className={`sv-dot ${i === activeIdx ? "sv-dot--active" : ""}`}
            style={{ background: i === activeIdx ? s.color : undefined }}
            onClick={() => setActiveIdx(i)}
            aria-label={`View ${s.nameEnglish}`}
          />
        ))}
      </div>

      {/* Navigation arrows */}
      <div className="sv-arrows">
        <button
          className="sv-arrow"
          onClick={() => setActiveIdx((i) => (i - 1 + scholars.length) % scholars.length)}
          aria-label="Previous"
        >
          ←
        </button>
        <span className="sv-arrow-label">{activeIdx + 1} / {scholars.length}</span>
        <button
          className="sv-arrow"
          onClick={() => setActiveIdx((i) => (i + 1) % scholars.length)}
          aria-label="Next"
        >
          →
        </button>
      </div>

      {/* CTA */}
      <div className="sv-cta">
        <p className="sv-cta-count">
          <span className="sv-cta-num">10,000+</span> {t("sv_sub")}
        </p>
        <Link href="/pandit" className="sv-cta-btn">
          {t("sv_cta")}
          <span className="sv-cta-arrow">→</span>
        </Link>
        <p className="sv-cta-note">{t("sv_note")}</p>
      </div>
    </section>
  );
}
