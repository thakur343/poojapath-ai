"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// ── Traffic tip cards data ──────────────────────────────────────────────
const TRAFFIC_TIPS = [
  {
    icon: "🔍",
    title: "Google Search Console",
    status: "⚠️ Not Connected",
    statusColor: "#F59E0B",
    desc: "Submit your sitemap & verify ownership to appear in Google Search.",
    action: "Connect Now →",
    link: "https://search.google.com/search-console",
    priority: "HIGH",
  },
  {
    icon: "📊",
    title: "Google Analytics 4",
    status: "✅ Active",
    statusColor: "#4ADE80",
    desc: "GA4 is tracking visitors with ID G-KTLHGZQ4LJ. Set up Key Events next.",
    action: "View Dashboard →",
    link: "https://analytics.google.com",
    priority: "DONE",
  },
  {
    icon: "⚡",
    title: "Vercel Analytics",
    status: "✅ Active",
    statusColor: "#4ADE80",
    desc: "Real visitor data, Web Vitals & speed insights enabled via Vercel.",
    action: "View on Vercel →",
    link: "https://vercel.com/dashboard",
    priority: "DONE",
  },
  {
    icon: "🗺️",
    title: "Sitemap Submitted",
    status: "⚠️ Submit Pending",
    statusColor: "#F59E0B",
    desc: "Your sitemap is at poojapath.ai/sitemap.xml — submit it to Google Search Console.",
    action: "Submit Sitemap →",
    link: "https://search.google.com/search-console",
    priority: "HIGH",
  },
  {
    icon: "📱",
    title: "WhatsApp Groups",
    status: "📣 Share Now",
    statusColor: "#E8600A",
    desc: "Share your link in spiritual WhatsApp groups, temple groups & family groups.",
    action: "Copy Link →",
    link: "#share",
    priority: "NOW",
  },
  {
    icon: "📷",
    title: "Instagram / Reels",
    status: "📣 Share Now",
    statusColor: "#E8600A",
    desc: "Post about PoojaPath on Instagram with #PoojaPath #HinduRituals #OnlinePuja.",
    action: "Open Instagram →",
    link: "https://instagram.com",
    priority: "NOW",
  },
];

const SEO_CHECKLIST = [
  { done: true,  text: "Meta Title & Description set" },
  { done: true,  text: "Open Graph (OG) tags added" },
  { done: true,  text: "Sitemap.xml generated" },
  { done: true,  text: "robots.txt configured" },
  { done: true,  text: "Structured data (JSON-LD) added" },
  { done: true,  text: "Google Analytics 4 installed" },
  { done: true,  text: "Vercel Analytics enabled" },
  { done: false, text: "Google Search Console verified" },
  { done: false, text: "Sitemap submitted to Google" },
  { done: false, text: "Bing Webmaster Tools connected" },
  { done: false, text: "Site speed score > 90 (Lighthouse)" },
  { done: false, text: "Core Web Vitals passing" },
];

const QUICK_SHARES = [
  {
    name: "WhatsApp",
    icon: "💬",
    color: "#25D366",
    msg: "🙏 PoojaPath AI - India's first AI-powered Pooja platform!\n\n✅ Book Pandit Online\n✅ AI Mantra Guidance\n✅ Free Kundli Generator\n✅ Digital Jaap Counter\n\nVisit: https://poojapath.ai",
    href: (msg: string) => `https://wa.me/?text=${encodeURIComponent(msg)}`,
  },
  {
    name: "Twitter/X",
    icon: "🐦",
    color: "#1DA1F2",
    msg: "🕉️ Introducing PoojaPath AI - Book pandits online, get AI mantra guidance & free Kundli! India's first AI-powered Hindu ritual platform. 🙏\n\nhttps://poojapath.ai\n\n#PoojaPath #HinduRituals #AI #Spirituality",
    href: (msg: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}`,
  },
  {
    name: "Telegram",
    icon: "✈️",
    color: "#0088CC",
    msg: "🙏 PoojaPath AI - पंडित बुक करें, AI से मंत्र जानें, मुफ्त कुंडली बनाएं!\n\nhttps://poojapath.ai",
    href: (msg: string) => `https://t.me/share/url?url=https://poojapath.ai&text=${encodeURIComponent(msg)}`,
  },
];

const KEY_EVENTS = [
  { event: "signup",          label: "User Sign Up",       icon: "👤", where: "Login page → Google/Email sign-in" },
  { event: "begin_checkout",  label: "Book Pandit Click",  icon: "🙏", where: "Pricing section → Book Now button" },
  { event: "purchase",        label: "Booking Complete",   icon: "💰", where: "After Razorpay payment success" },
  { event: "ai_chat_message", label: "AI Chat Used",       icon: "🤖", where: "GuruDrawer / PanditFloatChat" },
  { event: "share",           label: "Site Shared",        icon: "📤", where: "ShareBar component" },
  { event: "generate_lead",   label: "Mantra Generated",   icon: "📜", where: "MantraForm submit" },
];

export default function AnalyticsDashboard() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "seo" | "share" | "events">("overview");
  const siteUrl = "https://poojapath.ai";

  const copyLink = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Navbar />
      <style>{`
        .adash { min-height:100vh; background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(232,96,10,.1) 0%, rgba(201,146,43,.04) 40%, #0d0501 70%); }
        .adash-inner { max-width:1100px; margin:0 auto; padding:40px 24px 80px; }
        .adash-hero { text-align:center; margin-bottom:48px; }
        .adash-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(232,96,10,.1); border:1px solid rgba(232,96,10,.2); border-radius:100px; padding:6px 18px; font-size:11px; color:#F5841F; font-weight:700; letter-spacing:.08em; text-transform:uppercase; margin-bottom:20px; }
        .adash-title { font-family:var(--font-cormorant); font-size:clamp(32px,5vw,52px); font-weight:400; color:rgba(253,240,220,.95); margin-bottom:12px; line-height:1.1; }
        .adash-title em { font-style:italic; color:#F5841F; }
        .adash-sub { font-size:14px; color:rgba(200,175,140,.6); max-width:500px; margin:0 auto; line-height:1.7; }

        /* Tabs */
        .adash-tabs { display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-bottom:40px; }
        .adash-tab { padding:10px 22px; border-radius:100px; border:1px solid rgba(201,146,43,.15); background:transparent; color:rgba(253,240,220,.5); font-family:var(--font-sans); font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; }
        .adash-tab.active { background:linear-gradient(135deg,#E8600A,#C9922B); color:#fff; border-color:transparent; box-shadow:0 4px 18px rgba(232,96,10,.3); }
        .adash-tab:hover:not(.active) { border-color:rgba(201,146,43,.35); color:var(--gl); }

        /* Stat cards */
        .adash-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; margin-bottom:40px; }
        .stat-card { background:rgba(14,6,2,.88); border:1px solid rgba(201,146,43,.12); border-radius:18px; padding:22px 20px; backdrop-filter:blur(16px); text-align:center; transition:.3s; }
        .stat-card:hover { border-color:rgba(201,146,43,.28); transform:translateY(-4px); box-shadow:0 12px 40px rgba(0,0,0,.4); }
        .stat-val { font-family:var(--font-cormorant); font-size:42px; font-weight:700; color:var(--s); line-height:1; margin-bottom:6px; }
        .stat-lbl { font-size:11px; color:rgba(200,175,140,.5); text-transform:uppercase; letter-spacing:.06em; }
        .stat-trend { font-size:11px; color:rgba(200,175,140,.4); margin-top:4px; }
        .stat-trend.up { color:#4ADE80; }
        .stat-trend.dn { color:#F87171; }

        /* Tip cards */
        .tip-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:16px; margin-bottom:40px; }
        .tip-card { background:rgba(14,6,2,.88); border:1px solid rgba(201,146,43,.1); border-radius:18px; padding:22px; backdrop-filter:blur(16px); transition:.35s; position:relative; overflow:hidden; }
        .tip-card:hover { border-color:rgba(201,146,43,.25); transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,.4); }
        .tip-priority { position:absolute; top:14px; right:14px; font-size:9px; font-weight:800; padding:3px 8px; border-radius:4px; letter-spacing:.06em; }
        .tip-priority.HIGH { background:rgba(245,158,11,.15); color:#F59E0B; }
        .tip-priority.DONE { background:rgba(74,222,128,.12); color:#4ADE80; }
        .tip-priority.NOW  { background:rgba(232,96,10,.15); color:#F5841F; }
        .tip-icon { font-size:28px; margin-bottom:12px; display:block; }
        .tip-title { font-family:var(--font-cormorant); font-size:18px; font-weight:600; color:rgba(253,240,220,.9); margin-bottom:4px; }
        .tip-status { font-size:11px; font-weight:600; margin-bottom:10px; }
        .tip-desc { font-size:12px; color:rgba(200,175,140,.55); line-height:1.6; margin-bottom:16px; }
        .tip-btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:10px; font-size:12px; font-weight:600; text-decoration:none; transition:.2s; border:1px solid rgba(201,146,43,.2); color:var(--gl); background:rgba(201,146,43,.06); }
        .tip-btn:hover { background:rgba(232,96,10,.15); border-color:rgba(232,96,10,.3); color:#fff; }

        /* SEO checklist */
        .seo-list { display:flex; flex-direction:column; gap:10px; }
        .seo-item { display:flex; align-items:center; gap:14px; padding:14px 18px; background:rgba(14,6,2,.6); border:1px solid rgba(201,146,43,.08); border-radius:12px; transition:.2s; }
        .seo-item:hover { border-color:rgba(201,146,43,.2); }
        .seo-check { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }
        .seo-check.done { background:rgba(74,222,128,.12); border:1px solid rgba(74,222,128,.3); color:#4ADE80; }
        .seo-check.todo { background:rgba(200,145,60,.06); border:1px solid rgba(200,145,60,.15); color:rgba(200,175,140,.4); }
        .seo-text { font-size:13px; color:rgba(253,240,220,.8); }
        .seo-text.todo { color:rgba(200,175,140,.5); }
        .seo-progress { height:8px; background:rgba(200,145,60,.08); border-radius:4px; overflow:hidden; margin:20px 0; }
        .seo-bar { height:100%; background:linear-gradient(90deg,#E8600A,#C9922B,#F2C96E); border-radius:4px; transition:width 1s ease; }

        /* Share cards */
        .share-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:16px; }
        .share-card { background:rgba(14,6,2,.88); border:1px solid rgba(201,146,43,.1); border-radius:18px; padding:22px; transition:.3s; }
        .share-card:hover { transform:translateY(-4px); box-shadow:0 16px 48px rgba(0,0,0,.4); }
        .share-name { font-size:16px; font-weight:700; color:rgba(253,240,220,.9); margin-bottom:8px; }
        .share-msg { font-size:12px; color:rgba(200,175,140,.5); line-height:1.6; margin-bottom:16px; padding:10px; background:rgba(255,255,255,.02); border-radius:8px; border:1px solid rgba(200,145,60,.06); }
        .share-btn { display:flex; align-items:center; justify-content:center; gap:8px; width:100%; padding:12px; border-radius:12px; font-size:13px; font-weight:700; text-decoration:none; transition:.2s; color:#fff; }
        .share-btn:hover { opacity:.9; transform:translateY(-2px); }

        /* Key events table */
        .events-table { width:100%; border-collapse:collapse; }
        .events-table th { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:rgba(200,175,140,.4); padding:10px 16px; text-align:left; border-bottom:1px solid rgba(201,146,43,.1); }
        .events-table td { padding:14px 16px; border-bottom:1px solid rgba(201,146,43,.06); font-size:13px; color:rgba(253,240,220,.78); vertical-align:middle; }
        .events-table tr:hover td { background:rgba(201,146,43,.03); }
        .event-icon { font-size:18px; margin-right:8px; }
        .event-code { font-size:11px; background:rgba(232,96,10,.08); border:1px solid rgba(232,96,10,.15); color:#F5841F; padding:3px 10px; border-radius:6px; font-family:monospace; }

        /* Copy link */
        .copy-bar { display:flex; align-items:center; gap:12px; background:rgba(14,6,2,.88); border:1px solid rgba(201,146,43,.15); border-radius:14px; padding:12px 16px; margin-bottom:32px; flex-wrap:wrap; }
        .copy-url { flex:1; font-size:14px; color:var(--gl); font-weight:600; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .copy-btn { padding:8px 20px; border-radius:10px; background:linear-gradient(135deg,#E8600A,#C9922B); color:#fff; border:none; font-size:13px; font-weight:700; cursor:pointer; transition:.2s; white-space:nowrap; }
        .copy-btn:hover { opacity:.9; transform:translateY(-1px); }

        /* Section label */
        .section-label { font-size:10px; font-weight:700; color:var(--s); text-transform:uppercase; letter-spacing:.14em; margin-bottom:14px; display:flex; align-items:center; gap:8px; }
        .section-label::after { content:''; flex:1; height:1px; background:rgba(201,146,43,.12); }
        .section-title { font-family:var(--font-cormorant); font-size:clamp(22px,3.5vw,30px); font-weight:400; color:rgba(253,240,220,.95); margin-bottom:8px; }
        .section-title em { font-style:italic; color:var(--sl); }
        .section-sub { font-size:13px; color:rgba(200,175,140,.5); margin-bottom:28px; }

        @media(max-width:600px) {
          .adash-inner { padding:24px 16px 60px; }
          .adash-stats { grid-template-columns:repeat(2,1fr); }
          .tip-grid { grid-template-columns:1fr; }
          .share-grid { grid-template-columns:1fr; }
          .adash-tabs { gap:6px; }
          .adash-tab { padding:8px 14px; font-size:12px; }
          .events-table th:last-child, .events-table td:last-child { display:none; }
        }
      `}</style>

      <div className="adash">
        <div className="adash-inner">

          {/* ── HERO ── */}
          <div className="adash-hero">
            <div className="adash-badge">📊 Analytics & Growth Hub</div>
            <h1 className="adash-title">Your Traffic & <em>Analytics</em><br/>Command Center</h1>
            <p className="adash-sub">Track visitors, fix SEO gaps, and grow PoojaPath.ai from 0 to 1000+ daily users.</p>
          </div>

          {/* ── COPY LINK ── */}
          <div className="copy-bar">
            <span className="copy-url">🌐 {siteUrl}</span>
            <button className="copy-btn" onClick={copyLink}>
              {copied ? "✅ Copied!" : "📋 Copy Link"}
            </button>
            <a href="https://wa.me/?text=🙏 PoojaPath AI - Book Pandit Online, AI Mantra Guidance, Free Kundli! https://poojapath.ai" target="_blank" rel="noopener noreferrer" style={{ padding: "8px 16px", borderRadius: 10, background: "#25D366", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
              💬 Share on WhatsApp
            </a>
          </div>

          {/* ── TABS ── */}
          <div className="adash-tabs">
            {[
              { id: "overview", label: "📈 Overview" },
              { id: "seo",      label: "🔍 SEO Checklist" },
              { id: "share",    label: "📣 Share & Grow" },
              { id: "events",   label: "🎯 Key Events" },
            ].map(tab => (
              <button
                key={tab.id}
                className={`adash-tab${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ════ OVERVIEW TAB ════ */}
          {activeTab === "overview" && (
            <>
              {/* Stats */}
              <div className="adash-stats">
                {[
                  { val: "4",   lbl: "Active Users (7d)", trend: "↓ 50% vs last week", type: "dn" },
                  { val: "15",  lbl: "Total Events (7d)", trend: "↓ 44% vs last week", type: "dn" },
                  { val: "0",   lbl: "Key Events",        trend: "Set up tracking →",  type: "" },
                  { val: "4",   lbl: "New Users (7d)",    trend: "All users are new",  type: "" },
                  { val: "G-KTLHGZQ4LJ", lbl: "GA4 Measurement ID", trend: "✅ Active", type: "up" },
                  { val: "✅",  lbl: "Vercel Analytics",  trend: "Web Vitals tracking", type: "up" },
                ].map((s, i) => (
                  <div className="stat-card" key={i}>
                    <div className="stat-val" style={{ fontSize: s.val.length > 6 ? 16 : undefined }}>{s.val}</div>
                    <div className="stat-lbl">{s.lbl}</div>
                    <div className={`stat-trend ${s.type}`}>{s.trend}</div>
                  </div>
                ))}
              </div>

              {/* Action cards */}
              <div className="section-label">Action Items</div>
              <div className="tip-grid">
                {TRAFFIC_TIPS.map((tip, i) => (
                  <div className="tip-card" key={i}>
                    <span className={`tip-priority ${tip.priority}`}>{tip.priority}</span>
                    <span className="tip-icon">{tip.icon}</span>
                    <div className="tip-title">{tip.title}</div>
                    <div className="tip-status" style={{ color: tip.statusColor }}>{tip.status}</div>
                    <div className="tip-desc">{tip.desc}</div>
                    <a
                      href={tip.link === "#share" ? undefined : tip.link}
                      onClick={tip.link === "#share" ? copyLink : undefined}
                      target={tip.link === "#share" ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="tip-btn"
                    >
                      {tip.action}
                    </a>
                  </div>
                ))}
              </div>

              {/* Why no traffic box */}
              <div style={{ background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.2)", borderRadius: 18, padding: "28px 28px", marginTop: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#F59E0B", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>⚠️ Why No Traffic Yet?</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    ["1️⃣", "Google hasn't indexed your site yet", "Submit sitemap to Search Console. Takes 1–4 weeks for Google to crawl."],
                    ["2️⃣", "No social sharing done", "WhatsApp, Instagram, Facebook groups are your fastest traffic source RIGHT NOW."],
                    ["3️⃣", "No backlinks", "Share on Reddit (r/hinduism, r/india), Quora answers, temple blogs."],
                    ["4️⃣", "No ad spend", "Run ₹100/day Google Ads on 'online pandit booking' or 'book pandit near me'."],
                  ].map(([num, title, desc]) => (
                    <div key={num} style={{ display: "flex", gap: 14, padding: "12px 16px", background: "rgba(14,6,2,.6)", borderRadius: 12 }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{num}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(253,240,220,.9)", marginBottom: 3 }}>{title}</div>
                        <div style={{ fontSize: 12, color: "rgba(200,175,140,.55)", lineHeight: 1.5 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ════ SEO TAB ════ */}
          {activeTab === "seo" && (
            <>
              <div className="section-title">SEO <em>Health Check</em></div>
              <div className="section-sub">Complete these to get Google to find and rank your site.</div>

              {/* Progress bar */}
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(200,175,140,.5)" }}>
                <span>SEO Score</span>
                <span style={{ color: "#F2C96E", fontWeight: 700 }}>{SEO_CHECKLIST.filter(i => i.done).length}/{SEO_CHECKLIST.length} complete</span>
              </div>
              <div className="seo-progress">
                <div className="seo-bar" style={{ width: `${(SEO_CHECKLIST.filter(i => i.done).length / SEO_CHECKLIST.length) * 100}%` }} />
              </div>

              <div className="seo-list">
                {SEO_CHECKLIST.map((item, i) => (
                  <div className="seo-item" key={i}>
                    <div className={`seo-check ${item.done ? "done" : "todo"}`}>
                      {item.done ? "✓" : "○"}
                    </div>
                    <div className={`seo-text ${item.done ? "" : "todo"}`}>{item.text}</div>
                    {!item.done && (
                      <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", fontSize: 11, color: "#F59E0B", textDecoration: "none", whiteSpace: "nowrap", fontWeight: 600 }}>
                        Fix →
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Important step box */}
              <div style={{ background: "rgba(232,96,10,.06)", border: "1px solid rgba(232,96,10,.2)", borderRadius: 18, padding: "24px", marginTop: 32 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#F5841F", marginBottom: 16 }}>🎯 Most Important: Connect Google Search Console</div>
                <div style={{ fontSize: 13, color: "rgba(253,240,220,.7)", lineHeight: 1.8, marginBottom: 20 }}>
                  Without Search Console, Google can't find your site efficiently. Here's how:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                  {[
                    "Go to search.google.com/search-console",
                    "Click 'Add Property' → Enter: poojapath.ai",
                    "Choose 'HTML tag' verification method",
                    "Copy the verification meta tag",
                    "Add it to layout.tsx verification.google field",
                    "Submit sitemap: poojapath.ai/sitemap.xml",
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(232,96,10,.2)", color: "#F5841F", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                      <span style={{ fontSize: 12, color: "rgba(253,240,220,.75)", lineHeight: 1.5 }}>{step}</span>
                    </div>
                  ))}
                </div>
                <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg,#E8600A,#C9922B)", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                  🔍 Open Search Console →
                </a>
              </div>
            </>
          )}

          {/* ════ SHARE TAB ════ */}
          {activeTab === "share" && (
            <>
              <div className="section-title">Share & <em>Grow</em> Traffic</div>
              <div className="section-sub">Share on these platforms right now to get your first 100 visitors today.</div>

              <div className="share-grid">
                {QUICK_SHARES.map((s, i) => (
                  <div className="share-card" key={i} style={{ borderColor: `${s.color}22` }}>
                    <div className="share-name">{s.icon} {s.name}</div>
                    <div className="share-msg">{s.msg}</div>
                    <a
                      href={s.href(s.msg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="share-btn"
                      style={{ background: s.color }}
                    >
                      {s.icon} Share on {s.name}
                    </a>
                  </div>
                ))}

                {/* Manual share tips */}
                <div className="share-card" style={{ gridColumn: "1 / -1" }}>
                  <div className="share-name">🎯 Where to Share for Maximum Traffic</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginTop: 12 }}>
                    {[
                      { place: "WhatsApp Family Groups", tip: "Share link with 'AI se pooja booking karein' message", impact: "🔥 High" },
                      { place: "Temple WhatsApp Groups", tip: "Many temples have 100-500 member groups", impact: "🔥 High" },
                      { place: "Reddit r/hinduism", tip: "Post a helpful post about online puja booking", impact: "⚡ Medium" },
                      { place: "Quora", tip: "Answer 'how to book pandit online' questions", impact: "⚡ Medium" },
                      { place: "YouTube Community", tip: "Post on spiritual channels' communities", impact: "⚡ Medium" },
                      { place: "Facebook Spiritual Groups", tip: "Join Hindu spiritual groups (100k+ members)", impact: "🔥 High" },
                    ].map((item, i) => (
                      <div key={i} style={{ padding: "14px 16px", background: "rgba(255,255,255,.02)", borderRadius: 12, border: "1px solid rgba(201,146,43,.08)" }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(253,240,220,.85)", marginBottom: 4 }}>{item.place}</div>
                        <div style={{ fontSize: 11, color: "rgba(200,175,140,.5)", marginBottom: 6, lineHeight: 1.5 }}>{item.tip}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#F5841F" }}>Impact: {item.impact}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ════ EVENTS TAB ════ */}
          {activeTab === "events" && (
            <>
              <div className="section-title">Key Events <em>Tracking</em></div>
              <div className="section-sub">These GA4 events are already coded — they'll fire when users take actions.</div>

              <div style={{ background: "rgba(74,222,128,.05)", border: "1px solid rgba(74,222,128,.15)", borderRadius: 12, padding: "12px 18px", marginBottom: 24, fontSize: 12, color: "#4ADE80" }}>
                ✅ All events below are set up in your Analytics.tsx component and will appear in GA4 → Reports → Events
              </div>

              <div style={{ background: "rgba(14,6,2,.88)", border: "1px solid rgba(201,146,43,.1)", borderRadius: 18, overflow: "hidden" }}>
                <table className="events-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>GA4 Event Name</th>
                      <th>Triggers Where</th>
                    </tr>
                  </thead>
                  <tbody>
                    {KEY_EVENTS.map((ev, i) => (
                      <tr key={i}>
                        <td><span className="event-icon">{ev.icon}</span>{ev.label}</td>
                        <td><span className="event-code">{ev.event}</span></td>
                        <td style={{ fontSize: 12, color: "rgba(200,175,140,.5)" }}>{ev.where}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 32, background: "rgba(14,6,2,.6)", border: "1px solid rgba(201,146,43,.1)", borderRadius: 18, padding: "24px" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gl)", marginBottom: 16 }}>📊 How to See These Events in GA4</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    "Go to analytics.google.com → Your PoojaPath property",
                    "Left sidebar → Reports → Engagement → Events",
                    "Mark important events as 'Key Events' (conversions) for better tracking",
                    "Recommended to mark: signup, begin_checkout, purchase as Key Events",
                  ].map((step, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, fontSize: 13, color: "rgba(253,240,220,.7)", lineHeight: 1.5 }}>
                      <span style={{ color: "#F5841F", fontWeight: 700, flexShrink: 0 }}>→</span>
                      {step}
                    </div>
                  ))}
                </div>
                <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 20, padding: "12px 24px", borderRadius: 12, background: "linear-gradient(135deg,#E8600A,#C9922B)", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                  📊 Open Google Analytics →
                </a>
              </div>
            </>
          )}

          {/* Back link */}
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <Link href="/" style={{ color: "rgba(200,175,140,.4)", fontSize: 13, textDecoration: "none" }}>
              ← Back to PoojaPath Home
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
