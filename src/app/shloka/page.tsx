"use client";

import React, { useState } from "react";
import Link from "next/link";

interface ShlokaItem {
  source: string;
  ref: string;
  sanskrit: string;
  transliteration: string;
  translation_hindi: string;
  translation_english: string;
  bg_image: string;
}

const SHLOKAS: ShlokaItem[] = [
  {
    source: "Bhagavad Gita",
    ref: "Ch 2, Verse 47",
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन |\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ||",
    transliteration: "karmaṇy-evādhikāras te mā phaleṣu kadācana\nmā karma-phala-hetur bhūr mā te saṅgo 'stv-akarmaṇi",
    translation_hindi: "तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। इसलिए तुम कर्मों के फल की वासना वाले मत होओ और तुम्हारी आसक्ति कर्म न करने में भी न हो।",
    translation_english: "You have a right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself to be the cause of the results of your activities, nor be attached to inaction.",
    bg_image: "/lord_krishna_bg.png"
  },
  {
    source: "Rigveda",
    ref: "Mandal 10, Hymn 191",
    sanskrit: "सङ्गच्छध्वं संवदध्वं सं वो मनांसि जानताम् |\nदेवा भागं यथा पूर्वे सञ्जानाना उपासते ||",
    transliteration: "saṅgacchadhvaṁ saṁvadadhvaṁ saṁ vo manāṁsi jānatām\ndevā bhāgaṁ yathā pūrve sañjānānā upāsate",
    translation_hindi: "संगठित होओ, मिलकर बात करो, और तुम्हारे मन एक समान होकर ज्ञान प्राप्त करें। जैसे प्राचीन काल में बुद्धिमान देवों ने मिलकर अपने भाग को ग्रहण किया था।",
    translation_english: "Walk together, speak together, let your minds be in harmony. Just as the ancient gods shared their offerings in agreement, may you live in unison.",
    bg_image: "/lord_shiva_bg.png"
  },
  {
    source: "Upanishad",
    ref: "Isha Upanishad",
    sanskrit: "ईशा वास्यमिदं सर्वं यत्किञ्च जगत्यां जगत् |\nतेन त्यक्तेन भुञ्जीथा मा गृधः कस्यस्विद्धनम् ||",
    transliteration: "īśā vāsyam idṁ sarvaṁ yat kiñca jagatyāṁ jagat\ntena tyaktena bhuñjīthā mā gṛdhaḥ kasya svid dhanam",
    translation_english: "All this, whatever moves in this moving world, is enveloped by God. Therefore, find enjoyment through renunciation; do not covet what belongs to others.",
    translation_hindi: "इस ब्रह्माण्ड में जो कुछ भी चेतन अथवा अचेतन है, वह सब ईश्वर द्वारा व्याप्त है। अतः त्याग भाव से उपभोग करो; किसी दूसरे के धन की लालसा मत करो।",
    bg_image: "/lord_shiva_bg.png"
  },
  {
    source: "Bhagavad Gita",
    ref: "Ch 18, Verse 66",
    sanskrit: "सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज |\nअहं त्वा सर्वपापेभ्यो मोक्षयिष्यामी मा शुचः ||",
    transliteration: "sarva-dharmān parityajya mām ekaṁ śaraṇaṁ vraja\nahaṁ tvā sarva-pāpebhyo mokṣayiṣyāmi mā śucaḥ",
    translation_hindi: "सब धर्मों (कर्तव्यों) को त्यागकर केवल मेरी शरण में आओ। मैं तुम्हें सब पापों से मुक्त कर दूँगा, तुम शोक मत करो।",
    translation_english: "Abandon all varieties of dharmas and surrender unto Me alone. I shall liberate you from all sinful reactions; do not fear.",
    bg_image: "/lord_krishna_bg.png"
  }
];

// Helper to wrap text inside canvas
function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const lines = text.split('\n');
  let currentY = y;

  for (let i = 0; i < lines.length; i++) {
    const words = lines[i].split(' ');
    let line = '';

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
}

export default function ShlokaCardCreator() {
  const [shlokaIndex, setShlokaIndex] = useState(0);
  const [theme, setTheme] = useState<"parchment" | "gold" | "cosmic">("gold");
  const [greetingText, setGreetingText] = useState("शुभ प्रभात! आपका दिन मंगलमय हो 🙏");
  const [sharing, setSharing] = useState(false);
  const [daanModalOpen, setDaanModalOpen] = useState(false);
  const [daanMessage, setDaanMessage] = useState("");

  const shloka = SHLOKAS[shlokaIndex];

  const getThemeClasses = () => {
    switch (theme) {
      case "gold":
        return "border-4 border-double border-gl shadow-[0_0_35px_rgba(201,146,43,0.25)] text-cream";
      case "cosmic":
        return "border-2 border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] text-[#e2e8f0]";
      case "parchment":
      default:
        return "text-[#3c2f1b] border-8 border-double border-[#8a6a46] shadow-xl";
    }
  };

  const getBackgroundStyle = () => {
    const overlay = theme === "parchment"
      ? "linear-gradient(rgba(253, 246, 226, 0.9), rgba(253, 246, 226, 0.95))"
      : theme === "cosmic"
      ? "linear-gradient(rgba(10, 17, 40, 0.88), rgba(2, 5, 20, 0.96))"
      : "linear-gradient(rgba(28, 10, 0, 0.88), rgba(10, 5, 0, 0.95))";

    return {
      backgroundImage: `${overlay}, url(${shloka.bg_image})`,
      backgroundSize: "cover",
      backgroundPosition: "center"
    };
  };

  // Render Card to Canvas and Generate Shareable File
  const handleShareCard = async () => {
    setSharing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Draw background
      const drawFullCard = () => {
        const bgOverlay = theme === "parchment"
          ? "rgba(253, 246, 226, 0.92)"
          : theme === "cosmic"
          ? "rgba(6, 11, 28, 0.92)"
          : "rgba(20, 8, 2, 0.94)";

        ctx.fillStyle = bgOverlay;
        ctx.fillRect(0, 0, 800, 1000);

        // Draw border
        ctx.strokeStyle = theme === "parchment" ? "#8a6a46" : theme === "cosmic" ? "#06b6d4" : "#F2C96E";
        ctx.lineWidth = theme === "parchment" ? 14 : 6;
        ctx.strokeRect(30, 30, 740, 940);

        // Header Decoration
        ctx.fillStyle = theme === "parchment" ? "rgba(60, 47, 27, 0.5)" : "rgba(253, 240, 220, 0.5)";
        ctx.font = "italic 16px Georgia";
        ctx.textAlign = "center";
        ctx.fillText("DAILY SPIRITUAL WISDOM", 400, 90);

        // Source Title
        ctx.fillStyle = theme === "parchment" ? "#5c3a21" : theme === "cosmic" ? "#06b6d4" : "#F2C96E";
        ctx.font = "bold 28px Georgia";
        ctx.fillText(`${shloka.source} (${shloka.ref})`, 400, 135);

        // Sanskrit Shloka text
        ctx.fillStyle = theme === "parchment" ? "#3c2f1b" : theme === "cosmic" ? "#e2e8f0" : "#FFEFC6";
        ctx.font = "bold 32px serif";
        wrapText(ctx, shloka.sanskrit, 400, 300, 700, 48);

        // Divider
        ctx.strokeStyle = theme === "parchment" ? "rgba(60, 47, 27, 0.15)" : "rgba(242, 201, 110, 0.25)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(150, 500);
        ctx.lineTo(650, 500);
        ctx.stroke();

        // Hindi translation
        ctx.fillStyle = theme === "parchment" ? "#4a3928" : "rgba(253, 240, 220, 0.85)";
        ctx.font = "20px Georgia";
        wrapText(ctx, "अर्थ (Hindi):\n" + shloka.translation_hindi, 400, 560, 680, 30);

        // Greeting Banner
        ctx.fillStyle = theme === "parchment" ? "#5c3a21" : theme === "cosmic" ? "#06b6d4" : "#F2C96E";
        ctx.font = "bold 24px Georgia";
        wrapText(ctx, greetingText, 400, 810, 680, 36);

        // Footer watermarks
        ctx.fillStyle = theme === "parchment" ? "rgba(60, 47, 27, 0.4)" : "rgba(253, 240, 220, 0.4)";
        ctx.font = "14px Georgia";
        ctx.fillText("poojapath.ai", 400, 930);

        // Export and Share logic
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `shloka_${shlokaIndex}.png`, { type: "image/png" });

          // If navigator.share supports file sharing (mobile WhatsApp / generic share)
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: `${shloka.source} Shloka`,
              text: `Read & explain Gita verses with AI Pandit Ji at PoojaPath: https://poojapath.ai/gita`
            });
          } else {
            // Desktop fallback: Trigger instant download of the card PNG image
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${shloka.source.replace(/\s+/g, "_")}_Shloka.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Open standard WhatsApp message so they can paste/send it
            const textMsg = `*${shloka.source} (${shloka.ref})* 🕉️\n\n_"${shloka.sanskrit}"_\n\n*${greetingText}*\n\nRead & explain Gita verses with AI Pandit Ji: https://poojapath.ai/gita`;
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(textMsg)}`, "_blank");
          }
        }, "image/png");
      };

      // Load deity background image
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.src = shloka.bg_image;
      bgImg.onload = () => {
        // Draw image first
        ctx.drawImage(bgImg, 0, 0, 800, 1000);
        drawFullCard();
      };
      bgImg.onerror = () => {
        // Draw fallback gradient background
        const grad = ctx.createLinearGradient(0, 0, 800, 1000);
        grad.addColorStop(0, "#2c1a0e");
        grad.addColorStop(1, "#0a0500");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 800, 1000);
        drawFullCard();
      };

    } catch (err) {
      console.error("Error creating card image: ", err);
    } finally {
      setSharing(false);
    }
  };

  const submitDaan = (option: string) => {
    setDaanMessage("Dhanya ho! Shloka gyaan prasaar pranam swikar kiya gaya. 🙏");
    setTimeout(() => {
      setDaanModalOpen(false);
      setDaanMessage("");
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-bg text-cream flex flex-col font-sans">
      
      {/* Header */}
      <header className="kundli-header px-6 py-4 flex items-center justify-between border-b border-brd bg-deep/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="kundli-back text-sm text-s hover:text-sl transition-all font-semibold">
            ← Back to PoojaPath
          </Link>
          <h1 className="text-xl font-bold bg-gradient-to-r from-s to-gl bg-clip-text text-transparent">
            WhatsApp Shloka Card Creator
          </h1>
        </div>
        <button onClick={() => setDaanModalOpen(true)} className="kundli-pdf-btn">🪙 Perform Daan</button>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left column - Customization options */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-card-bg border border-brd rounded-2xl p-5 backdrop-blur-md">
            <h2 className="text-xs text-mut uppercase font-bold tracking-widest mb-3">Choose Shloka</h2>
            <select
              className="w-full bg-deep/80 border border-brd rounded-xl px-3 py-2.5 text-cream text-xs outline-none focus:border-s transition-all cursor-pointer font-semibold mb-4"
              value={shlokaIndex}
              onChange={e => setShlokaIndex(parseInt(e.target.value))}
            >
              {SHLOKAS.map((s, idx) => (
                <option key={idx} value={idx} className="bg-bg text-cream">
                  {s.source} ({s.ref})
                </option>
              ))}
            </select>

            <h2 className="text-xs text-mut uppercase font-bold tracking-widest mb-2.5">Choose Card Style</h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => setTheme("parchment")}
                className={`py-2 rounded-xl text-xs font-semibold border ${
                  theme === "parchment" ? "bg-amber-100 text-amber-900 border-amber-500 font-bold" : "bg-deep/50 border-brd text-mut"
                }`}
              >
                📜 Parchment
              </button>
              <button
                onClick={() => setTheme("gold")}
                className={`py-2 rounded-xl text-xs font-semibold border ${
                  theme === "gold" ? "bg-gl/20 text-gl border-gl font-bold" : "bg-deep/50 border-brd text-mut"
                }`}
              >
                👑 Royal Gold
              </button>
              <button
                onClick={() => setTheme("cosmic")}
                className={`py-2 rounded-xl text-xs font-semibold border ${
                  theme === "cosmic" ? "bg-cyan-950/40 text-cyan-400 border-cyan-500 font-bold" : "bg-deep/50 border-brd text-mut"
                }`}
              >
                🌌 Cosmic Blue
              </button>
            </div>

            <h2 className="text-xs text-mut uppercase font-bold tracking-widest mb-2">Custom Greeting Message</h2>
            <input
              type="text"
              value={greetingText}
              onChange={e => setGreetingText(e.target.value)}
              placeholder="e.g. Shubh Prabhat!..."
              className="w-full bg-deep/80 border border-brd rounded-xl px-3 py-2 text-xs text-cream outline-none focus:border-s transition-all font-semibold"
            />
          </div>

          <button
            onClick={handleShareCard}
            disabled={sharing}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all uppercase tracking-wider text-center cursor-pointer border-none flex items-center justify-center gap-2"
          >
            {sharing ? (
              <span>⏳ Generating Card...</span>
            ) : (
              <>
                <span>📱 Generate & Share Card on WhatsApp</span>
              </>
            )}
          </button>
        </section>

        {/* Right column - Shloka Preview Card */}
        <section className="lg:col-span-7 flex flex-col items-center justify-center">
          
          <div className="w-full max-w-[420px] text-center mb-2 text-xs text-mut font-semibold uppercase tracking-wider">
            Live Preview Card
          </div>

          {/* Interactive Card Canvas Container */}
          <div
            id="shloka-card-canvas"
            className={`w-full max-w-[420px] aspect-[4/5] rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${getThemeClasses()}`}
            style={getBackgroundStyle()}
          >
            {/* Shloka Card Header decoration */}
            <div className="text-center z-10">
              <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">Daily Spiritual Wisdom</div>
              <div className={`text-xs font-bold font-cormorant mt-0.5 ${theme === "parchment" ? "text-amber-800" : "text-gl"}`}>
                {shloka.source}
              </div>
            </div>

            {/* Shloka Devanagari text */}
            <div className="text-center my-6 z-10">
              <p className={`font-tiro text-xl leading-relaxed whitespace-pre-line tracking-wide font-medium ${
                theme === "parchment" ? "text-[#5c3a21]" : "text-gl"
              }`}>
                {shloka.sanskrit}
              </p>
            </div>

            {/* Translation block */}
            <div className="flex-1 flex flex-col justify-center border-t border-dashed border-black/10 pt-4 z-10">
              <div className="text-[9px] uppercase font-bold tracking-widest opacity-60 text-center mb-1">अर्थ (Hindi)</div>
              <p className={`text-xs leading-relaxed text-center font-light font-tiro ${
                theme === "parchment" ? "text-[#4a3928]" : "text-cream/90"
              }`}>
                {shloka.translation_hindi}
              </p>
            </div>

            {/* Personalized greeting at the bottom */}
            <div className="text-center border-t border-dashed border-black/10 pt-4 mt-4 z-10">
              <p className={`text-xs font-semibold font-tiro ${
                theme === "parchment" ? "text-amber-900" : "text-gl"
              }`}>
                {greetingText}
              </p>
              <div className="text-[8px] uppercase tracking-wider opacity-45 mt-2">poojapath.ai</div>
            </div>

          </div>

          <div className="text-center text-[10px] text-mut mt-3 font-semibold">
            Perfect for forwarding as Good Morning messages!
          </div>

        </section>

      </main>

      {/* Daan Traditional Brass Thal Modal */}
      {daanModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={(e) => { if(e.target === e.currentTarget) setDaanModalOpen(false); }}>
          <div className="bg-gradient-to-b from-[#2a1708] to-[#1c0f05] border-2 border-gl rounded-2xl p-6 max-w-sm w-full text-center relative shadow-2xl">
            <button className="absolute top-3 right-3 text-mut hover:text-cream text-lg" onClick={() => setDaanModalOpen(false)}>✕</button>
            
            <div className="text-gl font-bold text-sm uppercase tracking-wider mb-2">🪙 Devotion Offering (Daan) 🪙</div>
            <p className="text-xs text-mut mb-6 leading-relaxed">
              Support printing and distributing sacred texts to Gurukuls. Make a mock offering below.
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
                  onClick={() => submitDaan("Gurukul Book")}
                  className="w-full py-3 px-4 bg-deep/80 hover:bg-s/20 border border-brd hover:border-gl rounded-xl text-left flex justify-between items-center text-xs font-semibold text-cream transition-all"
                >
                  <span>🏫 Donate Gita Books to Gurukul</span>
                  <span className="text-gl">₹151</span>
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

    </div>
  );
}
