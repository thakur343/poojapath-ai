"use client";

import React, { useState } from "react";

export default function Darshan() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [selectedName, setSelectedName] = useState("");

  const darshanList = [
    { name: "Kashi Vishwanath", id: "akev6jIaV5c", hi: "काशी विश्वनाथ", loc: "Varanasi, UP", desc: "The Golden Temple of Lord Shiva.", aarti: "Next Aarti: 6:00 PM (Mangala)", live: true, popular: true },
    { name: "Mahakaleshwar", id: "J3lL79FoDcU", hi: "महाकालेश्वर", loc: "Ujjain, MP", desc: "The only south-facing Jyotirlinga.", aarti: "Next Aarti: 4:00 AM (Bhasma)", live: true, popular: false },
    { name: "Somnath", id: "J4z7CIrvsww", hi: "सोमनाथ", loc: "Veraval, Gujarat", desc: "First among the twelve Jyotirlingas.", aarti: "Next Aarti: 7:00 PM (Sandhya)", live: true, popular: false },
    { name: "Kedarnath", id: "9mVwbHeqglU", hi: "केदारनाथ", loc: "Rudraprayag, UK", desc: "The highest Jyotirlinga in the Himalayas.", aarti: "Next Aarti: 6:30 AM (Maha)", live: true, popular: false },
    { name: "Ram Mandir", id: "gA_JpsSjySs", hi: "राम मंदिर", loc: "Ayodhya, UP", desc: "Birthplace of Lord Rama.", aarti: "Next Aarti: 6:30 AM (Shringar)", live: true, popular: true },
    { name: "Badrinath", id: "4njsfQEbrdc", hi: "बद्रीनाथ", loc: "Chamoli, UK", desc: "One of the Chardham pilgrimage sites.", aarti: "Next Aarti: 6:30 AM (Maha)", live: true, popular: false }
  ];

  const openModal = (id: string, name: string) => {
    setSelectedVideo(id);
    setSelectedName(name);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedVideo("");
  };

  return (
    <>
      <section className="darshan" id="darshan-sec">
        <div className="darshan-in">
          <div className="sec-eye"><span>🕉️</span> 24/7 Live Stream</div>
          <h2 className="sec-title">Divine <em>Darshan</em></h2>
          <p className="sec-sub">Connect with the Supreme from anywhere in the world. High-definition live feeds directly from the sanctum sanctorum.</p>

          <div className="dgrid">
            {darshanList.map((d, i) => (
              <div key={i} className={`dcard ${d.popular ? 'hl' : ''}`} onClick={() => openModal(d.id, d.name)}>
                <div className="dthumb">
                  {d.popular && <div className="dnew">MOST POPULAR</div>}
                  {d.live && (
                    <div className="dlive">
                      <div className="dlive-dot"></div> LIVE
                    </div>
                  )}
                  <div className="dthumb-ic">🪔</div>
                </div>
                <div className="dinfo">
                  <div className="dname">{d.name}</div>
                  <div className="dhi">{d.hi}</div>
                  <div className="dloc">📍 {d.loc}</div>
                  <div className="ddesc">{d.desc}</div>
                  <div className="daarti">{d.aarti}</div>
                  <button className="dwbtn">Watch Live Darshan</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {modalOpen && (
        <div className="dmodal show" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="dmodal-box">
            <button className="dmodal-close" onClick={closeModal}>✕</button>
            <div className="dmodal-name">{selectedName} Live Darshan</div>
            <iframe 
              className="dmodal-iframe" 
              src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&mute=1`} 
              allow="autoplay; encrypted-media" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
}
