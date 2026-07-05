"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface SmokeParticle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  scale: number;
}

interface Petal {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  speedY: number;
}

export default function PujaThalPage() {
  const [selectedDeity, setSelectedDeity] = useState("shiva");
  const [diyaLit, setDiyaLit] = useState(true);
  const [incenseActive, setIncenseActive] = useState(true);
  const [bellRinging, setBellRinging] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [aartiCount, setAartiCount] = useState(0);
  const [blessingMessage, setBlessingMessage] = useState("");
  
  // Daan offering states
  const [daanModalOpen, setDaanModalOpen] = useState(false);
  const [daanMessage, setDaanMessage] = useState("");

  // Particle systems
  const [smoke, setSmoke] = useState<SmokeParticle[]>([]);
  const [petals, setPetals] = useState<Petal[]>([]);
  
  // Mouse tracking for Aarti circular motion
  const [isAartiDragging, setIsAartiDragging] = useState(false);
  const prevAngleRef = useRef<number | null>(null);
  const accumAngleRef = useRef(0);
  
  const smokeIdRef = useRef(0);
  const petalIdRef = useRef(0);

  const deities: Record<string, { name: string; bg: string; mantra: string; color: string }> = {
    shiva: { name: "Lord Shiva", bg: "/lord_shiva_bg.png", mantra: "ॐ नमः शिवाय", color: "from-[#1a0f0d] to-[#251510]" },
    rama: { name: "Lord Rama", bg: "/lord_rama_bg.png", mantra: "जय श्री राम", color: "from-[#221008] to-[#36180a]" },
    krishna: { name: "Lord Krishna", bg: "/lord_krishna_bg.png", mantra: "हरे कृष्ण", color: "from-[#081220] to-[#0a1c36]" },
    ganesha: { name: "Lord Ganesha", bg: "/lord_ganesha_bg.png", mantra: "ॐ गं गणपतये नमः", color: "from-[#200808] to-[#360a0a]" },
    hanuman: { name: "Lord Hanuman", bg: "/lord_hanuman_bg.png", mantra: "ॐ हनुमते नमः", color: "from-[#251005] to-[#3c1808]" }
  };

  const deityInfo = deities[selectedDeity] || deities["shiva"];

  // Web Audio API Synthesizers
  const playTempleBell = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // High resonant chime D5

      const overtone = audioCtx.createOscillator();
      const overtoneGain = audioCtx.createGain();
      overtone.type = "sine";
      overtone.frequency.setValueAtTime(1174.66, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.2);

      overtoneGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      overtone.connect(overtoneGain);
      overtoneGain.connect(audioCtx.destination);

      osc.start();
      overtone.start();
      osc.stop(audioCtx.currentTime + 2.2);
      overtone.stop(audioCtx.currentTime + 1.5);
    } catch (err) {}
  };

  // Incense Smoke Particle update loop
  useEffect(() => {
    if (!incenseActive) return;
    const interval = setInterval(() => {
      // Spawn smoke at incense base location (around x: 70%, y: 75% inside the thal)
      setSmoke(prev => [
        ...prev,
        {
          id: smokeIdRef.current++,
          x: 68 + Math.random() * 4,
          y: 72,
          opacity: 0.8,
          scale: 0.6 + Math.random() * 0.4
        }
      ]);
    }, 120);

    return () => clearInterval(interval);
  }, [incenseActive]);

  // Smoke motion update loop
  useEffect(() => {
    const smokeTimer = setInterval(() => {
      setSmoke(prev =>
        prev
          .map(p => ({
            ...p,
            y: p.y - 0.7, // drift up
            x: p.x + Math.sin(p.y / 8) * 0.25, // sway gently
            opacity: p.opacity - 0.012, // fade out
            scale: p.scale + 0.01 // expand
          }))
          .filter(p => p.opacity > 0)
      );
    }, 30);
    return () => clearInterval(smokeTimer);
  }, []);

  // Flower Petals update loop
  useEffect(() => {
    if (petals.length === 0) return;
    const petalTimer = setInterval(() => {
      setPetals(prev =>
        prev
          .map(p => ({
            ...p,
            y: p.y + p.speedY, // fall down
            x: p.x + Math.sin(p.y / 15) * 0.3, // drift horizontally
            rotation: p.rotation + 1.5
          }))
          .filter(p => p.y < 90) // remove at screen base
      );
    }, 30);
    return () => clearInterval(petalTimer);
  }, [petals.length]);

  const ringBell = () => {
    setBellRinging(true);
    playTempleBell();
    setTimeout(() => setBellRinging(false), 500);
  };

  const showerFlowers = () => {
    const newPetals: Petal[] = Array.from({ length: 12 }).map(() => ({
      id: petalIdRef.current++,
      x: 20 + Math.random() * 60, // random widths
      y: 0,
      rotation: Math.random() * 360,
      scale: 0.6 + Math.random() * 0.6,
      speedY: 2 + Math.random() * 3
    }));
    setPetals(prev => [...prev, ...newPetals]);
  };

  // Aarti motion tracking: circle detection
  const handleAartiStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsAartiDragging(true);
    prevAngleRef.current = null;
    accumAngleRef.current = 0;
  };

  const handleAartiMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isAartiDragging) return;

    // Get mouse/touch relative coordinates from center of the screen
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const box = e.currentTarget.getBoundingClientRect();
    const cX = box.left + box.width / 2;
    const cY = box.top + box.height / 2;

    const dx = clientX - cX;
    const dy = clientY - cY;
    const currentAngle = Math.atan2(dy, dx); // Angle in radians

    if (prevAngleRef.current !== null) {
      let delta = currentAngle - prevAngleRef.current;
      
      // Handle wrapping transitions (-PI to PI)
      if (delta > Math.PI) delta -= 2 * Math.PI;
      if (delta < -Math.PI) delta += 2 * Math.PI;

      accumAngleRef.current += delta;

      // Check if a full circle is completed (2 * PI radians ~ 6.28)
      if (Math.abs(accumAngleRef.current) >= 2 * Math.PI) {
        setAartiCount(prev => {
          const nextCount = prev + 1;
          if (nextCount === 7) {
            setBlessingMessage("✨ Hari Om! Aarti Sampann Huyi. May the divine light of Aarti bring peace, health, and prosperity to your home. Receive Deity Blessings! 🪔🙏");
          }
          return nextCount;
        });
        accumAngleRef.current = 0;
        playTempleBell();
      }
    }

    prevAngleRef.current = currentAngle;
  };

  const handleAartiEnd = () => {
    setIsAartiDragging(false);
  };

  const submitDaan = (option: string) => {
    setDaanMessage("Dhanya ho! Aapki puja sampann aur offering sweekar ki gayi. 🙏");
    setTimeout(() => {
      setDaanModalOpen(false);
      setDaanMessage("");
    }, 4500);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${deityInfo.color} text-cream flex flex-col font-sans relative overflow-hidden`}>
      
      {/* Background Deity Frame */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none transition-all duration-1000 opacity-20 z-0"
        style={{ backgroundImage: `url(${deityInfo.bg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/95 via-transparent to-bg z-0 pointer-events-none" />

      {/* Falling Flowers Canvas Overlay */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {petals.map(p => (
          <div
            key={p.id}
            className="absolute text-red-500 font-bold select-none text-2xl"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
              transition: "transform 0.05s linear",
              opacity: 0.95
            }}
          >
            🌸
          </div>
        ))}
      </div>

      {/* Incense Smoke Particles */}
      <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
        {smoke.map(s => (
          <div
            key={s.id}
            className="absolute w-4 h-4 bg-cream/15 rounded-full filter blur-[6px]"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              opacity: s.opacity,
              transform: `scale(${s.scale})`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="kundli-header px-6 py-4 flex items-center justify-between border-b border-brd bg-deep/50 backdrop-blur-md relative z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="kundli-back text-sm text-s hover:text-sl font-semibold">
            ← Back to PoojaPath
          </Link>
          <h1 className="text-xl font-bold bg-gradient-to-r from-s to-gl bg-clip-text text-transparent">
            Interactive Virtual Aarti
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDaanModalOpen(true)} className="kundli-pdf-btn">🪙 Perform Daan</button>
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="kundli-pdf-btn">{soundEnabled ? "🔊 Sound" : "🔇 Mute"}</button>
        </div>
      </header>

      {/* Interactive Main Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Side: Controls & Deity Selector */}
        <section className="lg:col-span-4 flex flex-col gap-6">
          
          <div className="bg-card-bg border border-brd rounded-2xl p-5 backdrop-blur-md">
            <h2 className="text-xs text-mut uppercase font-bold tracking-widest mb-3">Select Deity (देवता)</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(deities).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => { setSelectedDeity(key); setAartiCount(0); setBlessingMessage(""); }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border text-left ${
                    selectedDeity === key
                      ? "bg-s border-s text-white shadow-lg"
                      : "bg-deep/50 border-brd text-mut hover:text-cream"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card-bg border border-brd rounded-2xl p-5 backdrop-blur-md text-center">
            <div className="text-[10px] text-mut uppercase font-bold tracking-wider mb-1">Active Mantra Chanting</div>
            <div className="font-tiro text-2xl text-gl font-bold animate-pulse">{deityInfo.mantra}</div>
          </div>

          {/* Traditional Puja Offerings buttons */}
          <div className="bg-card-bg border border-brd rounded-2xl p-5 backdrop-blur-md flex flex-col gap-3">
            <h3 className="text-xs text-mut uppercase font-bold tracking-widest">Puja Offerings</h3>
            <button
              onClick={() => setDiyaLit(!diyaLit)}
              className="py-3 w-full bg-deep/80 hover:bg-s/10 border border-brd rounded-xl text-left px-4 text-xs font-semibold flex justify-between items-center"
            >
              <span>🪔 Toggle Diya Lamp</span>
              <span className="text-gl font-bold">{diyaLit ? "LIT" : "OFF"}</span>
            </button>
            <button
              onClick={() => setIncenseActive(!incenseActive)}
              className="py-3 w-full bg-deep/80 hover:bg-s/10 border border-brd rounded-xl text-left px-4 text-xs font-semibold flex justify-between items-center"
            >
              <span>🌾 Toggle Incense (Dhoop)</span>
              <span className="text-gl font-bold">{incenseActive ? "BURNING" : "OFF"}</span>
            </button>
            <button
              onClick={ringBell}
              className="py-3 w-full bg-deep/80 hover:bg-s/10 border border-brd rounded-xl text-left px-4 text-xs font-semibold flex justify-between items-center"
            >
              <span>🔔 Ring Temple Bell</span>
              <span className="text-gl font-bold">CLICK</span>
            </button>
            <button
              onClick={showerFlowers}
              className="py-3 w-full bg-deep/80 hover:bg-s/10 border border-brd rounded-xl text-left px-4 text-xs font-semibold flex justify-between items-center"
            >
              <span>🌸 Shower Flower Petals</span>
              <span className="text-gl font-bold">SHOWER</span>
            </button>
          </div>

        </section>

        {/* Right Side: Virtual Mandir Canvas */}
        <section className="lg:col-span-8 flex flex-col gap-6 items-center justify-center">
          
          {/* Virtual Deity Shrine and Drag Area */}
          <div
            onMouseDown={handleAartiStart}
            onMouseMove={handleAartiMove}
            onMouseUp={handleAartiEnd}
            onMouseLeave={handleAartiEnd}
            onTouchStart={handleAartiStart}
            onTouchMove={handleAartiMove}
            onTouchEnd={handleAartiEnd}
            className={`w-full max-w-[500px] aspect-square rounded-3xl border-2 border-gl/40 bg-gradient-to-br from-black/80 to-[#120701]/90 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center p-6 cursor-pointer ${
              isAartiDragging ? "border-s shadow-[0_0_40px_rgba(232,96,10,0.25)]" : ""
            }`}
          >
            
            {/* Interactive instructions */}
            <div className="absolute top-4 text-center pointer-events-none">
              <div className="text-[10px] text-gl uppercase font-bold tracking-widest">Aarti Mandap</div>
              <div className="text-[9px] text-mut mt-1">Hold and circle your mouse/finger on screen to perform Aarti.</div>
            </div>

            {/* Aarti completed display */}
            <div className="absolute top-14 bg-[#1e0f06]/80 px-4 py-1.5 border border-gl/20 rounded-full text-[10px] font-bold text-gl uppercase pointer-events-none">
              Aarti Rotations: {aartiCount} / 7
            </div>

            {/* Center deity frame */}
            <div className="relative w-56 h-56 rounded-2xl border-4 border-gl/60 overflow-hidden shadow-2xl bg-deep pointer-events-none mb-6">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${deityInfo.bg})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Floating Incense smoke source */}
            {incenseActive && (
              <div className="absolute bottom-[24%] right-[28%] pointer-events-none flex flex-col items-center">
                {/* Glowing ember tip */}
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ff0000] animate-pulse" />
                <div className="w-0.5 h-12 bg-zinc-600 rounded" />
              </div>
            )}

            {/* Diya Frame */}
            {diyaLit && (
              <div className="absolute bottom-[16%] left-[28%] pointer-events-none flex flex-col items-center">
                {/* Diya body */}
                <div className="w-8 h-4 bg-amber-800 rounded-b-full relative border border-amber-900">
                  {/* Glowing flame */}
                  <div className="absolute top-[-10px] left-1/2 transform -translate-x-1/2 w-4 h-6 bg-gradient-to-t from-red-500 via-amber-400 to-yellow-200 rounded-full animate-bounce shadow-[0_0_15px_rgba(251,191,36,0.8)]" style={{ transformOrigin: "bottom center" }} />
                </div>
              </div>
            )}

            {/* Bell animation wobbling */}
            <div
              onClick={ringBell}
              className={`absolute top-[22%] left-[16%] text-3xl transition-transform duration-300 pointer-events-auto ${
                bellRinging ? "animate-wiggle scale-110" : ""
              }`}
            >
              🔔
            </div>

          </div>

          {/* Blessing Success box */}
          {blessingMessage && (
            <div className="w-full max-w-[500px] p-5 bg-s/10 border border-s/30 rounded-2xl text-center text-xs text-gl leading-relaxed font-semibold animate-pulse shadow-xl">
              {blessingMessage}
            </div>
          )}

        </section>

      </main>

      {/* Daan Traditional Brass Thal Modal */}
      {daanModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={(e) => { if(e.target === e.currentTarget) setDaanModalOpen(false); }}>
          <div className="bg-gradient-to-b from-[#2a1708] to-[#1c0f05] border-2 border-gl rounded-2xl p-6 max-w-sm w-full text-center relative shadow-2xl">
            <button className="absolute top-3 right-3 text-mut hover:text-cream text-lg" onClick={() => setDaanModalOpen(false)}>✕</button>
            
            <div className="text-gl font-bold text-sm uppercase tracking-wider mb-2">🪙 Devotion Offering (Daan) 🪙</div>
            <p className="text-xs text-mut mb-6 leading-relaxed">
              Support temple Aarti and holy cow feeding at Kashi. Make a symbolic offering below.
            </p>

            {daanMessage ? (
              <div className="p-4 bg-s/10 border border-s/30 rounded-xl text-xs text-gl leading-relaxed font-semibold animate-pulse">
                {daanMessage}
              </div>
            ) : (
              <div className="space-y-3.5">
                <button
                  onClick={() => submitDaan("Gau Seva")}
                  className="w-full py-3 px-4 bg-deep/80 hover:bg-s/20 border border-brd hover:border-gl rounded-xl text-left flex justify-between items-center text-xs font-semibold text-cream transition-all"
                >
                  <span>🐄 Gau Seva (Feed Holy Cows)</span>
                  <span className="text-gl">₹51</span>
                </button>
                <button
                  onClick={() => submitDaan("Kashi Diya")}
                  className="w-full py-3 px-4 bg-deep/80 hover:bg-s/20 border border-brd hover:border-gl rounded-xl text-left flex justify-between items-center text-xs font-semibold text-cream transition-all"
                >
                  <span>🪔 Light Diya at Ganga Ghat (Kashi)</span>
                  <span className="text-gl">₹101</span>
                </button>
                <button
                  onClick={() => submitDaan("Pushpa Arpan")}
                  className="w-full py-3 px-4 bg-deep/80 hover:bg-s/20 border border-brd hover:border-gl rounded-xl text-left flex justify-between items-center text-xs font-semibold text-cream transition-all"
                >
                  <span>🌸 Pushpa Arpan (Offer Flowers)</span>
                  <span className="text-gl">Manas Offer (Free)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.3s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
}
