"use client";

import React from "react";

export default function Community() {
  return (
    <section className="community">
      <div className="comm-in">
        <div className="sec-eye"><span>🤝</span> Live Global Jaap</div>
        <h2 className="sec-title">Collective <em>Consciousness</em></h2>
        <p className="sec-sub">See how our mantras are transforming lives globally in real-time.</p>

        <div className="comm-grid">
          <div className="comm-story">
            <div className="comm-meta">
              <span className="comm-tag">Wealth & Career</span>
              <span>•</span>
              <span>Anjali M., Bangalore</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#16a34a' }}>● Just Finished 108 Jaap</span>
            </div>
            <div className="comm-text">&quot;Got my promotion letter exactly 14 days after starting the specific Jupiter transit mantra given by the AI.&quot;</div>
            <div className="comm-result">Impact: 40% Salary Hike</div>
          </div>

          <div className="comm-story">
            <div className="comm-meta">
              <span className="comm-tag">Mental Peace</span>
              <span>•</span>
              <span>Priya S., London</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#16a34a' }}>● Chanting right now</span>
            </div>
            <div className="comm-text">&quot;The pronunciation audio is flawless. It feels like a real Pandit is sitting next to me. My anxiety levels have dropped significantly.&quot;</div>
            <div className="comm-result">Impact: Better Sleep Quality</div>
          </div>

          <div className="comm-story">
            <div className="comm-meta">
              <span className="comm-tag">Health</span>
              <span>•</span>
              <span>Rajiv K., Mumbai</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#16a34a' }}>● Finished 54 Jaap</span>
            </div>
            <div className="comm-text">&quot;The Mahamrityunjaya variation generated based on my Kundli Dasha helped me recover faster post-surgery.&quot;</div>
            <div className="comm-result">Impact: Speedy Recovery</div>
          </div>
        </div>
      </div>
    </section>
  );
}
