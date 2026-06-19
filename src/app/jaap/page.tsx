"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface MantraItem {
  id: string;
  name: string;
  sanskrit: string;
  translation: string;
  deity: string;
}

const MANTRAS: MantraItem[] = [
  {
    id: "shiva",
    name: "Om Namah Shivaya",
    sanskrit: "ॐ नमः शिवाय",
    translation: "Adorations to Lord Shiva, the transformative power of the cosmos.",
    deity: "Shiva",
  },
  {
    id: "gayatri",
    name: "Gayatri Mantra",
    sanskrit: "ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्",
    translation: "We meditate on the divine light of the Sun. May it illuminate our intellect.",
    deity: "Savitr / Gayatri",
  },
  {
    id: "ram",
    name: "Jai Shri Ram",
    sanskrit: "जय श्री राम",
    translation: "Victory to Lord Rama, the embodiment of righteousness and truth.",
    deity: "Rama",
  },
  {
    id: "krishna",
    name: "Mahamantra (Hare Krishna)",
    sanskrit: "हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे | हरे राम हरे राम राम राम हरे हरे",
    translation: "Chanting the divine names of Krishna and Rama to awaken consciousness.",
    deity: "Krishna & Rama",
  },
  {
    id: "mahamrityunjaya",
    name: "Mahamrityunjaya Mantra",
    sanskrit: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् | उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्",
    translation: "We worship the three-eyed One. May we be liberated from death, not immortality.",
    deity: "Rudradeva (Shiva)",
  },
  {
    id: "ganesha",
    name: "Om Gam Ganapataye Namah",
    sanskrit: "ॐ गं गणपतये नमः",
    translation: "Salutations to the Lord of Obstacle Removal and Intellect.",
    deity: "Ganesha",
  },
];

// Romanized pronunciation for Web Speech API (TTS reads these clearly)
const MANTRA_TTS: Record<string, string> = {
  shiva:           "Om... Namah... Shivaya",
  gayatri:         "Om... Bhoor Bhuva Swaha... Tat Savitur Varenyam... Bhargo Devasya Dheemahi... Dhiyo Yo Nah Prachodayaat",
  ram:             "Jai... Shri... Ram",
  krishna:         "Hare Krishna... Hare Krishna... Krishna Krishna... Hare Hare... Hare Rama... Hare Rama... Rama Rama... Hare Hare",
  mahamrityunjaya: "Om... Trayambakam Yajamahe... Sugandhim Pushti Vardhanam... Urvarukamiva Bandhanaan... Mrityor Mukshiya... Maamritaat",
  ganesha:         "Om... Gam... Ganapataye... Namaha",
};

export default function JaapPage() {
  const [selectedMantra, setSelectedMantra] = useState<MantraItem>(MANTRAS[0]);
  const [count, setCount] = useState(0);
  const [totalChants, setTotalChants] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lastChantDate, setLastChantDate] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceRate, setVoiceRate] = useState(0.72);   // slow & meditative
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTotal = localStorage.getItem("jaap_total_chants");
      const savedStreak = localStorage.getItem("jaap_streak");
      const savedDate = localStorage.getItem("jaap_last_date");

      if (savedTotal) setTotalChants(parseInt(savedTotal, 10));
      if (savedStreak) setStreak(parseInt(savedStreak, 10));
      if (savedDate) {
        setLastChantDate(savedDate);
        checkStreakValidity(savedDate, parseInt(savedStreak || "0", 10));
      }
    }
  }, []);

  const checkStreakValidity = (lastDateStr: string, currentStreak: number) => {
    if (!lastDateStr || currentStreak === 0) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastDate = new Date(lastDateStr);
    lastDate.setHours(0, 0, 0, 0);

    const diffTime = Math.abs(today.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      // Streak broken (more than 1 day since last chant)
      setStreak(0);
      localStorage.setItem("jaap_streak", "0");
    }
  };

  // Web Audio API Temple Bell Sound Synthesizer
  const playTempleBell = () => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      
      // Fundamental oscillator
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "sine";
      // Pure frequency of temple bell (around 528Hz - Solfeggio frequency of Transformation)
      osc.frequency.setValueAtTime(528, audioCtx.currentTime); 

      // Overtone oscillator (gives bell its metallic timbre)
      const overtone = audioCtx.createOscillator();
      const overtoneGain = audioCtx.createGain();
      overtone.type = "sine";
      overtone.frequency.setValueAtTime(1056, audioCtx.currentTime); // Double frequency harmonic

      // Exponential decay curves
      gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);

      overtoneGain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

      // Connect nodes
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      overtone.connect(overtoneGain);
      overtoneGain.connect(audioCtx.destination);

      // Trigger oscillators
      osc.start();
      overtone.start();
      osc.stop(audioCtx.currentTime + 1.8);
      overtone.stop(audioCtx.currentTime + 1.2);
    } catch (err) {
      console.warn("Audio synthesis context blocked/failed:", err);
    }
  };

  // ── Text-to-Speech: Indian Pandit accent ─────────────────────────────
  const speakMantra = (mantra: MantraItem) => {
    if (!voiceEnabled || typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // Devanagari text with commas for rhythmic pauses between each word
    const PANDIT_TEXT: Record<string, string> = {
      shiva:           "ॐ, नमः, शिवाय, ॐ, नमः, शिवाय",
      gayatri:         "ॐ, भूर्भुवः, स्वः, तत्सवितुर्वरेण्यं, भर्गो, देवस्य, धीमहि, धियो, यो, नः, प्रचोदयात्",
      ram:             "जय, श्री, राम, जय, श्री, राम",
      krishna:         "हरे, कृष्ण, हरे, कृष्ण, कृष्ण, कृष्ण, हरे, हरे, हरे, राम, हरे, राम, राम, राम, हरे, हरे",
      mahamrityunjaya: "ॐ, त्र्यम्बकं, यजामहे, सुगन्धिं, पुष्टिवर्धनम्, उर्वारुकमिव, बन्धनात्, मृत्योर्मुक्षीय, माऽमृतात्",
      ganesha:         "ॐ, गं, गणपतये, नमः, ॐ, गं, गणपतये, नमः",
    };

    const text = PANDIT_TEXT[mantra.id] || mantra.sanskrit;
    const utterance = new SpeechSynthesisUtterance(text);

    const doSpeak = () => {
      const voices = window.speechSynthesis.getVoices();

      // Priority: Google Hindi > Swara > Hemant > Kalpana > any hi-IN > en-IN > fallback
      const voice =
        voices.find(v => v.name === "Google \u0939\u093f\u0928\u094d\u0926\u0940") ||
        voices.find(v => v.name.includes("Swara"))                      ||
        voices.find(v => v.name.toLowerCase().includes("hemant"))       ||
        voices.find(v => v.name.toLowerCase().includes("kalpana"))      ||
        voices.find(v => v.lang === "hi-IN")                            ||
        voices.find(v => v.lang.startsWith("hi"))                       ||
        voices.find(v => v.lang === "en-IN")                            ||
        voices.find(v => v.name.toLowerCase().includes("india"))        ||
        voices[0];

      if (voice) utterance.voice = voice;
      utterance.lang   = (voice?.lang?.startsWith("hi")) ? "hi-IN" : "en-IN";
      utterance.rate   = voiceRate;   // slow = 0.4–0.6 is pandit-like
      utterance.pitch  = 0.6;         // deep masculine pandit tone
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend   = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    };

    // Voices may not be loaded yet on first render — wait if needed
    if (window.speechSynthesis.getVoices().length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
    }
  };

  const handleChant = () => {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 120);

    playTempleBell();
    speakMantra(selectedMantra);  // 🔊 speak full mantra

    const newCount = count + 1;
    const newTotal = totalChants + 1;
    setCount(newCount);
    setTotalChants(newTotal);
    localStorage.setItem("jaap_total_chants", newTotal.toString());

    // Update streak logic
    const todayStr = new Date().toDateString();
    if (lastChantDate !== todayStr) {
      let newStreak = streak;
      if (!lastChantDate) {
        newStreak = 1;
      } else {
        const lastDate = new Date(lastChantDate);
        lastDate.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);
        const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      }
      setStreak(newStreak);
      setLastChantDate(todayStr);
      localStorage.setItem("jaap_streak", newStreak.toString());
      localStorage.setItem("jaap_last_date", todayStr);
    }

    // Round check
    if (newCount % 108 === 0) {
      setRoundCompleted(true);
      // Extra long chime for 108
      setTimeout(playTempleBell, 200);
      setTimeout(playTempleBell, 500);
    }
  };

  const handleReset = () => {
    setCount(0);
    setRoundCompleted(false);
  };

  return (
    <div className="kundli-page flex flex-col min-h-screen">
      <header className="kundli-header">
        <div className="kundli-header-left">
          <Link href="/" className="kundli-back">
            ← Back to PoojaPath
          </Link>
          <h1>Nama Jaap</h1>
        </div>
        <button
          type="button"
          className="kundli-pdf-btn"
          onClick={() => setSoundEnabled(!soundEnabled)}
          title="Toggle bell sound"
        >
          {soundEnabled ? "🔔 Bell On" : "🔕 Bell Off"}
        </button>
        <button
          type="button"
          className="kundli-pdf-btn"
          style={{ marginLeft: 8, background: voiceEnabled ? "rgba(232,96,10,0.15)" : "transparent" }}
          onClick={() => { setVoiceEnabled(!voiceEnabled); window.speechSynthesis?.cancel(); }}
          title="Toggle mantra voice"
        >
          {voiceEnabled ? "🗣️ Voice On" : "🔇 Voice Off"}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-4 py-8">
        {/* Streak & Info Strip */}
        <div className="w-full flex items-center justify-between bg-card-bg/50 border border-brd rounded-xl px-5 py-3.5 mb-6 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🔥</span>
            <div>
              <div className="text-[10px] text-mut uppercase font-semibold tracking-wider">Daily Streak</div>
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
          <label className="text-[10px] text-mut uppercase font-bold tracking-widest block mb-2">Select Chanting Mantra</label>
          <select
            className="w-full bg-deep/80 border border-brd rounded-xl px-3.5 py-2.5 text-cream text-sm outline-none focus:border-s transition-all mb-4 text-center cursor-pointer"
            value={selectedMantra.id}
            onChange={(e) => {
              const selected = MANTRAS.find((m) => m.id === e.target.value);
              if (selected) {
                window.speechSynthesis?.cancel();
                setSelectedMantra(selected);
                setIsSpeaking(false);
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
            {/* Speaking indicator */}
            {isSpeaking && (
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                gap: 6, marginBottom: 10,
                padding: "6px 14px", borderRadius: 20,
                background: "rgba(232,96,10,0.1)",
                border: "1px solid rgba(232,96,10,0.25)",
                width: "fit-content", margin: "0 auto 12px",
              }}>
                {/* Animated sound waves */}
                <div style={{ display: "flex", alignItems: "center", gap: 2, height: 16 }}>
                  {[1,2,3,4,3,2,1].map((h, i) => (
                    <div key={i} style={{
                      width: 3, borderRadius: 2,
                      background: "#E8600A",
                      height: `${h * 3}px`,
                      animation: `jaapWave 0.6s ease-in-out ${i * 0.08}s infinite alternate`,
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: "rgba(232,96,10,0.9)", fontWeight: 600 }}>
                  🗣️ Bol raha hun...
                </span>
              </div>
            )}
            <div className="font-tiro text-2xl text-gl leading-normal mb-2 tracking-wide font-medium"
              style={{ animation: isSpeaking ? "mantraPulse 1.8s ease-in-out infinite" : "none" }}>
              {selectedMantra.sanskrit}
            </div>
            <div className="text-[11px] text-mut italic leading-relaxed max-w-sm mx-auto">
              &quot;{selectedMantra.translation}&quot;
            </div>
          </div>

          {/* Voice speed control */}
          {voiceEnabled && (
            <div style={{
              marginTop: 12, padding: "10px 14px",
              background: "rgba(255,248,235,0.03)",
              border: "1px solid rgba(200,145,60,0.1)",
              borderRadius: 12,
            }}>
              <div style={{ fontSize: 10, color: "rgba(200,175,140,0.5)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                🗣️ Chanting Speed
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: "rgba(200,175,140,0.45)" }}>Slow</span>
                <input
                  type="range" min="0.4" max="1.2" step="0.05"
                  value={voiceRate}
                  onChange={e => setVoiceRate(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: "#E8600A" }}
                />
                <span style={{ fontSize: 11, color: "rgba(200,175,140,0.45)" }}>Fast</span>
              </div>
              <div style={{ fontSize: 10, color: "rgba(200,175,140,0.35)", marginTop: 4, textAlign: "center" }}>
                Ek baar Chant click karein — poora mantra bola jaayega 🙏
              </div>
            </div>
          )}
        </div>

        <style>{`
          @keyframes jaapWave {
            from { transform: scaleY(0.4); opacity: 0.6; }
            to   { transform: scaleY(1.6); opacity: 1; }
          }
          @keyframes mantraPulse {
            0%,100% { text-shadow: 0 0 0px rgba(242,201,110,0); }
            50%      { text-shadow: 0 0 20px rgba(242,201,110,0.5), 0 0 40px rgba(232,96,10,0.3); }
          }
        `}</style>

        {/* Digital Jaap Counter */}
        <div className="flex-1 flex flex-col items-center justify-center py-4 w-full">
          {roundCompleted && (
            <div className="text-center mb-4 animate-bounce">
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-2 rounded-full font-semibold inline-block">
                ✨ One Round of 108 Completed! 🙏
              </div>
            </div>
          )}

          {/* Glowing central bead counter */}
          <button
            type="button"
            onClick={handleChant}
            className={`relative w-48 h-48 rounded-full flex flex-col items-center justify-center border-3 border-gl/20 bg-gradient-to-br from-card-bg to-deep shadow-[0_0_50px_rgba(232,96,10,0.12)] outline-none cursor-pointer transition-all duration-150 active:scale-95 ${
              animating ? "shadow-[0_0_60px_rgba(242,201,110,0.45)] border-gl scale-95" : "hover:border-gl/60 hover:shadow-[0_0_55px_rgba(232,96,10,0.25)]"
            }`}
          >
            {/* Pulsing glow ring inside */}
            <div className="absolute inset-2 rounded-full border border-s/20 animate-ping opacity-15 pointer-events-none"></div>
            
            <div className="text-[10px] text-mut uppercase font-semibold tracking-widest mb-1">Jaap Count</div>
            <div className="font-cormorant text-5xl font-bold text-s leading-none select-none">
              {count}
            </div>
            <div className="text-[9px] text-gl/70 mt-2 font-medium tracking-widest select-none">
              TARGET: 108
            </div>
          </button>

          {/* Progress Bar */}
          <div className="w-full max-w-xs mt-8">
            <div className="flex justify-between text-[10px] text-mut font-semibold mb-1.5 uppercase tracking-wide">
              <span>Mala Progress</span>
              <span>{Math.round(Math.min((count % 108) / 108 * 100, 100))}%</span>
            </div>
            <div className="w-full h-2 bg-deep/80 border border-brd rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-s to-gl rounded-full transition-all duration-300"
                style={{ width: `${(count % 108) / 108 * 100}%` }}
              ></div>
            </div>
            <div className="text-center text-[9px] text-mut mt-2">
              Round {Math.floor(count / 108) + 1} ({count % 108} / 108)
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="w-full grid grid-cols-2 gap-4 mt-6">
          <button
            type="button"
            onClick={handleReset}
            className="bbk py-3 rounded-xl border border-brd font-semibold hover:bg-card-bg/40 text-xs transition-all"
          >
            Reset Round
          </button>
          <button
            type="button"
            onClick={handleChant}
            className="bnx py-3 rounded-xl bg-s hover:bg-sl text-white font-bold text-xs shadow-lg shadow-s/20 transition-all uppercase tracking-wide"
          >
            Chant (ॐ)
          </button>
        </div>
      </main>

      <footer className="footer-wrap text-center py-5 border-t border-brd bg-deep/30">
        <p className="text-[10px] text-mut">
          &quot;Nama Jaap stabilizes the monkey mind and aligns personal resonance with cosmic frequencies.&quot;
        </p>
      </footer>
    </div>
  );
}
