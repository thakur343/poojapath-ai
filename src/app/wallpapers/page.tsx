"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface GenerationResult {
  deity: string;
  prompt: string;
  price: number;
  traffic_level: string;
  traffic_requests: number;
  image_url: string;
}

export default function WallpapersPage() {
  const [deityName, setDeityName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [checkoutActive, setCheckoutActive] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [currentDynamicPrice, setCurrentDynamicPrice] = useState(101);
  const [activeRequests, setActiveRequests] = useState(1);

  // Poll for mock traffic updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time surge pricing as visitors enter
      setActiveRequests(prev => {
        const nextReqs = prev + Math.floor(Math.random() * 2) + 1;
        const surge = Math.floor(nextReqs / 3) * 10;
        setCurrentDynamicPrice(min => Math.min(101 + surge, 501));
        return nextReqs;
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deityName.trim() || loading) return;

    setLoading(true);
    setPaymentComplete(false);

    try {
      const response = await fetch("https://poojapath-backend.onrender.com/api/wallpapers/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deity_name: deityName })
      });
      if (response.ok) {
        const data: GenerationResult = await response.json();
        setResult(data);
        setCurrentDynamicPrice(data.price);
        setActiveRequests(data.traffic_requests);
      }
    } catch (err) {
      console.warn("Could not generate wallpaper details, falling back:", err);
      // Fallback details
      setResult({
        deity: deityName,
        prompt: `A majestic, ethereal 8K smartphone wallpaper of ${deityName} with glowing aura, golden accents, low contrast.`,
        price: currentDynamicPrice,
        traffic_level: "High",
        traffic_requests: activeRequests,
        image_url: "/lord_shiva_bg.png"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = () => {
    setCheckoutActive(true);
  };

  const completePayment = () => {
    setCheckoutActive(false);
    setPaymentComplete(true);
  };

  return (
    <div className="min-h-screen bg-bg text-cream flex flex-col font-sans relative">
      
      {/* Header */}
      <header className="kundli-header px-6 py-4 flex items-center justify-between border-b border-brd bg-deep/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="kundli-back text-sm text-s hover:text-sl transition-all font-semibold">
            ← Back to PoojaPath
          </Link>
          <h1 className="text-xl font-bold bg-gradient-to-r from-s to-gl bg-clip-text text-transparent">
            Divine Wallpaper Store
          </h1>
        </div>
        <div className="text-xs bg-s/10 border border-s/20 text-s px-3 py-1.5 rounded-full font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-s animate-ping" />
          <span>Surge Price: ₹{currentDynamicPrice}</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col items-center justify-center">
        
        {/* Intro */}
        <div className="text-center mb-8">
          <div className="sec-eye inline-block px-3 py-1 bg-s/10 border border-s/20 rounded-full text-xs text-s font-semibold uppercase tracking-wider mb-2">
            🎨 AI Image Engine
          </div>
          <h2 className="text-3xl font-bold text-cream">Deity Wallpaper Generator</h2>
          <p className="text-xs text-mut mt-2 max-w-md mx-auto leading-relaxed">
            Enter the name of your favorite God. Our spiritual ML prompt engine will write a high-fidelity prompt to craft a beautiful 8K wallpaper for your phone.
          </p>
          <div className="text-[10px] text-s font-bold uppercase mt-3 tracking-widest flex items-center justify-center gap-1.5">
            <span>🔥 LIVE TRAFFIC:</span>
            <span className="text-cream">{activeRequests * 4} active devotees generating wallpapers</span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="w-full max-w-lg bg-card-bg border border-brd rounded-2xl p-6 backdrop-blur-md mb-8 flex flex-col gap-4">
          <div>
            <label className="text-[10px] text-mut uppercase font-bold tracking-widest block mb-2">Deity Name (eg. Shiva, Krishna, Rama)</label>
            <input
              type="text"
              required
              placeholder="Enter God's name..."
              value={deityName}
              onChange={e => setDeityName(e.target.value)}
              className="w-full bg-deep/80 border border-brd rounded-xl px-4 py-3 text-sm text-cream outline-none focus:border-s transition-all font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !deityName.trim()}
            className="w-full py-3.5 bg-s hover:bg-sl text-white font-bold text-xs rounded-xl shadow-lg transition-all uppercase tracking-wider disabled:opacity-45"
          >
            {loading ? "Writing prompt & calculating pricing..." : "Generate Wallpaper Prompt 🎨"}
          </button>
        </form>

        {/* Results Card */}
        {result && (
          <div className="w-full max-w-2xl bg-card-bg border border-brd rounded-3xl p-6 md:p-8 backdrop-blur-md grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Left Col - Image Display */}
            <div className="relative rounded-2xl overflow-hidden border border-brd aspect-[9/16] bg-deep max-h-[360px] mx-auto w-full">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all filter blur-[1px] opacity-75"
                style={{ backgroundImage: `url(${result.image_url})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/30 to-transparent flex flex-col items-center justify-center p-4">
                {!paymentComplete ? (
                  <div className="bg-black/60 backdrop-blur border border-gl/20 p-4 rounded-2xl text-center z-10 w-full max-w-[180px]">
                    <span className="text-xl block mb-1.5">🔒</span>
                    <div className="text-[10px] font-bold text-gl uppercase tracking-wider mb-1">Watermarked Preview</div>
                    <div className="text-[9px] text-mut">Pay ₹{result.price} to unlock full HD 8K download</div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 backdrop-blur p-3 rounded-2xl text-center z-10 w-full max-w-[180px]">
                    <span className="text-xl block mb-1">✅</span>
                    <div className="text-[9px] font-bold text-emerald-400 uppercase">Wallpaper Unlocked</div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col - Details & Buy */}
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-[9px] text-mut uppercase font-semibold">Prompt Written by AI</span>
                <div className="text-xs text-cream leading-relaxed mt-1 font-mono bg-deep/50 border border-brd/40 p-3 rounded-xl">
                  &quot;{result.prompt}&quot;
                </div>
              </div>

              <div className="flex justify-between items-center bg-deep/40 border border-brd/40 p-3 rounded-xl text-xs">
                <div>
                  <div className="text-[9px] text-mut uppercase">Traffic Load</div>
                  <div className="font-bold text-cream flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${result.traffic_level === "High" ? "bg-red-500" : "bg-emerald-500"}`} />
                    {result.traffic_level} ({result.traffic_requests} reqs)
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-mut uppercase">Surge Price</div>
                  <div className="font-bold text-gl text-sm mt-0.5">₹{result.price}</div>
                </div>
              </div>

              {!paymentComplete ? (
                <button
                  onClick={handlePurchase}
                  className="w-full py-3.5 bg-gradient-to-r from-gl to-[#c9922b] text-white font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 uppercase tracking-wider"
                >
                  Pay ₹{result.price} to Download Wallpaper
                </button>
              ) : (
                <a
                  href={result.image_url}
                  download={`divine_${result.deity.toLowerCase()}_wallpaper.png`}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all uppercase tracking-wider text-center no-underline block"
                >
                  📥 Download HD Wallpaper
                </a>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Paywall Checkout Modal */}
      {checkoutActive && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" style={{ backdropFilter: "blur(6px)" }}>
          <div className="bg-gradient-to-b from-[#2a1708] to-[#1c0f05] border-2 border-gl rounded-3xl p-8 max-w-sm w-full text-center relative shadow-2xl">
            <button className="absolute top-3 right-3 text-mut hover:text-cream text-lg" onClick={() => setCheckoutActive(false)}>✕</button>
            <div className="text-3xl mb-3">🪙</div>
            <div className="text-gl font-bold text-sm uppercase tracking-wider mb-2">Devotion Payment Gateway</div>
            <p className="text-xs text-mut mb-6 leading-relaxed">
              Confirm your transaction to generate the wallpaper prompt and download the original artwork.
            </p>

            <div className="p-4 bg-deep/80 border border-brd rounded-xl mb-6 text-left space-y-2">
              <div className="text-xs text-cream flex justify-between">
                <span className="text-mut">Product:</span>
                <span className="font-semibold">HD Wallpaper of {result?.deity}</span>
              </div>
              <div className="text-xs text-cream flex justify-between">
                <span className="text-mut">Dynamic Surge Cost:</span>
                <span className="font-bold text-gl">₹{result?.price}</span>
              </div>
            </div>

            <button
              onClick={completePayment}
              className="w-full py-3 bg-s hover:bg-sl text-white font-bold text-xs rounded-xl shadow-lg transition-all uppercase tracking-wider"
            >
              Authorize payment (Mock)
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
