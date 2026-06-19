"use client";

import Link from "next/link";

export default function Navbar() {
  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav>
      <div className="nlogo">
        🪔 PoojaPath<span>.ai</span>
      </div>
      <div className="nlinks">
        <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
          🕉️ Home
        </Link>
        <Link href="/pandit" style={{ color: "inherit", textDecoration: "none" }}>
          🧘 Pandit Ji AI
        </Link>
        <Link href="/jaap" style={{ color: "inherit", textDecoration: "none" }}>
          📿 Nama Jaap
        </Link>
        <Link href="/kundli" style={{ color: "inherit", textDecoration: "none" }}>
          📊 Janam Kundli
        </Link>
        <button onClick={() => scrollToSection("#darshan-sec")} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit', padding: 0 }}>
          🙏 Live Darshan
        </button>
        <button onClick={() => scrollToSection("#pricing-sec")} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', font: 'inherit', padding: 0 }}>
          💎 Pricing
        </button>
      </div>
      <div style={{ display: "flex", gap: "6px" }}>
        <button className="nbtn nb1" onClick={() => scrollToSection("#form-sec")}>
          Get Mantra — ₹51
        </button>
        <button className="nbtn nb2" onClick={() => scrollToSection("#darshan-sec")}>
          🕉️ Live Darshan
        </button>
      </div>
    </nav>
  );
}
