"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function Tools() {
  const [kundliName, setKundliName] = useState("");
  const [kundliDob, setKundliDob] = useState("");
  const [muhuratDate, setMuhuratDate] = useState("");
  const [kundliResult, setKundliResult] = useState(false);
  const [muhuratResult, setMuhuratResult] = useState(false);

  const handleKundli = (e: React.FormEvent) => {
    e.preventDefault();
    if (kundliName && kundliDob) {
      setKundliResult(true);
    }
  };

  const handleMuhurat = (e: React.FormEvent) => {
    e.preventDefault();
    if (muhuratDate) {
      setMuhuratResult(true);
    }
  };

  return (
    <section className="tools" id="tools-sec">
      <div className="tools-in">
        <div className="sec-eye"><span>✨</span> Free Utilities</div>
        <h2 className="sec-title">Everyday <em>Jyotish</em></h2>
        <p className="sec-sub">Quick, accurate astrological tools for your daily life.</p>

        <div className="tool-grid">
          <div className="tool-card">
            <span className="tool-emoji">📜</span>
            <div className="tool-name">Instant Kundli Snapshot</div>
            <div className="tool-desc">Enter your details for a quick overview of your Ascendant, Moon Sign, and current planetary periods.</div>
            <form className="tool-form" onSubmit={handleKundli}>
              <input type="text" placeholder="Full Name" required value={kundliName} onChange={(e) => setKundliName(e.target.value)} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="date" required style={{ flex: 1 }} value={kundliDob} onChange={(e) => setKundliDob(e.target.value)} />
                <input type="time" style={{ flex: 1 }} />
              </div>
              <button type="submit" className="tool-btn">Generate Snapshot</button>
            </form>
            
            {kundliResult && (
              <div className="tool-result show">
                <div style={{ fontSize: '11px', color: 'rgba(200,175,140,0.6)', marginBottom: '4px' }}>Analysis for {kundliName}</div>
                <div style={{ fontWeight: 600, color: 'var(--sl)', fontSize: '14px', marginBottom: '8px' }}>Lagna: Leo (Simha)</div>
                <div style={{ fontSize: '12px', color: 'rgba(253,240,220,0.8)' }}>
                  Sun is in your 10th house. Excellent time for career growth and leadership roles. Beware of ego clashes.
                </div>
              </div>
            )}
          </div>

          <div className="tool-card">
            <span className="tool-emoji">⏳</span>
            <div className="tool-name">Shubh Muhurat Finder</div>
            <div className="tool-desc">Planning something important? Find the most auspicious time window for your location today.</div>
            <form className="tool-form" onSubmit={handleMuhurat}>
              <input type="date" required value={muhuratDate} onChange={(e) => setMuhuratDate(e.target.value)} />
              <input type="text" placeholder="City (e.g. New Delhi)" required />
              <button type="submit" className="tool-btn">Find Muhurat</button>
            </form>
            
            {muhuratResult && (
              <div className="tool-result show">
                <div style={{ fontSize: '11px', color: 'rgba(200,175,140,0.6)', marginBottom: '4px' }}>Auspicious timings for selected date</div>
                <div style={{ fontWeight: 600, color: '#4ade80', fontSize: '13px', marginBottom: '4px' }}>Abhijit Muhurat: 11:45 AM - 12:32 PM</div>
                <div style={{ fontWeight: 600, color: '#f87171', fontSize: '13px', marginTop: '8px' }}>Avoid Rahu Kaal: 01:30 PM - 03:00 PM</div>
              </div>
            )}
          </div>

          <div className="tool-card flex flex-col justify-between">
            <div>
              <span className="tool-emoji">📿</span>
              <div className="tool-name">Nama Jaap Counter</div>
              <div className="tool-desc">Practice chanting with a digital jaap mala. Choose from multiple Vedic mantras, track streaks, and build daily devotion.</div>
            </div>
            <div style={{ marginTop: "16px" }}>
              <Link href="/jaap" className="tool-btn block text-center no-underline font-semibold py-3 rounded-xl bg-s hover:bg-sl text-white shadow-md transition-all">
                Start Chanting 🙏
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
