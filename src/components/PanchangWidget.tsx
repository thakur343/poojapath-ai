"use client";

import { useState, useEffect, useRef } from "react";

const HINDU_MONTHS = [
  "Chaitra","Vaishakha","Jyeshtha","Ashadha","Shravana","Bhadrapada",
  "Ashwin","Kartika","Margashirsha","Pausha","Magha","Phalguna"
];

const WEEKDAYS = ["Ravivar","Somvar","Mangalvar","Budhvar","Guruvar","Shukravar","Shanivar"];
const DEITIES  = ["Surya Dev","Shiv Ji","Hanuman Ji","Ganesh Ji","Vishnu Ji","Lakshmi Ji","Shani Dev"];
const DEITY_EMOJI = ["☀️","🔱","🙏","🐘","🪷","🌸","⚖️"];

function getDayData() {
  const now   = new Date();
  const day   = now.getDay(); // 0=Sun
  const month = now.getMonth();
  const date  = now.getDate();
  const year  = now.getFullYear();

  // Simple Tithi approximation (cycles every ~30 days from new moon)
  const lunarDay = ((date + month * 30) % 30) + 1;
  const paksha   = lunarDay <= 15 ? "Shukla Paksha" : "Krishna Paksha";
  const tithiNames = ["Pratipada","Dwitiya","Tritiya","Chaturthi","Panchami",
    "Shashthi","Saptami","Ashtami","Navami","Dashami","Ekadashi","Dwadashi",
    "Trayodashi","Chaturdashi","Purnima / Amavasya"];
  const tithiIndex = ((lunarDay - 1) % 15);
  const tithi = tithiNames[tithiIndex] || "Purnima";

  // Nakshatra (27 nakshatras cycle over 27 days)
  const nakshatras = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
    "Punarvasu","Pushya","Ashlesha","Magha","P. Phalguni","U. Phalguni","Hasta",
    "Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Moola","P. Ashadha",
    "U. Ashadha","Shravana","Dhanishtha","Shatabhisha","P. Bhadrapada","U. Bhadrapada","Revati"];
  const nakshatra = nakshatras[(date + month * 3 + day) % 27];

  // Rahu Kaal per day (approximate hours)
  const rahuKaal = ["4:30–6:00","7:30–9:00","3:00–4:30","12:00–1:30","1:30–3:00","10:30–12:00","9:00–10:30"][day];

  const hinduMonth = HINDU_MONTHS[month];
  const weekday    = WEEKDAYS[day];
  const deity      = DEITIES[day];
  const deityEmoji = DEITY_EMOJI[day];

  const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months   = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const engDate  = `${weekdays[day]}, ${months[month]} ${date}, ${year}`;

  return { weekday, deity, deityEmoji, engDate, hinduMonth, paksha, tithi, nakshatra, rahuKaal, day };
}

// Build a mini month calendar grid
function buildCalendar(date: Date) {
  const year  = date.getFullYear();
  const month = date.getMonth();
  const today = date.getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return { cells, today, month, year };
}

export default function PanchangWidget() {
  const [open, setOpen]     = useState(false);
  const [data]              = useState(getDayData);
  const [cal]               = useState(() => buildCalendar(new Date()));
  const [isMobile, setIsMobile] = useState(false);
  const timerRef            = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleMouseEnter = () => {
    if (isMobile) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    timerRef.current = setTimeout(() => setOpen(false), 300);
  };

  const handleClick = () => {
    if (isMobile) setOpen(o => !o);
  };

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  return (
    <>
      <style>{`
        .pw-wrap {
          position: fixed;
          right: 16px;
          top: 72px;
          z-index: 200;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        /* ── Collapsed pill ── */
        .pw-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: rgba(10,5,2,0.92);
          border: 1px solid rgba(200,145,60,0.25);
          border-radius: 40px;
          cursor: pointer;
          backdrop-filter: blur(18px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
          user-select: none;
          white-space: nowrap;
          animation: pwFadeIn 0.8s 0.5s cubic-bezier(.16,1,.3,1) both;
        }
        .pw-pill:hover {
          border-color: rgba(200,145,60,0.55);
          box-shadow: 0 6px 30px rgba(200,145,60,0.15);
          transform: translateY(-1px);
        }
        .pw-pill-icon {
          font-size: 16px;
          animation: pillSpin 4s linear infinite;
          display: inline-block;
        }
        .pw-pill-text {
          font-size: 11px;
          font-weight: 600;
          color: rgba(242,201,110,0.9);
          letter-spacing: 0.03em;
        }
        .pw-pill-sub {
          font-size: 9px;
          color: rgba(200,175,140,0.5);
          margin-left: 2px;
        }
        .pw-pill-arrow {
          font-size: 9px;
          color: rgba(200,145,60,0.5);
          transition: transform 0.3s;
          margin-left: 2px;
        }
        .pw-pill-arrow.open { transform: rotate(180deg); }

        /* ── Expanded card ── */
        .pw-card {
          margin-top: 8px;
          width: 250px;
          background: rgba(8,4,2,0.97);
          border: 1px solid rgba(200,145,60,0.2);
          border-radius: 20px;
          padding: 16px;
          backdrop-filter: blur(28px);
          box-shadow: 0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(200,145,60,0.05);
          transform-origin: top right;
          transform: scaleY(0) scaleX(0.95);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.35s cubic-bezier(.16,1,.3,1), opacity 0.3s ease;
        }
        .pw-card.open {
          transform: scaleY(1) scaleX(1);
          opacity: 1;
          pointer-events: auto;
        }

        /* Card header */
        .pw-card-hd {
          text-align: center;
          border-bottom: 1px solid rgba(200,145,60,0.1);
          padding-bottom: 10px;
          margin-bottom: 12px;
        }
        .pw-card-deity {
          font-size: 22px;
          margin-bottom: 2px;
          display: block;
          animation: deityFloat 3s ease-in-out infinite;
        }
        .pw-card-title {
          font-family: var(--font-cormorant, serif);
          font-size: 13px;
          font-weight: 700;
          color: rgba(242,201,110,0.95);
          display: block;
        }
        .pw-card-sub {
          font-size: 9px;
          color: rgba(200,175,140,0.45);
          margin-top: 2px;
          display: block;
        }

        /* Info rows */
        .pw-card-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          border-bottom: 1px solid rgba(200,145,60,0.05);
          font-size: 10px;
        }
        .pw-card-row:last-child { border-bottom: none; }
        .pw-card-lbl { color: rgba(200,175,140,0.45); font-weight: 500; }
        .pw-card-val { color: rgba(253,240,220,0.85); text-align: right; max-width: 130px; font-size: 10px; }

        /* Muhurat badge */
        .pw-muhurat {
          margin-top: 10px;
          padding: 7px 10px;
          background: rgba(232,96,10,0.07);
          border: 1px solid rgba(232,96,10,0.15);
          border-radius: 10px;
          font-size: 9.5px;
          color: rgba(242,201,110,0.8);
          text-align: center;
          line-height: 1.5;
          font-weight: 500;
        }

        /* Mini Calendar */
        .pw-cal {
          margin-top: 12px;
          border-top: 1px solid rgba(200,145,60,0.08);
          padding-top: 12px;
        }
        .pw-cal-hd {
          font-size: 10px;
          font-weight: 700;
          color: rgba(200,145,60,0.7);
          text-align: center;
          margin-bottom: 8px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .pw-cal-grid {
          display: grid;
          grid-template-columns: repeat(7,1fr);
          gap: 2px;
          text-align: center;
        }
        .pw-cal-dow {
          font-size: 8px;
          color: rgba(200,175,140,0.35);
          font-weight: 600;
          padding: 2px 0;
          text-transform: uppercase;
        }
        .pw-cal-cell {
          font-size: 9px;
          color: rgba(200,175,140,0.5);
          padding: 4px 2px;
          border-radius: 6px;
          transition: background 0.2s, color 0.2s;
          cursor: default;
          position: relative;
        }
        .pw-cal-cell:hover:not(.empty) {
          background: rgba(200,145,60,0.1);
          color: rgba(253,240,220,0.85);
        }
        .pw-cal-cell.today {
          background: rgba(232,96,10,0.2);
          color: #F5841F;
          font-weight: 800;
          border: 1px solid rgba(232,96,10,0.35);
          border-radius: 8px;
        }
        .pw-cal-cell.today::after {
          content: '';
          position: absolute;
          bottom: 2px; left: 50%; transform: translateX(-50%);
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #F5841F;
        }

        /* Animations */
        @keyframes pwFadeIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pillSpin {
          0%   { transform: rotate(0deg); }
          25%  { transform: rotate(15deg); }
          75%  { transform: rotate(-10deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes deityFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }

        @media (max-width: 768px) {
          .pw-wrap { right: 12px; top: 66px; }
          .pw-card { width: 220px; }
        }
      `}</style>

      <div
        className="pw-wrap"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Collapsed Pill */}
        <div className="pw-pill" onClick={handleClick} id="panchang-pill">
          <span className="pw-pill-icon">📅</span>
          <span>
            <span className="pw-pill-text">{data.weekday}</span>
            <span className="pw-pill-sub"> · {data.deityEmoji} {data.deity}</span>
          </span>
          <span className={`pw-pill-arrow ${open ? "open" : ""}`}>▼</span>
        </div>

        {/* Expanded Card */}
        <div className={`pw-card ${open ? "open" : ""}`} id="panchang-card">
          {/* Header */}
          <div className="pw-card-hd">
            <span className="pw-card-deity">{data.deityEmoji}</span>
            <span className="pw-card-title">🕉️ Aaj ka Panchang</span>
            <span className="pw-card-sub">{data.engDate}</span>
            <span className="pw-card-sub" style={{ color: "rgba(242,201,110,0.5)", marginTop: 2 }}>
              {data.hinduMonth} · {data.paksha}
            </span>
          </div>

          {/* Info rows */}
          <div className="pw-card-row">
            <span className="pw-card-lbl">Tithi</span>
            <span className="pw-card-val">{data.tithi}</span>
          </div>
          <div className="pw-card-row">
            <span className="pw-card-lbl">Nakshatra</span>
            <span className="pw-card-val">{data.nakshatra}</span>
          </div>
          <div className="pw-card-row">
            <span className="pw-card-lbl">Rahu Kaal</span>
            <span className="pw-card-val" style={{ color: "rgba(248,113,113,0.8)" }}>⚠️ {data.rahuKaal}</span>
          </div>
          <div className="pw-card-row">
            <span className="pw-card-lbl">Aaj ke Dev</span>
            <span className="pw-card-val">{data.deityEmoji} {data.deity}</span>
          </div>

          {/* Shubh Muhurat badge */}
          <div className="pw-muhurat">
            ✨ Shubh Muhurat<br />
            <strong style={{ color: "rgba(242,201,110,0.9)" }}>11:45 AM – 12:30 PM</strong><br />
            <span style={{ opacity: 0.6 }}>Abhijit Muhurat</span>
          </div>

          {/* Mini Calendar */}
          <div className="pw-cal">
            <div className="pw-cal-hd">{MONTH_NAMES[cal.month]} {cal.year}</div>
            <div className="pw-cal-grid">
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                <div key={d} className="pw-cal-dow">{d}</div>
              ))}
              {cal.cells.map((cell, i) => (
                <div
                  key={i}
                  className={`pw-cal-cell${cell === null ? " empty" : ""}${cell === cal.today ? " today" : ""}`}
                >
                  {cell ?? ""}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
