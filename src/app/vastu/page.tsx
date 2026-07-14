"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function VastuPage() {
  const [image, setImage] = useState<string | null>(null);
  const [roomType, setRoomType] = useState("bedroom");
  const [entranceDirection, setEntranceDirection] = useState("north");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startScan = async () => {
    if (!image) {
      setError("Please upload a room layout image first.");
      return;
    }
    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("https://poojapath-backend.onrender.com/api/vastu/scan-layout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_base64: image,
          room_type: roomType,
          entrance_direction: entranceDirection,
        }),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        setResult(data.analysis);
      } else {
        setError(data.message || "Failed to scan room layout. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please make sure the backend is running.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0502] text-cream relative">
      <Navbar />
      
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-s/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gl/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="w-full max-w-5xl mx-auto px-4 py-24 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 bg-s/10 border border-s/20 rounded-full text-xs text-s font-semibold uppercase tracking-wider mb-2">
            🧭 Vastu Vision AI
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-s to-gl bg-clip-text text-transparent mb-4">
            AI Vastu Shastra Layout Scanner
          </h1>
          <p className="text-sm md:text-base text-mut max-w-2xl mx-auto leading-relaxed">
            Upload your room map or layout photo, tell us the room type and direction, and our AI vision system will scan for Vastu Doshas and suggest corrections.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Controls Card */}
          <div className="p-6 md:p-8 bg-card-bg/60 border border-brd rounded-3xl backdrop-blur-md flex flex-col gap-6">
            <h2 className="text-xl font-bold text-gl border-b border-brd/40 pb-3 flex items-center gap-2">
              <span>🛠️</span> Scan Configuration
            </h2>

            {/* Room Type */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-mut font-bold uppercase tracking-wider">Room Type</label>
              <select
                className="w-full bg-deep border border-brd rounded-xl px-3 py-3 text-cream outline-none focus:border-s transition-all cursor-pointer font-semibold"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                <option value="bedroom">Bedroom (शयनकक्ष)</option>
                <option value="kitchen">Kitchen (रसोई)</option>
                <option value="mandir">Pooja Ghar / Mandir (मंदिर)</option>
                <option value="living_room">Living Room (बैठक कक्ष)</option>
                <option value="toilet">Toilet / Bathroom (शौचालय)</option>
              </select>
            </div>

            {/* Entrance Direction */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-mut font-bold uppercase tracking-wider">Entrance / Facing Direction</label>
              <select
                className="w-full bg-deep border border-brd rounded-xl px-3 py-3 text-cream outline-none focus:border-s transition-all cursor-pointer font-semibold"
                value={entranceDirection}
                onChange={(e) => setEntranceDirection(e.target.value)}
              >
                <option value="north">North (उत्तर)</option>
                <option value="south">South (दक्षिण)</option>
                <option value="east">East (पूर्व)</option>
                <option value="west">West (पश्चिम)</option>
                <option value="north-east">North-East (ईशान कोण - Auspicious)</option>
                <option value="north-west">North-West (वायव्य कोण)</option>
                <option value="south-east">South-East (आग्नेय कोण)</option>
                <option value="south-west">South-West (नैऋत्य कोण)</option>
              </select>
            </div>

            {/* Image Upload Area */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-mut font-bold uppercase tracking-wider">Room Layout Photo / Map</label>
              <div className="relative border-2 border-dashed border-brd/60 rounded-2xl p-6 text-center hover:border-s/60 transition-all cursor-pointer flex flex-col items-center justify-center bg-deep/20 min-h-[180px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                {image ? (
                  <div className="relative w-full h-full flex flex-col items-center gap-3">
                    <img src={image} alt="Preview" className="max-h-32 object-contain rounded-lg border border-brd" />
                    <span className="text-[10px] text-s font-semibold">Change Image</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">📸</span>
                    <span className="text-xs text-cream font-bold">Drag & Drop or Click to Upload</span>
                    <span className="text-[10px] text-mut">Supports JPG, PNG (Max 5MB)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={startScan}
              disabled={scanning}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-s to-gl text-white text-xs font-bold uppercase tracking-widest shadow-lg hover:shadow-s/20 transition-all active:scale-98 disabled:opacity-50"
            >
              {scanning ? "Scanning layout with Vision AI..." : "Scan Room Layout 🧭"}
            </button>
          </div>

          {/* Results Card */}
          <div className="p-6 md:p-8 bg-card-bg/60 border border-brd rounded-3xl backdrop-blur-md min-h-[400px] flex flex-col">
            <h2 className="text-xl font-bold text-gl border-b border-brd/40 pb-3 flex items-center gap-2 mb-4">
              <span>📋</span> AI Vastu Analysis
            </h2>

            {scanning && (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
                <div className="w-12 h-12 rounded-full border-2 border-s border-t-transparent animate-spin"></div>
                <div className="text-xs text-mut animate-pulse font-medium">Pandit Ji is analyzing your room coordinates...</div>
              </div>
            )}

            {!scanning && !result && !error && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-mut">
                <span className="text-4xl mb-3">🧭</span>
                <p className="text-xs max-w-xs leading-relaxed">
                  Configure your room details on the left, upload a layout image, and click "Scan Room Layout" to get live AI analysis here.
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-950/20 border border-red-900/40 text-red-400 rounded-xl text-xs flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {result && (
              <div className="flex-1 overflow-y-auto max-h-[450px] pr-2 text-xs leading-relaxed text-cream/90 flex flex-col gap-4 whitespace-pre-line font-tiro text-sm">
                {result}
              </div>
            )}
          </div>

        </div>

      </div>
      <Footer />
    </main>
  );
}
