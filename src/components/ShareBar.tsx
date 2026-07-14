"use client";
// /src/components/seo/ShareBar.tsx
// Viral sharing component — boosts organic reach on WhatsApp + Instagram
// Place after booking confirmation, panditji AI response, or any "wow moment"

import { trackShare } from "@/components/Analytics";

interface ShareBarProps {
  title: string;
  text: string;
  url?: string;
  variant?: "booking" | "mantra" | "blog";
}

const WHATSAPP_BASE = "https://wa.me/?text=";
const INSTAGRAM_STORY_BASE = "https://www.instagram.com/";

export function ShareBar({
  title,
  text,
  url,
  variant = "booking",
}: ShareBarProps) {
  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "https://poojapath.ai");

  const whatsappMessage = encodeURIComponent(
    `${text}\n\nBook your pooja on PoojaPath AI 🕉️\n👉 ${shareUrl}`
  );

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    trackShare("copy");
    alert("Link copied! Share karo dosto ke saath 🙏");
  };

  const shareWhatsApp = () => {
    trackShare("whatsapp");
    window.open(`${WHATSAPP_BASE}${whatsappMessage}`, "_blank");
  };

  // Use Web Share API on mobile (best for Instagram Stories)
  const shareNative = async () => {
    if (navigator.share) {
      trackShare("instagram");
      await navigator.share({ title, text, url: shareUrl });
    } else {
      window.open(INSTAGRAM_STORY_BASE, "_blank");
    }
  };

  const bgColor =
    variant === "booking"
      ? "bg-gradient-to-r from-orange-900/40 to-orange-700/20"
      : variant === "mantra"
      ? "bg-gradient-to-r from-yellow-900/40 to-yellow-700/20"
      : "bg-gradient-to-r from-stone-800/60 to-stone-700/30";

  return (
    <div className={`rounded-2xl border border-orange-500/20 p-4 ${bgColor}`}>
      <p className="text-orange-300 text-xs tracking-widest mb-3 uppercase">
        🙏 Share the blessings
      </p>
      <p className="text-white/80 text-sm mb-4 leading-relaxed">{text}</p>
      <div className="flex gap-3 flex-wrap">
        {/* WhatsApp */}
        <button
          onClick={shareWhatsApp}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm px-4 py-2 rounded-xl transition-all duration-200 font-medium"
        >
          <WhatsAppIcon />
          WhatsApp
        </button>

        {/* Native Share (Instagram, etc.) */}
        <button
          onClick={shareNative}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90 text-white text-sm px-4 py-2 rounded-xl transition-all duration-200 font-medium"
        >
          <ShareIcon />
          Share
        </button>

        {/* Copy Link */}
        <button
          onClick={copyLink}
          className="flex items-center gap-2 border border-white/20 hover:bg-white/10 text-white/80 text-sm px-4 py-2 rounded-xl transition-all duration-200"
        >
          <CopyIcon />
          Copy Link
        </button>
      </div>
    </div>
  );
}

// ── MINI ICONS ───────────────────────────────────────────────────────────────
const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/>
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);
