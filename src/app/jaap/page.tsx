"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/firebase/AuthProvider";

interface MantraItem {
  id: string;
  name: string;
  sanskrit: string;
  englishMatch: string;
  translation: string;
  deity: string;
  bgImage: string;
}

const MANTRAS: MantraItem[] = [
  {
    id: "ram",
    name: "Ram Ram",
    sanskrit: "राम",
    englishMatch: "ram",
    translation: "The sacred name of Lord Rama, representing pure consciousness and righteousness.",
    deity: "Rama",
    bgImage: "/lord_rama_bg.png"
  },
  {
    id: "shiva",
    name: "Om Namah Shivaya",
    sanskrit: "ॐ नमः शिवाय",
    englishMatch: "om namah shivaya",
    translation: "Adorations to Lord Shiva, the transformative power of the cosmos.",
    deity: "Shiva",
    bgImage: "/lord_shiva_bg.png"
  },
  {
    id: "krishna",
    name: "Mahamantra (Hare Krishna)",
    sanskrit: "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे हरे राम हरे राम राम राम हरे हरे",
    englishMatch: "hare krishna",
    translation: "Chanting the divine names of Krishna and Rama to awaken consciousness.",
    deity: "Krishna & Rama",
    bgImage: "/lord_krishna_bg.png"
  },
  {
    id: "ganesha",
    name: "Om Gam Ganapataye Namah",
    sanskrit: "ॐ गं गणपतये नमः",
    englishMatch: "om gam ganapataye namah",
    translation: "Salutations to the Lord of Obstacle Removal and Intellect.",
    deity: "Ganesha",
    bgImage: "/lord_ganesha_bg.png"
  },
  {
    id: "hanuman",
    name: "Om Hanumate Namah",
    sanskrit: "ॐ हनुमते नमः",
    englishMatch: "om hanumate namah",
    translation: "Salutations to Lord Hanuman, the embodiment of strength, devotion, and courage.",
    deity: "Hanuman",
    bgImage: "/lord_hanuman_bg.png"
  },
];

interface Particle {
  id: number;
  text: string;
  x: number;
  y: number;
}

export default function JaapPage() {
  const { user } = useAuth();
  const userEmail = user?.email || "guest";

  const [mode, setMode] = useState<"chant" | "write">("write");
  const [selectedMantra, setSelectedMantra] = useState<MantraItem>(MANTRAS[0]);
  const [count, setCount] = useState(0);
  const [totalChants, setTotalChants] = useState(0);
  const [streak, setStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Likhit states
  const [typedText, setTypedText] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);

  // Daan states
  const [daanModalOpen, setDaanModalOpen] = useState(false);
  const [daanSelected, setDaanSelected] = useState<string | null>(null);
  const [daanMessage, setDaanMessage] = useState("");
  const [paywallActive, setPaywallActive] = useState(false);
  const [actionCount, setActionCount] = useState(0);

  // Load stats from Backend on mount & when user changes
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`https://poojapath-backend.onrender.com/api/jaap/stats?email=${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const data = await res.json();
          setTotalChants(data.total_chants);
          setStreak(data.streak);
        }
      } catch (err) {
        console.warn("Could not fetch jaap stats from backend:", err);
      }
    }
    fetchStats();
  }, [userEmail]);

  // Web Audio API Synthesizers
  const playTempleBell = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(528, audioCtx.currentTime); 

      const overtone = audioCtx.createOscillator();
      const overtoneGain = audioCtx.createGain();
      overtone.type = "sine";
      overtone.frequency.setValueAtTime(1056, audioCtx.currentTime); 

      gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);

      overtoneGain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      overtone.connect(overtoneGain);
      overtoneGain.connect(audioCtx.destination);

      osc.start();
      overtone.start();
      osc.stop(audioCtx.currentTime + 1.8);
      overtone.stop(audioCtx.currentTime + 1.2);
    } catch (err) {
      console.warn("Audio synthesis context blocked/failed:", err);
    }
  };

  const playBeadSlide = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(120, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch(e){}
  };

  // Sync / Save Jaap Session to Backend
  const saveJaapSession = async (chantCount: number) => {
    try {
      const res = await fetch("https://poojapath-backend.onrender.com/api/jaap/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          mantra_id: selectedMantra.id,
          count: chantCount
        })
      });
      if (res.ok) {
        const data = await res.json();
        setTotalChants(data.total_chants);
        setStreak(data.streak);
      }
    } catch (err) {
      console.warn("Could not save jaap session to backend:", err);
    }
  };

  // Trigger floating particle animation
  const spawnParticle = (text: string) => {
    const id = particleIdRef.current++;
    const x = 30 + Math.random() * 40; 
    const y = 50 + Math.random() * 20;
    const newParticle: Particle = { id, text, x, y };
    setParticles(prev => [...prev, newParticle]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 2500);
  };

  const checkPaywall = () => {
    const currentActions = actionCount + 1;
    setActionCount(currentActions);
    if (currentActions >= 2) {
      setPaywallActive(true);
      return true; // blocked
    }
    return false; // allowed
  };

  const handleChant = () => {
    if (checkPaywall()) return;

    setAnimating(true);
    setTimeout(() => setAnimating(false), 120);

    playBeadSlide();
    spawnParticle(selectedMantra.sanskrit);

    const newCount = count + 1;
    setCount(newCount);
    saveJaapSession(1);

    if (newCount % 108 === 0) {
      setRoundCompleted(true);
      playTempleBell();
      setTimeout(playTempleBell, 200);
      setDaanModalOpen(true); // Open Daan window on completed round!
    }
  };

  const handleWritingInput = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTypedText(value);

    const lastWord = value.trim().split(/\s+/).pop()?.toLowerCase() || "";
    const skWord = selectedMantra.sanskrit.trim();
    const engWord = selectedMantra.englishMatch.toLowerCase();

    if (
      value.endsWith(skWord) || 
      (engWord.length > 1 && value.toLowerCase().endsWith(engWord))
    ) {
      // Content Moderation check
      try {
        const response = await fetch("https://poojapath-backend.onrender.com/api/moderation/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: lastWord })
        });
        const mod = await response.json();
        if (mod.is_abusive) {
          setTypedText("");
          alert("Abusive content detected and deleted! Please maintain the sanctity of Likhit Jaap. 🙏");
          return;
        }
      } catch (err) {}

      if (checkPaywall()) return;

      playBeadSlide();
      spawnParticle(selectedMantra.sanskrit);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 120);

      const newCount = count + 1;
      setCount(newCount);
      saveJaapSession(1);

      setTypedText(prev => prev + " | ");

      if (newCount % 108 === 0) {
        setRoundCompleted(true);
        playTempleBell();
        setTimeout(playTempleBell, 200);
        setDaanModalOpen(true); // Open Daan window on completed round!
      }
    }
  };

  const handleReset = () => {
    setCount(0);
    setTypedText("");
    setRoundCompleted(false);
  };

  const submitDaan = (option: string) => {
    setDaanSelected(option);
    setDaanMessage("Dhanya ho! Aapka sankalp sweekar kiya gaya. Ishwar aapki bhakti safal karein. 🙏");
    setTimeout(() => {
      setDaanModalOpen(false);
      setDaanSelected(null);
      setDaanMessage("");
    }, 4500);
  };

  // Compute positions of 27 beads for the interactive loop
  const beadsArray = Array.from({ length: 27 });
  const radius = 76;
  const centerX = 100;
  const centerY = 100;

  return (
    <div className="kundli-page flex flex-col min-h-screen relative overflow-hidden" style={{ transition: "background 0.5s ease" }}>
      
      {/* Dynamic Animated Deity Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none transition-all duration-1000 opacity-25 z-0"
        style={{ backgroundImage: `url(${selectedMantra.bgImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/90 via-bg/70 to-bg z-0 pointer-events-none" />

      <header className="kundli-header relative z-10">
        <div className="kundli-header-left">
          <Link href="/" className="kundli-back">
            ← Back to PoojaPath
          </Link>
          <h1>Spiritual Jaap Center</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="kundli-pdf-btn"
            onClick={() => setDaanModalOpen(true)}
          >
            🪙 Daan / Offering
          </button>
          <button
            type="button"
            className="kundli-pdf-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title="Toggle sound"
          >
            {soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}
          </button>
        </div>
      </header>

      {/* Floating mantra words */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute font-tiro text-3xl text-gl font-bold select-none whitespace-nowrap"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animation: "floatMantra 2.5s ease-out forwards",
              textShadow: "0 0 12px rgba(242,201,110,0.8), 0 0 24px rgba(232,96,10,0.4)"
            }}
          >
            {p.text}
          </div>
        ))}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-4 py-8 relative z-10">
        
        {/* Mode Selector */}
        <div className="w-full flex bg-deep/80 border border-brd rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode("write"); handleReset(); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "write" ? "bg-s text-white shadow" : "text-mut hover:text-cream"
            }`}
          >
            ✍️ Likhit Jaap (Writing Mode)
          </button>
          <button
            onClick={() => { setMode("chant"); handleReset(); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "chant" ? "bg-s text-white shadow" : "text-mut hover:text-cream"
            }`}
          >
            📿 Mala Jaap (Chanting Mode)
          </button>
        </div>

        {/* Streak & Info Strip */}
        <div className="w-full flex items-center justify-between bg-card-bg/50 border border-brd rounded-xl px-5 py-3.5 mb-6 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="text-xl animate-bounce">🔥</span>
            <div>
              <div className="text-[10px] text-mut uppercase font-semibold tracking-wider">Devotion Streak</div>
              <div className="text-sm font-bold text-cream">{streak} Days Active</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📿</span>
            <div>
              <div className="text-[10px] text-mut uppercase font-semibold tracking-wider">Total Chants</div>
              <div className="text-sm font-bold text-cream">{totalChants}</div>
            </div>
          </div>
        </div>

        {/* Mantra Selector */}
        <div className="w-full bg-card-bg border border-brd rounded-2xl p-5 mb-6 text-center backdrop-blur-md">
          <label className="text-[10px] text-mut uppercase font-bold tracking-widest block mb-2">Select Chanting Deity & Mantra</label>
          <select
            className="w-full bg-deep/80 border border-brd rounded-xl px-3.5 py-2.5 text-cream text-sm outline-none focus:border-s transition-all mb-4 text-center cursor-pointer font-semibold"
            value={selectedMantra.id}
            onChange={(e) => {
              const selected = MANTRAS.find((m) => m.id === e.target.value);
              if (selected) {
                setSelectedMantra(selected);
                handleReset();
              }
            }}
          >
            {MANTRAS.map((m) => (
              <option key={m.id} value={m.id} className="bg-bg text-cream">
                {m.name} ({m.deity})
              </option>
            ))}
          </select>

          <div className="py-2">
            <div className="font-tiro text-3xl text-gl leading-normal mb-2 tracking-wide font-medium">
              {selectedMantra.sanskrit}
            </div>
            <div className="text-[11px] text-mut italic leading-relaxed max-w-sm mx-auto">
              &quot;{selectedMantra.translation}&quot;
            </div>
          </div>
        </div>

        {/* MODE 1: Write Likhit Jaap (Traditional Royal Scroll Notepad) */}
        {mode === "write" && (
          <div className="w-full relative bg-gradient-to-b from-[#1c1109] to-[#251710] border-l-4 border-r-4 border-gl/60 rounded-xl p-8 shadow-xl mb-6 overflow-visible">
            {/* Real 3D Royal Scroll Cylindrical Handles sticking out */}
            <div className="absolute left-[-16px] right-[-16px] height-[14px] top-[-4px] bg-gradient-to-b from-[#5a3c18] via-[#c9922b] to-[#5a3c18] rounded-full shadow-[0_3px_6px_rgba(0,0,0,0.6)]" style={{ height: 12 }} />
            <div className="absolute left-[-16px] right-[-16px] height-[14px] bottom-[-4px] bg-gradient-to-b from-[#5a3c18] via-[#c9922b] to-[#5a3c18] rounded-full shadow-[0_3px_6px_rgba(0,0,0,0.6)]" style={{ height: 12 }} />

            <div className="text-center text-[10px] text-gl uppercase tracking-wider font-bold mb-2">
              Likhit Jaap Patra
            </div>

            <textarea
              className="w-full h-32 bg-transparent text-cream border-none outline-none resize-none font-tiro text-lg leading-relaxed text-center tracking-wide placeholder-mut/40"
              placeholder="Type mantra here..."
              value={typedText}
              onChange={handleWritingInput}
            />

            <div className="text-center text-[10px] text-mut mt-2">
              Chants: <span className="text-gl font-bold">{count}</span> / 108
            </div>
          </div>
        )}

        {/* MODE 2: Mala Counter Bead */}
        {mode === "chant" && (
          <div className="flex-1 flex flex-col items-center justify-center py-4 w-full">
            
            {/* Realistic Rotating Rudraksha SVG Loop */}
            <div className="relative w-56 h-56 flex items-center justify-center bg-deep/30 rounded-full border border-brd/30 shadow-inner mb-6">
              
              <svg className="w-full h-full p-2" viewBox="0 0 200 200">
                {/* Connecting Thread thread */}
                <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#8c6a46" strokeWidth="2.5" strokeDasharray="5,3" opacity="0.6" />
                
                {/* Rotating group of 27 beads */}
                <g style={{
                  transformOrigin: `${centerX}px ${centerY}px`,
                  transform: `rotate(${(count % 27) * (360 / 27)}deg)`,
                  transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}>
                  {beadsArray.map((_, idx) => {
                    const angle = (idx * 360) / 27 * (Math.PI / 180);
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    const isActive = idx === 0;

                    return (
                      <g key={idx}>
                        {/* Rudraksha bead texture circle */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isActive ? "10" : "8"}
                          fill="url(#rudrakshaGrad)"
                          stroke={isActive ? "var(--gl)" : "#3a1f10"}
                          strokeWidth={isActive ? "2" : "1"}
                          className="cursor-pointer transition-all duration-300"
                          style={{
                            filter: isActive ? "drop-shadow(0 0 8px rgba(242,201,110,0.8))" : "none"
                          }}
                        />
                        {/* Bead texture markings */}
                        <circle cx={x} cy={y} r={isActive ? "5" : "3"} fill="none" stroke="#251206" strokeWidth="0.8" opacity="0.4" />
                        {/* Sumeru Tassel decoration on Bead index 13 (opposite or top) */}
                        {idx === 13 && (
                          <path
                            d={`M ${x} ${y} L ${x - 5} ${y + 12} L ${x + 5} ${y + 12} Z`}
                            fill="#d63031"
                            opacity="0.8"
                          />
                        )}
                      </g>
                    );
                  })}
                </g>

                {/* SVG Definitions for 3D Rudraksha texture */}
                <defs>
                  <radialGradient id="rudrakshaGrad" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#d18a4a" />
                    <stop offset="50%" stopColor="#7a4214" />
                    <stop offset="100%" stopColor="#3d1d05" />
                  </radialGradient>
                </defs>
              </svg>

              {/* Central counter button clicker */}
              <button
                type="button"
                onClick={handleChant}
                className={`absolute w-24 h-24 rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-[#2a1708] to-[#140b03] border-2 border-gl/40 shadow-lg active:scale-95 transition-all duration-150 outline-none cursor-pointer ${
                  animating ? "scale-90 border-gl" : "hover:border-gl"
                }`}
              >
                <span className="text-[9px] text-mut uppercase font-semibold">Chant</span>
                <span className="font-cormorant text-3xl font-bold text-s leading-none select-none">{count}</span>
                <span className="text-[8px] text-gl/70 mt-1 select-none">Mala {Math.floor(count / 108) + 1}</span>
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-[10px] text-mut font-semibold mb-1.5 uppercase tracking-wide">
                <span>Mala Progress ({count % 108} / 108)</span>
                <span>{Math.round(Math.min((count % 108) / 108 * 100, 100))}%</span>
              </div>
              <div className="w-full h-2 bg-deep/80 border border-brd rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-s to-gl rounded-full transition-all duration-300"
                  style={{ width: `${(count % 108) / 108 * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="w-full grid grid-cols-2 gap-4 mt-6">
          <button
            type="button"
            onClick={handleReset}
            className="bbk py-3 rounded-xl border border-brd font-semibold hover:bg-card-bg/40 text-xs transition-all"
          >
            Reset Count
          </button>
          
          <button
            type="button"
            onClick={() => setDaanModalOpen(true)}
            className="bnx py-3 rounded-xl bg-s hover:bg-sl text-white font-bold text-xs shadow-lg shadow-s/20 transition-all uppercase tracking-wide text-center"
          >
            🪙 Perform Daan
          </button>
        </div>

      </main>

      {/* Daan Traditional Brass Thal Modal */}
      {daanModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={(e) => { if(e.target === e.currentTarget) setDaanModalOpen(false); }}>
          <div className="bg-gradient-to-b from-[#2a1708] to-[#1c0f05] border-2 border-gl rounded-2xl p-6 max-w-sm w-full text-center relative shadow-2xl">
            <button className="absolute top-3 right-3 text-mut hover:text-cream text-lg" onClick={() => setDaanModalOpen(false)}>✕</button>
            
            <div className="text-gl font-bold text-sm uppercase tracking-wider mb-2">🪙 Devotion Offering (Daan) 🪙</div>
            <p className="text-xs text-mut mb-6 leading-relaxed">
              Complete your sadhana or study with a symbolic offering in your mind, supporting spiritual welfare.
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
                  onClick={() => submitDaan("Gurukul")}
                  className="w-full py-3 px-4 bg-deep/80 hover:bg-s/20 border border-brd hover:border-gl rounded-xl text-left flex justify-between items-center text-xs font-semibold text-cream transition-all"
                >
                  <span>🏫 Support Vedic Gurukul Shishya</span>
                  <span className="text-gl">₹251</span>
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

      {/* Paywall Modal Pop-up */}
      {paywallActive && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" style={{ backdropFilter: "blur(8px)" }}>
          <div className="bg-gradient-to-b from-[#2a1708] to-[#1c0f05] border-2 border-gl rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl">
            <div className="text-3xl mb-3">🔒</div>
            <div className="text-gl font-bold text-sm uppercase tracking-wider mb-2">Devotion Payment Activation</div>
            <p className="text-xs text-mut mb-6 leading-relaxed">
              You have completed your 1st free activity on PoojaPath. Activate full cloud features to continue your sadhana uninterrupted.
            </p>
            
            <div className="p-4 bg-s/10 border border-s/30 rounded-xl mb-6 text-left">
              <div className="text-xs font-bold text-cream mb-1 flex justify-between">
                <span>Premium Access Pass</span>
                <span className="text-gl">₹21 / Month</span>
              </div>
              <div className="text-[10px] text-mut leading-relaxed">
                Unlock all 5+ deity backgrounds, 108-bead rotating Rudraksha mala, dynamic wallpapers, and Pandit Ji's unlimited guidance.
              </div>
            </div>

            <button
              onClick={() => { setPaywallActive(false); setActionCount(0); }}
              className="w-full py-3 bg-s hover:bg-sl text-white font-bold text-xs rounded-xl shadow-lg transition-all uppercase tracking-wider"
            >
              Activate Premium sadhana
            </button>
            <button
              onClick={() => setPaywallActive(false)}
              className="mt-3 text-mut hover:text-cream text-[10px] font-semibold"
            >
              Close and continue guest mode
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes floatMantra {
          0% {
            transform: translateY(0) scale(0.6);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(-200px) scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
