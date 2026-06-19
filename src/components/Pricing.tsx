"use client";

import React from "react";

interface PricingProps {
  onBookPandit?: () => void;
}

export default function Pricing({ onBookPandit }: PricingProps) {
  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="pricing" id="pricing-sec">
      <div className="pricing-in">
        <div className="sec-eye"><span>💎</span> Transparent Dakshina</div>
        <h2 className="sec-title">Spiritual <em>Investment</em></h2>
        <p className="sec-sub">Affordable access to authentic Vedic wisdom, powered by technology.</p>

        <div className="price-grid">
          <div className="price-card">
            <span className="price-emoji">🪔</span>
            <div className="price-name">Personalized Mantra</div>
            <div className="price-desc">One-time generation based on your current astrological transit.</div>
            <div className="price-amt">₹51</div>
            <div className="price-freq">One-time Dakshina</div>
            
            <ul className="price-list">
              <li>1 Precise Sanskrit Mantra</li>
              <li>Audio Pronunciation Guide</li>
              <li>Meaning & Significance</li>
              <li>Basic Kundli Snapshot</li>
              <li>Digital Jaap Counter</li>
            </ul>
            
            <button className="price-btn pb1" onClick={() => scrollToSection('#form-sec')}>Get Your Mantra</button>
          </div>

          <div className="price-card pop">
            <span className="price-emoji">🧘‍♂️</span>
            <div className="price-name">AI Pandit Live Pooja</div>
            <div className="price-desc">Interactive, real-time spiritual guidance and custom pooja rituals.</div>
            <div className="price-amt">₹501</div>
            <div className="price-freq">Per Session (30 mins)</div>
            
            <ul className="price-list">
              <li>Live 2-way Voice Interaction</li>
              <li>Customized Sankalpa</li>
              <li>Real-time Pronunciation Correction</li>
              <li>Detailed PDF Report after session</li>
              <li>Priority Support</li>
            </ul>
            
            <button className="price-btn pb2" onClick={onBookPandit || (() => window.location.href='/guru')}>Book AI Pandit</button>
          </div>

          <div className="price-card">
            <span className="price-emoji">♾️</span>
            <div className="price-name">Lifetime Access</div>
            <div className="price-desc">Unlimited mantras, daily muhurat alerts, and ad-free darshan.</div>
            <div className="price-amt">₹2100</div>
            <div className="price-freq">Billed Once, Forever Yours</div>
            
            <ul className="price-list">
              <li>Unlimited Mantra Generations</li>
              <li>Unlimited Kundli Matchings</li>
              <li>Ad-Free Live Darshan (4K)</li>
              <li>Daily Shubh Muhurat WhatsApp Alerts</li>
              <li>1 Free AI Pandit Session/Year</li>
            </ul>
            
            <button className="price-btn pb3">Join Premium Waitlist</button>
          </div>
        </div>
      </div>
    </section>
  );
}
