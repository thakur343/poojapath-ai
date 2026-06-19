"use client";

import React, { useState, useEffect, useRef } from "react";

const DAY_THEME: Record<number, {
  name: string; deity: string; emoji: string;
  color1: string; color2: string; accent: string;
  glow: string; mantraDay: string; bgPattern: string;
}> = {
  0: { name:"Ravivar",   deity:"Surya Dev",   emoji:"☀️", color1:"#E8600A", color2:"#F9A825", accent:"#FFD54F", glow:"rgba(232,96,10,0.35)",  mantraDay:"Aaj Ravivar hai — Surya Dev ki kripa aap par hai", bgPattern:"radial-gradient(ellipse 80% 60% at 70% 40%, rgba(232,96,10,0.12), transparent)" },
  1: { name:"Somvar",    deity:"Shiv Ji",     emoji:"🔱", color1:"#5c6bc0", color2:"#283593", accent:"#90caf9", glow:"rgba(92,107,192,0.35)",  mantraDay:"Aaj Somvar hai — Om Namah Shivaya ka paath karein", bgPattern:"radial-gradient(ellipse 80% 60% at 70% 40%, rgba(92,107,192,0.15), transparent)" },
  2: { name:"Mangalvar", deity:"Hanuman Ji",  emoji:"🙏", color1:"#c62828", color2:"#b71c1c", accent:"#ef9a9a", glow:"rgba(198,40,40,0.35)",   mantraDay:"Aaj Mangalvar hai — Jai Bajrang Bali! Shakti ka din", bgPattern:"radial-gradient(ellipse 80% 60% at 70% 40%, rgba(198,40,40,0.15), transparent)" },
  3: { name:"Budhvar",   deity:"Ganesh Ji",   emoji:"🐘", color1:"#2e7d32", color2:"#1b5e20", accent:"#a5d6a7", glow:"rgba(46,125,50,0.35)",   mantraDay:"Aaj Budhvar hai — Jai Shri Ganesh! Siddhi ka din", bgPattern:"radial-gradient(ellipse 80% 60% at 70% 40%, rgba(46,125,50,0.15), transparent)" },
  4: { name:"Guruvar",   deity:"Vishnu Ji",   emoji:"🪷", color1:"#f57f17", color2:"#e65100", accent:"#ffe082", glow:"rgba(245,127,23,0.35)",  mantraDay:"Aaj Guruvar hai — Jai Shri Hari! Guru ki kripa", bgPattern:"radial-gradient(ellipse 80% 60% at 70% 40%, rgba(245,127,23,0.12), transparent)" },
  5: { name:"Shukravar", deity:"Lakshmi Ji",  emoji:"🌸", color1:"#ad1457", color2:"#880e4f", accent:"#f48fb1", glow:"rgba(173,20,87,0.35)",   mantraDay:"Aaj Shukravar hai — Jai Maa Lakshmi! Dhan ka din", bgPattern:"radial-gradient(ellipse 80% 60% at 70% 40%, rgba(173,20,87,0.15), transparent)" },
  6: { name:"Shanivar",  deity:"Shani Dev",   emoji:"⚖️", color1:"#37474f", color2:"#263238", accent:"#b0bec5", glow:"rgba(55,71,79,0.4)",     mantraDay:"Aaj Shanivar hai — Jai Shani Dev! Karma ka din", bgPattern:"radial-gradient(ellipse 80% 60% at 70% 40%, rgba(55,71,79,0.2), transparent)" },
};

export default function MantraForm() {
  const [step, setStep] = useState(1);
  const [intention, setIntention] = useState("");
  const [formData, setFormData] = useState({ name:"", gotra:"", dob:"", time:"" });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [jaapCount, setJaapCount] = useState(0);
  const [urgency, setUrgency] = useState(7);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const day = new Date().getDay();
  const T = DAY_THEME[day];

  // Count-down urgency
  useEffect(() => {
    const t = setInterval(() => {
      setUrgency(u => u > 1 ? u - 1 : 12);
    }, 8000);
    return () => clearInterval(t);
  }, []);

  const intentions = [
    { id:"health", icon:"🌿", name:"Health & Healing",  sub:"Arogya Prapti" },
    { id:"wealth", icon:"💰", name:"Wealth & Career",   sub:"Lakshmi Kripa" },
    { id:"peace",  icon:"🕊️", name:"Mental Peace",      sub:"Shanti Mantra" },
    { id:"love",   icon:"❤️", name:"Love & Marriage",  sub:"Prem Siddhi" },
    { id:"edu",    icon:"📚", name:"Education",         sub:"Vidya Prapti" },
    { id:"obs",    icon:"🛡️", name:"Remove Obstacles",  sub:"Vighna Haran" },
  ];

  const handleNext = () => {
    if (step === 1 && intention) setStep(2);
    else if (step === 2 && formData.name && formData.dob) setStep(3);
  };
  const handleBack = () => { if (step > 1) setStep(step - 1); };
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    try {
      const isScriptLoaded = await loadRazorpay();
      if (!isScriptLoaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        setIsProcessing(false);
        return;
      }

      const res = await fetch("/api/payments/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 51 }),
      });

      if (!res.ok) {
        throw new Error("Failed to initiate order creation with server");
      }

      const orderData = await res.json();

      if (orderData.mock) {
        // If the server returns a mock order (due to placeholder credentials in .env.local),
        // we simulate a successful transaction for testing/demo purposes.
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: orderData.id,
            razorpay_payment_id: `pay_mock_${Date.now()}`,
            razorpay_signature: "mock_signature",
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.verified) {
          alert("Demo Mode: Simulating successful payment of ₹51.");
          setStep(4);
          startAIGeneration();
        } else {
          alert("Demo Mode: Payment verification failed.");
        }
        setIsProcessing(false);
        return;
      }
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SzDfNB7SatoLK5",
        amount: orderData.amount,
        currency: "INR",
        name: "PoojaPath AI",
        description: "Dakshina for Personalized Mantra",
        order_id: orderData.id,
        handler: async function (response: any) {
          setIsProcessing(true);
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              setStep(4);
              startAIGeneration();
            } else {
              alert("Payment verification failed! Please try again or contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            alert("Something went wrong during payment verification.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: formData.name,
          email: "",
          contact: "",
        },
        theme: {
          color: T.color1 || "#E8600A",
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initialization error:", error);
      alert("Could not start payment. Please try again.");
      setIsProcessing(false);
    }
  };

  const startAIGeneration = () => {
    setShowLoading(true); setLoadingStep(1);
    setTimeout(() => setLoadingStep(2), 1200);
    setTimeout(() => setLoadingStep(3), 2400);
    setTimeout(() => setShowLoading(false), 3600);
  };
  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg");
      audioRef.current.loop = true;
    }
    if (isPlaying) audioRef.current.pause(); else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };
  useEffect(() => () => { audioRef.current?.pause(); }, []);

  return (
    <section className="fsec" id="form-sec" style={{ position:"relative" }}>
      {/* ── Day-based ambient background ── */}
      <div style={{
        position:"absolute", inset:"-60px -40px", pointerEvents:"none", zIndex:0,
        background: T.bgPattern,
        transition:"background 1.5s ease",
      }} />
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
        background:`radial-gradient(circle 300px at 10% 50%, ${T.glow.replace("0.35","0.07")}, transparent)`,
      }} />

      {/* ── Left info side ── */}
      <div className="info-side" style={{ position:"relative", zIndex:1 }}>
        {/* Day banner */}
        <div style={{
          display:"flex", alignItems:"center", gap:10, marginBottom:18,
          padding:"10px 16px", borderRadius:14,
          background:`linear-gradient(135deg, ${T.color1}18, ${T.color2}10)`,
          border:`1px solid ${T.color1}30`,
          backdropFilter:"blur(10px)",
        }}>
          <span style={{ fontSize:24 }}>{T.emoji}</span>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:T.accent, letterSpacing:"0.08em", textTransform:"uppercase" }}>
              {T.name} · {T.deity}
            </div>
            <div style={{ fontSize:10, color:"rgba(200,175,140,0.5)", marginTop:2 }}>{T.mantraDay}</div>
          </div>
          <div style={{
            marginLeft:"auto", fontSize:9, fontWeight:700,
            background:`${T.color1}20`, color:T.accent,
            padding:"3px 10px", borderRadius:20, border:`1px solid ${T.color1}30`,
          }}>
            LIVE
            <span style={{ display:"inline-block", width:5, height:5, borderRadius:"50%", background:T.accent, marginLeft:5, verticalAlign:"middle", animation:"liveDot 1.2s infinite" }} />
          </div>
        </div>

        <div className="info-tag">AI-Powered Precision</div>
        <h2>The Math of <em>Karma</em></h2>
        <p>We analyze 12 planetary positions, 27 Nakshatras, and your specific Dasha to find the exact resonance frequency (Mantra) your life needs right now.</p>

        <div className="flist">
          {[
            { icon:"⚡", t:"Instant Personalization", s:"Generated in 0.2 seconds using our fine-tuned Vedic LLM model." },
            { icon:"🎵", t:"Perfect Pronunciation",   s:"Listen to the correct phonetic chanting to maximize cosmic resonance." },
            { icon:"🔒", t:"100% Karmic Privacy",     s:"Your birth details are never stored. Computations are done in memory." },
          ].map(fi => (
            <div className="fi" key={fi.t} style={{ borderColor:`${T.color1}15` }}>
              <div className="fi-icon" style={{ background:`linear-gradient(135deg,${T.color1},${T.color2})`, boxShadow:`0 4px 14px ${T.glow}` }}>{fi.icon}</div>
              <div>
                <div className="fi-tt">{fi.t}</div>
                <div className="fi-ts">{fi.s}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div style={{
          padding:"16px 18px", borderRadius:16,
          background:"rgba(255,248,235,0.025)", border:"1px solid rgba(200,145,60,0.1)",
          marginBottom:24, backdropFilter:"blur(8px)",
        }}>
          <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:10 }}>
            <div style={{ display:"flex" }}>
              {["👩","👨","👩‍🦱","👨‍🦳","👩‍🦰"].map((e,i) => (
                <div key={i} style={{
                  width:28, height:28, borderRadius:"50%",
                  background:`linear-gradient(135deg,${T.color1}40,${T.color2}30)`,
                  border:"2px solid rgba(6,3,2,0.8)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:14, marginLeft: i>0 ? -8 : 0, zIndex:5-i, position:"relative",
                }}>{e}</div>
              ))}
            </div>
            <div style={{ fontSize:11, color:"rgba(200,175,140,0.55)" }}>
              <strong style={{ color:"rgba(242,201,110,0.8)" }}>2,847</strong> people received their mantra this week
            </div>
          </div>
          <div style={{ display:"flex", gap:2 }}>
            {"★★★★★".split("").map((s,i) => (
              <span key={i} style={{ color:T.accent, fontSize:14 }}>{s}</span>
            ))}
            <span style={{ fontSize:11, color:"rgba(200,175,140,0.45)", marginLeft:8 }}>4.9 / 5 from 12k+ reviews</span>
          </div>
        </div>

        <div className="stats-r">
          <div>
            <div className="stat-n" style={{ color:T.accent }}>100k+</div>
            <div className="stat-l">Ancient Shlokas</div>
          </div>
          <div>
            <div className="stat-n" style={{ color:T.accent }}>99.8%</div>
            <div className="stat-l">Astrological Accuracy</div>
          </div>
          <div>
            <div className="stat-n" style={{ color:T.accent }}>₹51</div>
            <div className="stat-l">Only Today's Offer</div>
          </div>
        </div>
      </div>

      {/* ── Right form card ── */}
      <div className="fcard" style={{
        position:"sticky", top:80, zIndex:1,
        border:`1px solid ${T.color1}30`,
        boxShadow:`0 24px 70px rgba(0,0,0,0.5), 0 0 60px ${T.glow.replace("0.35","0.06")}, inset 0 1px 0 ${T.color1}15`,
        transition:"border-color 1s, box-shadow 1s",
      }}>
        {/* Colored top accent bar */}
        <div style={{
          height:3, borderRadius:"20px 20px 0 0", margin:"-28px -28px 20px",
          background:`linear-gradient(90deg, ${T.color1}, ${T.color2}, ${T.color1})`,
          backgroundSize:"200% 100%",
          animation:"shimmerBar 3s linear infinite",
        }} />

        {step < 4 && (
          <>
            <div className="steps">
              {[1,2,3].map(s => (
                <div key={s} className={`stp ${step>=s?"act":""} ${step>s?"done":""}`}
                  style={{ background: step>s ? T.color1 : step===s ? T.accent+"80" : undefined }} />
              ))}
            </div>

            {/* Step 1 — Sankalpa */}
            {step === 1 && (
              <div className="fscr active">
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:22 }}>{T.emoji}</span>
                  <div className="ftitle">Select Your Sankalpa</div>
                </div>
                <div className="fsub">What area of your life needs divine intervention today?</div>
                <label>Core Intention</label>
                <div className="rgrid">
                  {intentions.map(int => (
                    <div
                      key={int.id}
                      className={`rbtn ${intention===int.id?"sel":""}`}
                      onClick={() => setIntention(int.id)}
                      style={intention===int.id ? {
                        border:`2px solid ${T.color1}`,
                        background:`${T.color1}12`,
                        boxShadow:`0 0 20px ${T.glow}`,
                      } : {}}
                    >
                      <span className="re">{int.icon}</span>
                      <span className="rn">{int.name}</span>
                      <span className="ren">{int.sub}</span>
                    </div>
                  ))}
                </div>

                {/* Urgency strip */}
                <div style={{
                  display:"flex", alignItems:"center", gap:8, marginBottom:10,
                  padding:"8px 12px", borderRadius:10,
                  background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.18)",
                }}>
                  <span style={{ fontSize:14 }}>🔥</span>
                  <span style={{ fontSize:11, color:"rgba(248,113,113,0.85)" }}>
                    <strong>{urgency} log</strong> abhi apna mantra le rahe hain — sirf <strong style={{ color:"#f59e0b" }}>₹51</strong>
                  </span>
                </div>

                <button className="sbtn" onClick={handleNext} disabled={!intention}
                  style={{
                    background:`linear-gradient(135deg, ${T.color1}, ${T.color2})`,
                    boxShadow:`0 8px 30px ${T.glow}`,
                    fontSize:15, padding:"15px", letterSpacing:"0.04em",
                  }}
                >
                  Continue — Get My Mantra 🙏
                  <span className="bsub">Personalized in 0.2 seconds · Only ₹51</span>
                </button>
              </div>
            )}

            {/* Step 2 — Birth Details */}
            {step === 2 && (
              <div className="fscr active">
                <div className="ftitle">Janma Kundli Details</div>
                <div className="fsub">Precise planetary alignment ke liye aapki janm patrika chahiye</div>

                <label>Poora Naam</label>
                <input type="text" placeholder="e.g. Rahul Sharma" value={formData.name}
                  onChange={e => setFormData({...formData, name:e.target.value})}
                  style={{ borderColor:`${T.color1}20` }} />

                <label>Gotra (Optional)</label>
                <input type="text" placeholder="e.g. Kashyapa" value={formData.gotra}
                  onChange={e => setFormData({...formData, gotra:e.target.value})}
                  style={{ borderColor:`${T.color1}20` }} />

                <div style={{ display:"flex", gap:12 }}>
                  <div style={{ flex:1 }}>
                    <label>Janm Tithi</label>
                    <input type="date" value={formData.dob}
                      onChange={e => {
                        const val = e.target.value;
                        if (!val) { setFormData({...formData, dob:""}); return; }
                        const parts = val.split("-");
                        if (parts[0]?.length > 4) { parts[0] = parts[0].slice(0,4); }
                        setFormData({...formData, dob:parts.join("-")});
                      }}
                      style={{ borderColor:`${T.color1}20` }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <label>Janm Samay (Optional)</label>
                    <input type="time" value={formData.time}
                      onChange={e => setFormData({...formData, time:e.target.value})}
                      style={{ borderColor:`${T.color1}20` }} />
                  </div>
                </div>

                {/* Privacy note */}
                <div style={{
                  fontSize:10, color:"rgba(200,175,140,0.4)", display:"flex",
                  alignItems:"center", gap:6, padding:"8px 0", marginBottom:4,
                }}>
                  <span>🔒</span> Aapka data kabhi store nahi hota. 256-bit encrypted.
                </div>

                <div className="brow">
                  <button className="bbk" onClick={handleBack}>← Back</button>
                  <button className="bnx" onClick={handleNext} disabled={!formData.name||!formData.dob}
                    style={{
                      background:`linear-gradient(135deg,${T.color1},${T.color2})`,
                      boxShadow:`0 4px 16px ${T.glow}`,
                    }}
                  >
                    Generate Mantra ✨
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Payment */}
            {step === 3 && (
              <div className="fscr active">
                {/* Trust header */}
                <div style={{
                  textAlign:"center", padding:"12px 0 16px",
                  borderBottom:`1px solid ${T.color1}15`,
                  marginBottom:16,
                }}>
                  <div style={{ fontSize:28, marginBottom:4 }}>{T.emoji}</div>
                  <div className="ftitle">Dakshina — Aapka Mantra Ready Hai!</div>
                  <div className="fsub">Ek choti si offering se apna personalized mantra unlock karein</div>
                </div>

                {/* What you get */}
                <div style={{
                  background:`linear-gradient(135deg, ${T.color1}08, ${T.color2}05)`,
                  border:`1px solid ${T.color1}20`,
                  borderRadius:16, padding:"14px 16px", marginBottom:14,
                }}>
                  <div style={{ fontSize:10, fontWeight:700, color:T.accent, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>
                    Aapko Milega
                  </div>
                  {[
                    ["✨", "Personalized Mantra",       "Aapke Nakshatra ke anusar"],
                    ["🎵", "Audio Pronunciation Guide", "Sahi ucharan ke saath"],
                    ["📊", "Kundli Snapshot",            "12 planets ka analysis"],
                    ["💎", "Remedy & Upay",             "Dosh nivaran ke liye"],
                  ].map(([ic,nm,sub]) => (
                    <div key={nm} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 0", borderBottom:"1px solid rgba(200,145,60,0.06)" }}>
                      <span style={{ fontSize:16 }}>{ic}</span>
                      <div>
                        <div style={{ fontSize:12, color:"rgba(253,240,220,0.88)", fontWeight:500 }}>{nm}</div>
                        <div style={{ fontSize:10, color:"rgba(200,175,140,0.45)" }}>{sub}</div>
                      </div>
                      <span style={{ marginLeft:"auto", color:"#4ade80", fontSize:12, fontWeight:700 }}>✓</span>
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="paysum" style={{ border:`1px solid ${T.color1}18` }}>
                  <div className="payln"><span>Personalized Mantra</span><span style={{ textDecoration:"line-through", color:"rgba(200,175,140,0.3)" }}>₹299</span></div>
                  <div className="payln"><span>Audio + Kundli + Upay</span><span>Included Free</span></div>
                  <div className="payln tot" style={{ color:T.accent }}>
                    <span>Total Dakshina</span>
                    <span style={{ fontSize:22, fontWeight:800 }}>₹51 🙏</span>
                  </div>
                </div>

                {/* Urgency */}
                <div style={{
                  display:"flex", alignItems:"center", gap:8, marginBottom:12, padding:"8px 12px",
                  borderRadius:10, background:"rgba(239,68,68,0.06)", border:"1px solid rgba(239,68,68,0.15)",
                }}>
                  <span>⏳</span>
                  <span style={{ fontSize:11, color:"rgba(248,113,113,0.8)" }}>
                    {T.name} special price — sirf aaj ke liye!
                  </span>
                </div>

                {/* Pay button */}
                <button className="sbtn" onClick={handleRazorpayPayment} disabled={isProcessing}
                  style={{
                    background: isProcessing
                      ? "rgba(200,145,60,0.3)"
                      : `linear-gradient(135deg, ${T.color1}, ${T.color2})`,
                    boxShadow: isProcessing ? "none" : `0 10px 40px ${T.glow}`,
                    fontSize:16, padding:"16px", position:"relative", overflow:"hidden",
                    letterSpacing:"0.03em",
                  }}
                >
                  {isProcessing ? (
                    <span>Processing... ⏳</span>
                  ) : (
                    <>
                      <span>🔒 Pay ₹51 — Get My Mantra</span>
                      <span className="bsub">UPI · Cards · NetBanking · 256-bit Secure</span>
                    </>
                  )}
                </button>

                {/* Trust badges */}
                <div className="tbadges" style={{ marginTop:14 }}>
                  {["💳 UPI / Cards", "🔒 256-bit SSL", "✅ RBI Compliant", "🔄 Instant Delivery"].map(b => (
                    <div className="tbadge" key={b}>{b}</div>
                  ))}
                </div>

                {/* Testimonial */}
                <div style={{
                  marginTop:14, padding:"12px 14px",
                  background:"rgba(255,248,235,0.025)", border:"1px solid rgba(200,145,60,0.08)",
                  borderRadius:12, fontSize:11, color:"rgba(200,175,140,0.55)", fontStyle:"italic",
                }}>
                  "Is mantra ne mere jeevan ko badal diya — career mein ek hafte mein breakthrough mila!"
                  <div style={{ marginTop:6, fontStyle:"normal", fontWeight:600, color:T.accent }}>— Priya S., Bengaluru ⭐⭐⭐⭐⭐</div>
                </div>

                <div className="brow" style={{ marginTop:12 }}>
                  <button className="bbk" onClick={handleBack} style={{ flex:1 }}>← Back</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Step 4 — Result */}
        {step === 4 && (
          <div className="fscr active">
            {showLoading ? (
              <div className="lscreen">
                <div className="om-spin" style={{ color:T.color1 }}>ॐ</div>
                <div className="ftitle">Cosmic Analysis Chal Rahi Hai...</div>
                <div className="lsteps">
                  {[
                    "Nakshatra positions analyze ho rahi hain",
                    "1 Lakh+ Vedic Shlokas query ho rahe hain",
                    "Phonetic audio generate ho raha hai",
                  ].map((txt,i) => (
                    <div key={i} className={`lstep ${loadingStep>i+1?"done":""} ${loadingStep===i+1?"act":""}`}
                      style={{ color: loadingStep===i+1 ? T.accent : undefined }}>
                      <div className="sdot" style={{ background: loadingStep>i+1?"#4ade80": loadingStep===i+1 ? T.color1 : undefined }} />
                      {txt}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ textAlign:"center" }}>
                  <div className="rbadge">✨ {T.emoji} Aapka Mantra Taiyaar Hai!</div>
                </div>
                <div className="mbox" style={{ border:`1px solid ${T.color1}25`, background:`linear-gradient(135deg,${T.color1}08,${T.color2}04)` }}>
                  <div className="m-skt">ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्</div>
                  <div className="m-rom">Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam</div>
                  <div className="m-mean">&quot;We worship the three-eyed One, who is fragrant and who nourishes all.&quot;</div>
                  <div className="chant-r">
                    <div className="chant-p" style={{ background:`${T.color1}15`, color:T.accent }}>108 baar chant karein</div>
                    <div className="chant-p" style={{ background:`${T.color1}15`, color:T.accent }}>Best: Brahma Muhurat 5:30 AM</div>
                  </div>
                </div>
                <div className={`audio-player ${isPlaying?"is-playing":""}`} style={{ border:`1px solid ${T.color1}15` }}>
                  <div style={{ fontSize:"10px", color:"rgba(200,175,140,0.5)", marginBottom:"8px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em" }}>
                    Sahi ucharan sunein
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"15px" }}>
                    <button className={`play-btn ${isPlaying?"playing":""}`} onClick={togglePlay}
                      style={{ background:`linear-gradient(135deg,${T.color1},${T.color2})`, boxShadow:`0 5px 18px ${T.glow}` }}>
                      {isPlaying?"⏸":"▶"}
                    </button>
                    {isPlaying && (
                      <div className="wave-bars">
                        {[0,.1,.2,.3,.4].map(d => <div key={d} className="wave-bar" style={{ animationDelay:`${d}s`, background:T.color1 }} />)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="jaap" style={{ border:`1px solid ${T.color1}12` }}>
                  <div className="jaap-t" style={{ color:T.accent }}>Digital Jaap Mala</div>
                  <div className={`jaap-n ${jaapCount>0?"bump":""}`} style={{ color:T.accent }}>{jaapCount}</div>
                  <div className="jaap-tgt">Target: 108</div>
                  <button className="jaap-b" onClick={() => setJaapCount(p=>p+1)}
                    style={{ background:`linear-gradient(135deg,${T.color1},${T.color2})`, boxShadow:`0 5px 20px ${T.glow}` }}>
                    CHANT
                  </button>
                  <div className="jaap-bar-c">
                    <div className="jaap-bar" style={{ width:`${Math.min((jaapCount/108)*100,100)}%`, background:`linear-gradient(90deg,${T.color1},${T.accent})` }} />
                  </div>
                  <button className="jaap-rst" onClick={() => setJaapCount(0)}>Reset Counter</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes liveDot {
          0%,100%{ opacity:1; transform:scale(1); }
          50%     { opacity:0.3; transform:scale(1.6); }
        }
        @keyframes shimmerBar {
          0%  { background-position:0% 50%; }
          100%{ background-position:200% 50%; }
        }
      `}</style>
    </section>
  );
}
