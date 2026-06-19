"use client";

import React, { useState } from "react";

export default function Testimonials() {
  const [filter, setFilter] = useState("all");

  const testimonials = [
    { cat: "health", icon: "🌿", tag: "Health & Healing", text: "I was suffering from chronic stress. The personalized Gayatri mantra variation changed my aura completely.", name: "Dr. Meera N.", title: "Surgeon, Delhi" },
    { cat: "wealth", icon: "💰", tag: "Wealth", text: "Started chanting the exact Mahalakshmi mantra given by the AI during my Jupiter dasha. My startup just closed its seed round.", name: "Karan S.", title: "Founder, Tech Startup" },
    { cat: "peace", icon: "🕊️", tag: "Peace", text: "The pronunciation guide is what sets this apart. I've been chanting wrong for 20 years. Finally felt the vibration.", name: "Ramesh P.", title: "Retd. Banker" }
  ];

  const filtered = filter === "all" ? testimonials : testimonials.filter(t => t.cat === filter);

  return (
    <section className="testi">
      <div className="testi-in">
        <div className="sec-eye"><span>✨</span> 100,000+ Blessed Souls</div>
        <h2 className="sec-title">Stories of <em>Transformation</em></h2>
        <p className="sec-sub">Real experiences from our global community.</p>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
          <button className={`tf ${filter === "all" ? "act" : ""}`} onClick={() => setFilter("all")}>All</button>
          <button className={`tf ${filter === "health" ? "act" : ""}`} onClick={() => setFilter("health")}>Health</button>
          <button className={`tf ${filter === "wealth" ? "act" : ""}`} onClick={() => setFilter("wealth")}>Wealth</button>
          <button className={`tf ${filter === "peace" ? "act" : ""}`} onClick={() => setFilter("peace")}>Peace</button>
        </div>

        <div className="tgrid">
          {filtered.map((t, i) => (
            <div key={i} className="tc">
              <div className="tc-cat">{t.icon} {t.tag}</div>
              <div className="tc-stars">★★★★★</div>
              <div className="tc-q">&quot;{t.text}&quot;</div>
              <div className="tc-p">
                <div className="tc-av" style={{ background: `linear-gradient(135deg, var(--s), ${t.cat === 'health' ? '#16a34a' : t.cat === 'wealth' ? '#DAA520' : '#4f46e5'})` }}>
                  {t.name[0]}
                </div>
                <div>
                  <div className="tc-nm">{t.name}</div>
                  <div className="tc-mt">{t.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
