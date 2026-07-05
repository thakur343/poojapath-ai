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
];

interface Particle {
  id: number;
  text: string;
  x: number;
  y: number;
}

export default function JaapWidget() {
  const { user } = useAuth();
  const userEmail = user?.email || "guest";

  const [mode, setMode] = useState<"chant" | "write" | "voice">("chant");
  const [selectedMantra, setSelectedMantra] = useState<MantraItem>(MANTRAS[0]);
  const [count, setCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Likhit states
  const [typedText, setTypedText] = useState("");
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);

  // Voice AI states
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [verifying, setVerifying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Paywall Trigger states
  const [paywallActive, setPaywallActive] = useState(false);
  const [actionCount, setActionCount] = useState(0);

  // Load stats from Backend on mount & when user changes
  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`http://localhost:8000/api/jaap/stats?email=${encodeURIComponent(userEmail)}`);
        if (res.ok) {
          const data = await res.json();
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

      gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.5);
    } catch (err) {}
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
      osc.frequency.exponentialRampToValueAtTime(60, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch(e){}
  };

  const checkPaywall = () => {
    const currentActions = actionCount + 1;
    setActionCount(currentActions);
    if (currentActions >= 2) {
      setPaywallActive(true);
      return true; // Bloked
    }
    return false; // Allowed
  };

  const handleChant = () => {
    if (checkPaywall()) return;

    setAnimating(true);
    setTimeout(() => setAnimating(false), 120);

    playBeadSlide();
    spawnParticle(selectedMantra.sanskrit);

    const newCount = count + 1;
    setCount(newCount);

    if (newCount % 108 === 0) {
      setRoundCompleted(true);
      playTempleBell();
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
      // Content Moderation check before counting
      try {
        const response = await fetch("http://localhost:8000/api/moderation/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: lastWord })
        });
        const mod = await response.json();
        if (mod.is_abusive) {
          // Block, clear, and alert
          setTypedText("");
          alert("Abusive content detected and blocked! Please write spiritual words only. 🙏");
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

      setTypedText(prev => prev + " | ");

      if (newCount % 108 === 0) {
        setRoundCompleted(true);
        playTempleBell();
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        verifyPronunciation(audioBlob);
      };
      mediaRecorder.start();
      setRecording(true);
      setPronunciationScore(null);
      setTranscription("");
    } catch (err) {
      alert("Microphone permission denied or not supported.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
  };

  const verifyPronunciation = async (blob: Blob) => {
    setVerifying(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const res = await fetch("http://localhost:8000/api/jaap/verify-pronunciation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio_base64: base64data,
            expected_text: selectedMantra.name
          })
        });
        if (res.ok) {
          const data = await res.json();
          setPronunciationScore(data.score);
          setTranscription(data.transcribed_text);
          if (data.success) {
            setCount(prev => prev + 1);
            playBeadSlide();
            spawnParticle(selectedMantra.sanskrit);
          }
        }
      };
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const spawnParticle = (text: string) => {
    const id = particleIdRef.current++;
    const x = 30 + Math.random() * 40; 
    const y = 40 + Math.random() * 20;
    const newParticle: Particle = { id, text, x, y };
    setParticles(prev => [...prev, newParticle]);

    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 2000);
  };

  // 27 beads path math
  const beadsArray = Array.from({ length: 27 });
  const radius = 64;
  const centerX = 80;
  const centerY = 80;

  return (
    <div className="w-full max-w-4xl mx-auto my-12 p-6 md:p-8 divine-glow-card rounded-3xl backdrop-blur-md relative overflow-hidden">
      
      {/* Floating particles inside widget only */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute font-tiro text-2xl text-gl font-bold select-none animate-float-up"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animation: "floatMantra 2s ease-out forwards",
              textShadow: "0 0 8px rgba(242,201,110,0.8)"
            }}
          >
            {p.text}
          </div>
        ))}
      </div>

      <div className="text-center mb-6 relative z-10">
        <div className="sec-eye inline-block px-3 py-1 bg-s/10 border border-s/20 rounded-full text-xs text-s font-semibold uppercase tracking-wider mb-2">
          🔥 Interactive Sadhana
        </div>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-s to-gl bg-clip-text text-transparent">
          Instant Mantra Jaap Counter
        </h2>
        <p className="text-xs text-mut mt-1">Start chanting or typing directly from the home screen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
        
        {/* Left pane - Config & Selector */}
        <div className="flex flex-col gap-4">
          <label className="text-[10px] text-mut uppercase font-bold tracking-widest block">Select Mantra</label>
          <select
            className="w-full bg-deep/80 border border-brd rounded-xl px-3 py-2 text-cream text-xs outline-none focus:border-s transition-all cursor-pointer font-semibold"
            value={selectedMantra.id}
            onChange={(e) => {
              const selected = MANTRAS.find((m) => m.id === e.target.value);
              if (selected) {
                setSelectedMantra(selected);
                setCount(0);
              }
            }}
          >
            {MANTRAS.map((m) => (
              <option key={m.id} value={m.id} className="bg-bg text-cream">
                {m.name} ({m.deity})
              </option>
            ))}
          </select>

          <div className="p-4 bg-deep/40 rounded-xl border border-brd/40 text-center">
            <div className="font-tiro text-2xl text-gl mb-1">{selectedMantra.sanskrit}</div>
            <div className="text-[10px] text-mut italic leading-relaxed">{selectedMantra.translation}</div>
          </div>

          <div className="flex bg-deep/80 border border-brd rounded-xl p-0.5">
            <button onClick={() => setMode("chant")} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg ${mode === "chant" ? "bg-s text-white" : "text-mut"}`}>
              📿 Clicker
            </button>
            <button onClick={() => setMode("write")} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg ${mode === "write" ? "bg-s text-white" : "text-mut"}`}>
              ✍️ Notepad
            </button>
            <button onClick={() => setMode("voice")} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg ${mode === "voice" ? "bg-s text-white" : "text-mut"}`}>
              🎙️ Voice AI
            </button>
          </div>
        </div>

        {/* Right pane - Interactive interface */}
        <div className="flex flex-col items-center justify-center min-h-[220px]">
          {mode === "chant" && (
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 160 160">
                <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#8c6a46" strokeWidth="2" strokeDasharray="4,2" opacity="0.5" />
                <g style={{
                  transformOrigin: `${centerX}px ${centerY}px`,
                  transform: `rotate(${(count % 27) * (360 / 27)}deg)`,
                  transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}>
                  {beadsArray.map((_, idx) => {
                    const angle = (idx * 360) / 27 * (Math.PI / 180);
                    const x = (centerX + radius * Math.cos(angle)).toFixed(3);
                    const y = (centerY + radius * Math.sin(angle)).toFixed(3);
                    const isActive = idx === 0;
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={y}
                        r={isActive ? "7" : "5"}
                        fill="url(#rudrakshaGrad)"
                        stroke={isActive ? "var(--gl)" : "#3d1d05"}
                        strokeWidth={isActive ? "1.5" : "0.5"}
                        style={{ filter: isActive ? "drop-shadow(0 0 4px rgba(242,201,110,0.8))" : "none" }}
                      />
                    );
                  })}
                </g>
                <defs>
                  <radialGradient id="rudrakshaGrad" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#d18a4a" />
                    <stop offset="100%" stopColor="#3d1d05" />
                  </radialGradient>
                </defs>
              </svg>
              <button
                onClick={handleChant}
                className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-[#2a1708] to-[#140b03] border border-gl/40 flex flex-col items-center justify-center outline-none active:scale-95 transition-all"
              >
                <span className="text-[18px] font-bold text-s leading-none">{count}</span>
                <span className="text-[7px] text-gl uppercase mt-0.5">Chant</span>
              </button>
            </div>
          )}
          
          {mode === "write" && (
            <div className="w-full relative bg-[#150a04]/40 border border-brd/50 rounded-xl p-4">
              <textarea
                className="w-full h-24 bg-transparent text-cream border-none outline-none resize-none font-tiro text-sm leading-relaxed text-center placeholder-mut/30"
                placeholder="Type mantra here (e.g. ram)..."
                value={typedText}
                onChange={handleWritingInput}
              />
              <div className="text-center text-[9px] text-mut mt-1">Chants matching: {count}</div>
            </div>
          )}

          {mode === "voice" && (
            <div className="w-full bg-[#150a04]/40 border border-brd/50 rounded-xl p-4 text-center flex flex-col items-center gap-3">
              <div className="text-[10px] text-mut uppercase font-semibold">Voice AI Mantra Verification</div>
              
              <button
                onClick={recording ? stopRecording : startRecording}
                disabled={verifying}
                className={`w-14 h-14 rounded-full flex items-center justify-center outline-none transition-all active:scale-95 ${recording ? 'bg-red-600 animate-pulse border-red-400' : 'bg-gradient-to-br from-s to-gl border-gl'} border`}
              >
                {recording ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5a6.5 6.5 0 0 1-6.5-6.5h1A5.5 5.5 0 0 0 12 17.5a5.5 5.5 0 0 0 5.5-5.5h1a6.5 6.5 0 0 1-6.5 6.5zm0-2.5a4 4 0 0 1-4-4v-5a4 4 0 0 1 8 0v5a4 4 0 0 1-4 4z"/></svg>
                )}
              </button>

              <div className="text-[11px] text-cream">
                {recording ? "Listening... Speak the mantra clearly and click stop." : verifying ? "Analyzing pronunciation..." : "Click to speak the mantra"}
              </div>

              {pronunciationScore !== null && (
                <div className="mt-2 p-2 bg-deep/60 rounded-lg border border-brd w-full max-w-xs">
                  <div className="text-[9px] text-mut uppercase">Transcription:</div>
                  <div className="font-semibold text-cream text-[11px] italic">"{transcription || '(No text detected)'}"</div>
                  <div className="mt-1 flex items-center justify-between text-[11px]">
                    <span>Accuracy:</span>
                    <span className={`font-bold ${pronunciationScore >= 60 ? 'text-green-500' : 'text-yellow-500'}`}>
                      {pronunciationScore}% {pronunciationScore >= 60 ? '✓ (Count +1)' : '✗'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Progress Mini Bar */}
          <div className="w-full max-w-xs mt-4">
            <div className="flex justify-between text-[8px] text-mut font-semibold mb-1 uppercase">
              <span>Mala Progress</span>
              <span>{count % 108} / 108</span>
            </div>
            <div className="w-full h-1 bg-deep rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-s to-gl transition-all" style={{ width: `${(count % 108) / 108 * 100}%` }}></div>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-6 text-center">
        <Link href="/jaap" className="inline-block px-6 py-2.5 bg-deep hover:bg-card-bg text-gl hover:text-cream border border-brd rounded-xl text-xs font-bold transition-all no-underline">
          Go to full Jaap screen with Deity Themes & Daan System →
        </Link>
      </div>

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
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.9; }
          100% { transform: translateY(-120px) scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
