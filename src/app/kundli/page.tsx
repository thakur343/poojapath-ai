"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import KundliReportDesign from "@/components/kundli/KundliReportDesign";
import { generateKundliReport } from "@/lib/kundli/constants";
import { downloadKundliPdf } from "@/lib/kundli/exportPdf";
import type { KundliBirthDetails, KundliReport } from "@/lib/kundli/types";
import { loadRazorpayScript } from "@/lib/payments/razorpay";

interface ReportTypeOption {
  id: "free" | "premium" | "career" | "marriage" | "yearly";
  name: string;
  price: number;
  icon: string;
  desc: string;
}

const REPORT_TYPES: ReportTypeOption[] = [
  { id: "free", name: "Free Snapshot", price: 0, icon: "📊", desc: "Basic on-screen house and sign placements overview." },
  { id: "premium", name: "Premium Vedic Report", price: 99, icon: "📿", desc: "In-depth birth chart analysis, Sanskrit terms, and download-ready PDF." },
  { id: "career", name: "Career & Wealth Report", price: 299, icon: "💼", desc: "Favorable career directions, Dhan Yoga analysis, and wealth timings." },
  { id: "marriage", name: "Marriage Compatibility", price: 299, icon: "💞", desc: "Ashta Koota Guna Milan, Manglik dosha breakdown, and advice." },
  { id: "yearly", name: "Yearly Horoscope 2026", price: 499, icon: "📅", desc: "Full month-by-month predictions, transit outcomes, and remedies." },
];

export default function KundliPage() {
  const [step, setStep] = useState(1);
  const [selectedReport, setSelectedReport] = useState<ReportTypeOption>(REPORT_TYPES[1]); // Default to Premium
  const [form, setForm] = useState<KundliBirthDetails>({
    name: "",
    dob: "",
    time: "",
    place: "",
  });
  const [report, setReport] = useState<KundliReport | null>(null);
  const [error, setError] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [showMockPay, setShowMockPay] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [remedies, setRemedies] = useState<{
    ruling_planet: string;
    gemstone: string;
    deity: string;
    lucky_color: string;
    remedies: string[];
  } | null>(null);

  useEffect(() => {
    if (report?.moonSign?.english) {
      fetch("http://localhost:8000/api/kundli/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rashi: report.moonSign.english,
          lagna: report.lagna.english,
        })
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.status === "success") {
          setRemedies(data);
        }
      })
      .catch(err => console.error("Remedy load error:", err));
    } else {
      setRemedies(null);
    }
  }, [report]);

  const updateField = (field: keyof KundliBirthDetails, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!form.name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (!form.dob) {
        setError("Please select your date of birth.");
        return;
      }
      if (!form.place.trim()) {
        setError("Please enter your place of birth.");
        return;
      }

      // If free report was chosen, skip payment step (Step 3) and generate immediately
      if (selectedReport.price === 0) {
        setReport(generateKundliReport(form));
        setStep(4);
      } else {
        setStep(3);
      }
    }
  };

  const handleBackStep = () => {
    setStep((prev) => prev - 1);
  };

  // Web Audio API Synthesis for Payment Success Sound (Conch / Long bell sound)
  const playSuccessChime = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(330, audioCtx.currentTime); // E4 fundamental
      osc.frequency.exponentialRampToValueAtTime(660, audioCtx.currentTime + 0.6); // Ramp up

      gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.8);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.8);
    } catch {
      // Audio failed
    }
  };

  const handlePayment = async () => {
    setIsPaying(true);
    setError("");

    try {
      // 1. Load Razorpay Client SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Failed to load Razorpay client SDK. Check your internet connection.");
        setIsPaying(false);
        return;
      }

      // 2. Call backend order generation API
      const orderRes = await fetch("/api/payments/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: selectedReport.price }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.error || "Failed to initiate transaction.");
      }

      const orderData = await orderRes.json();

      if (orderData.mock) {
        setShowMockPay(true);
        return;
      }

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Key ID
        amount: orderData.amount, // Amount in paise
        currency: "INR",
        name: "PoojaPath AI",
        description: `Unlock ${selectedReport.name}`,
        order_id: orderData.id,
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          // Signature Verification
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

            if (!verifyRes.ok) {
              throw new Error("Payment signature verification failed.");
            }

            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              playSuccessChime();
              setReport(generateKundliReport(form));
              setStep(4);
              setIsPaying(false);
            } else {
              throw new Error("Payment verification failed.");
            }
          } catch (verifyErr: unknown) {
            const errMsg = verifyErr instanceof Error ? verifyErr.message : "Failed to verify transaction. Contact support.";
            setError(errMsg);
            setIsPaying(false);
          }
        },
        prefill: {
          name: form.name,
          email: "",
          contact: "",  // Intentionally blank — do not autofill phone number
        },
        remember_customer: false,
        readonly: {
          contact: false,
          email: false,
        },
        theme: {
          color: "#E8600A",
        },
        modal: {
          ondismiss: function () {
            setIsPaying(false);
          },
        },
      };

      const RazorpayClass = (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay;
      const rzp = new RazorpayClass(options);
      rzp.open();
    } catch (err: unknown) {
      console.error("Payment flow error:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to initiate payment. Please try again.";
      setError(errMsg);
      setIsPaying(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      // If downloaded, export PDF (either premium SVG export or fallbacks)
      await downloadKundliPdf(report, reportRef.current);
    } catch {
      setError("PDF download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const loadSampleChart = () => {
    setForm({
      name: "Rahul",
      dob: "2001-03-17",
      time: "05:00",
      place: "Bihar, India",
    });
    setSelectedReport(REPORT_TYPES[1]);
    setReport(
      generateKundliReport({
        name: "Rahul",
        dob: "2001-03-17",
        time: "05:00",
        place: "Bihar, India",
      })
    );
    setStep(4);
    setError("");
  };

  return (
    <div className="kundli-page flex flex-col min-h-screen">
      <header className="kundli-header">
        <div className="kundli-header-left">
          <Link href="/" className="kundli-back">
            ← Back to Home
          </Link>
          <h1>Janam Kundli Generator</h1>
        </div>
        {step === 4 && selectedReport.price > 0 && (
          <button
            type="button"
            className="kundli-pdf-btn"
            onClick={handleDownloadPdf}
            disabled={downloading}
          >
            {downloading ? "Preparing PDF..." : "⬇ Download PDF"}
          </button>
        )}
      </header>

      <main className="kundli-main flex-1 flex flex-col justify-center items-center py-8 px-4 w-full">
        {step < 4 && (
          <div className="w-full max-w-md bg-card-bg border border-brd rounded-2xl p-6 shadow-2xl backdrop-blur-md">
            {/* Step Indicators */}
            <div className="steps mb-6">
              <div className={`stp ${step >= 1 ? "act" : ""} ${step > 1 ? "done" : ""}`}></div>
              <div className={`stp ${step >= 2 ? "act" : ""} ${step > 2 ? "done" : ""}`}></div>
              <div className={`stp ${step >= 3 ? "act" : ""} ${step > 3 ? "done" : ""}`}></div>
            </div>

            {/* STEP 1: SELECT REPORT TYPE */}
            {step === 1 && (
              <div className="fscr active">
                <div className="ftitle">1. Choose Report Type</div>
                <div className="fsub">Select your astrological chart configuration.</div>

                <div className="flex flex-col gap-3.5 mb-6">
                  {REPORT_TYPES.map((option) => (
                    <div
                      key={option.id}
                      onClick={() => setSelectedReport(option)}
                      className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedReport.id === option.id
                          ? "border-s bg-s/10 shadow-[0_0_15px_rgba(232,96,10,0.12)]"
                          : "border-brd hover:bg-card-bg/50"
                      }`}
                    >
                      <div className="text-2xl mt-0.5">{option.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-cream">{option.name}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            option.price === 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-s/20 text-sl"
                          }`}>
                            {option.price === 0 ? "FREE" : `₹${option.price}`}
                          </span>
                        </div>
                        <p className="text-[11px] text-mut mt-1 leading-relaxed">{option.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" className="sbtn" onClick={handleNextStep}>
                  Enter Birth Details →
                </button>

                <button type="button" className="kundli-sample-btn mt-4 w-full" onClick={loadSampleChart}>
                  Load Sample Chart — Rahul (Scorpio Lagna)
                </button>
              </div>
            )}

            {/* STEP 2: ENTER BIRTH DETAILS */}
            {step === 2 && (
              <div className="fscr active">
                <div className="ftitle">2. Enter Birth Details</div>
                <div className="fsub">Precision coordinates for planetary houses.</div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleNextStep();
                  }}
                >
                  <label htmlFor="kundli-name">Full Name</label>
                  <input
                    id="kundli-name"
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    autoComplete="name"
                  />

                  <div className="kundli-row gap-4 mb-3">
                    <div>
                      <label htmlFor="kundli-dob">Date of Birth</label>
                      <input
                        id="kundli-dob"
                        type="date"
                        value={form.dob}
                        onChange={(e) => updateField("dob", e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="kundli-time">Time of Birth</label>
                      <input
                        id="kundli-time"
                        type="time"
                        value={form.time}
                        onChange={(e) => updateField("time", e.target.value)}
                      />
                    </div>
                  </div>

                  <label htmlFor="kundli-place">Place of Birth</label>
                  <input
                    id="kundli-place"
                    type="text"
                    placeholder="e.g. Bihar, India"
                    value={form.place}
                    onChange={(e) => updateField("place", e.target.value)}
                    autoComplete="address-level2"
                  />

                  {error && <p className="kundli-error">{error}</p>}

                  <div className="brow mt-4">
                    <button type="button" className="bbk" onClick={handleBackStep}>
                      Back
                    </button>
                    <button type="submit" className="bnx font-bold">
                      {selectedReport.price === 0 ? "Generate Snapshot ✨" : "Continue to Checkout →"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 3: PAYMENT & DAKSHINA */}
            {step === 3 && (
              <div className="fscr active">
                <div className="ftitle">3. Spiritual Offering</div>
                <div className="fsub">Unlock your complete Vedic chart analysis.</div>

                <div className="paysum mb-6">
                  <div className="payln">
                    <span>Selected Option:</span>
                    <span className="font-semibold text-cream">{selectedReport.name}</span>
                  </div>
                  <div className="payln">
                    <span>High-Res PDF Download:</span>
                    <span className="text-emerald-400">Included</span>
                  </div>
                  <div className="payln">
                    <span>Planetary Remedies:</span>
                    <span className="text-emerald-400">Included</span>
                  </div>
                  <div className="payln tot border-t border-brd pt-3 mt-3 text-base">
                    <span>Total Dakshina:</span>
                    <span className="font-bold text-s">₹{selectedReport.price}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="sbtn"
                  onClick={handlePayment}
                  disabled={isPaying}
                >
                  {isPaying ? "Verifying Transaction..." : `Pay ₹${selectedReport.price} Securely 🔒`}
                </button>

                <div className="tbadges mt-4">
                  <div className="tbadge">💳 UPI / NetBanking / Cards</div>
                  <div className="tbadge">🛡️ Razorpay Secure Gateway</div>
                </div>

                <div className="brow mt-6">
                  <button type="button" className="bbk w-full" onClick={handleBackStep}>
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: VIEW REPORT & EXPORT PDF */}
        {step === 4 && report && (
          <div className="w-full max-w-3xl flex flex-col items-center gap-6">
            {selectedReport.price === 0 ? (
              // Basic Snapshot View (No full SVG, simple table, and upsell block)
              <div className="w-full max-w-xl bg-card-bg border border-brd rounded-2xl p-6 backdrop-blur-md">
                <div className="text-center mb-6">
                  <div className="text-xs text-s font-semibold uppercase tracking-widest mb-1">Horoscope Snapshot</div>
                  <h2 className="font-cormorant text-3xl font-bold text-cream">Vedic Placements Overview</h2>
                  <p className="text-[11px] text-mut max-w-xs mx-auto mt-1">Generated snapshot details for {report.name}.</p>
                </div>

                <div className="flex flex-col gap-2.5 mb-6 border border-brd/40 rounded-xl overflow-hidden bg-deep/40">
                  <div className="flex justify-between px-4 py-3 border-b border-brd/40 text-xs">
                    <span className="text-mut font-semibold">Lagna (Ascendant)</span>
                    <span className="font-bold text-cream">{report.lagna.english} ({report.lagna.sanskrit}) {report.lagna.symbol}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 border-b border-brd/40 text-xs">
                    <span className="text-mut font-semibold">Moon Sign (Rashi)</span>
                    <span className="font-bold text-cream">{report.moonSign.english} ({report.moonSign.sanskrit}) {report.moonSign.symbol}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 border-b border-brd/40 text-xs">
                    <span className="text-mut font-semibold">Birth Nakshatra</span>
                    <span className="font-bold text-cream">{report.nakshatra}</span>
                  </div>
                  <div className="flex justify-between px-4 py-3 text-xs">
                    <span className="text-mut font-semibold">Current Mahadasha</span>
                    <span className="font-bold text-cream">{report.dasha}</span>
                  </div>
                </div>

                {/* Upsell Banner */}
                <div className="bg-gradient-to-r from-s/10 to-gl/5 border border-s/20 rounded-xl p-5 text-center mb-6">
                  <span className="text-2xl mb-2 block">📿</span>
                  <div className="text-sm font-bold text-gl">Unlock Gold Foil PDF & Full Analysis</div>
                  <p className="text-[10px] text-mut leading-relaxed max-w-sm mx-auto mt-2">
                    Get access to the premium North Indian Diamond chart, planetary degree coordinates, and personalized spiritual remedies for just ₹99.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedReport(REPORT_TYPES[1]); // Upgrade to Premium
                      setStep(3); // Go to checkout
                    }}
                    className="sbtn mt-4 py-2.5 text-xs font-bold"
                  >
                    Upgrade to Premium PDF Report (₹99)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setReport(null);
                  }}
                  className="bbk w-full py-3 border border-brd rounded-xl font-semibold hover:bg-card-bg/40 text-xs text-center"
                >
                  Generate Another Chart
                </button>
              </div>
            ) : (
              // Premium Gold Foil SVG Chart View
              <section className="kundli-report-section w-full flex flex-col items-center">
                <div className="kundli-report-wrap" ref={reportRef}>
                  <KundliReportDesign report={report} id="kundli-report-export" />
                </div>
                
                <div className="w-full max-w-md grid grid-cols-2 gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setReport(null);
                    }}
                    className="bbk py-3 border border-brd rounded-xl font-semibold hover:bg-card-bg/40 text-xs text-center"
                  >
                    Generate Another Chart
                  </button>
                  <button
                    type="button"
                    className="tool-btn py-3 font-semibold text-xs"
                    onClick={handleDownloadPdf}
                    disabled={downloading}
                  >
                    {downloading ? "Preparing PDF..." : "Download PDF Report"}
                  </button>
                </div>
              </section>
            )}

            {remedies && (
              <div className="w-full max-w-2xl bg-card-bg/60 border border-brd rounded-2xl p-6 backdrop-blur-md mt-6">
                <h3 className="font-cormorant text-xl font-bold text-gl border-b border-brd/40 pb-2 mb-4 flex items-center gap-2">
                  <span>🕉️</span> Recommended Vedic Remedies (Upay)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-xs">
                  <div className="bg-deep/40 p-3 rounded-lg border border-brd/30">
                    <div className="text-mut uppercase text-[9px] font-semibold">Ruling Planet</div>
                    <div className="font-bold text-cream mt-1">{remedies.ruling_planet}</div>
                  </div>
                  <div className="bg-deep/40 p-3 rounded-lg border border-brd/30">
                    <div className="text-mut uppercase text-[9px] font-semibold">Suggested Gemstone</div>
                    <div className="font-bold text-cream mt-1">{remedies.gemstone}</div>
                  </div>
                  <div className="bg-deep/40 p-3 rounded-lg border border-brd/30">
                    <div className="text-mut uppercase text-[9px] font-semibold">Ishta Devata</div>
                    <div className="font-bold text-cream mt-1">{remedies.deity}</div>
                  </div>
                  <div className="bg-deep/40 p-3 rounded-lg border border-brd/30">
                    <div className="text-mut uppercase text-[9px] font-semibold">Lucky Color</div>
                    <div className="font-bold text-cream mt-1">{remedies.lucky_color}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-[10px] text-mut uppercase font-semibold">Remedial Actions:</div>
                  {remedies.remedies.map((rem, idx) => (
                    <div key={idx} className="flex gap-2 text-xs text-cream/90 bg-deep/20 p-2.5 rounded-xl border border-brd/20">
                      <span className="text-s font-bold">•</span>
                      <span>{rem}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Simulated Sandbox Payment Modal */}
      {showMockPay && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-card-bg border border-brd max-w-sm w-full rounded-2xl p-6 shadow-[0_0_50px_rgba(232,96,10,0.2)] text-center animate-in fade-in zoom-in duration-300">
            <span className="text-4xl block mb-2">🕉️</span>
            <h3 className="font-cormorant text-2xl font-bold text-gl mb-1">Sandbox Gateway</h3>
            <p className="text-[10px] text-mut uppercase font-semibold tracking-wider mb-4">PoojaPath AI Payment Simulation</p>

            <div className="bg-deep/50 border border-brd/40 rounded-xl p-4 text-left mb-6">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-mut font-medium">Service:</span>
                <span className="font-bold text-cream">{selectedReport.name}</span>
              </div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-mut font-medium">Seeker Name:</span>
                <span className="font-bold text-cream">{form.name}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-brd/20 font-bold">
                <span className="text-mut">Dakshina:</span>
                <span className="text-s">₹{selectedReport.price}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  playSuccessChime();
                  setReport(generateKundliReport(form));
                  setStep(4);
                  setShowMockPay(false);
                  setIsPaying(false);
                }}
                className="sbtn py-3 font-semibold text-xs text-white"
              >
                Simulate Successful Offering ✨
              </button>
              <button
                type="button"
                onClick={() => {
                  setError("Payment failed. Please choose another payment method.");
                  setShowMockPay(false);
                  setIsPaying(false);
                }}
                className="w-full py-3 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs transition-all"
              >
                Simulate Payment Failure
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowMockPay(false);
                  setIsPaying(false);
                }}
                className="bbk py-3 text-xs"
              >
                Cancel
              </button>
            </div>
            <p className="text-[9px] text-mut mt-4">
              * Note: Since a live Secret Key is not configured, we are simulating the checkout.
            </p>
          </div>
        </div>
      )}
    </div>

  );
}
