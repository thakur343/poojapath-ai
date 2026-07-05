"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PanchangWidget from "@/components/PanchangWidget";
import HeroSection from "@/components/HeroSection";
import MantraForm from "@/components/MantraForm";
import Darshan from "@/components/Darshan";
import Pricing from "@/components/Pricing";
import Tools from "@/components/Tools";
import Community from "@/components/Community";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import GuruDrawer from "@/components/GuruDrawer";
import PanditFloatChat from "@/components/PanditFloatChat";
import { FAQSection, homepageFAQs } from "@/components/FAQSection";
import SacredVoices from "@/components/SacredVoices";
import { useAuth } from "@/lib/firebase/AuthProvider";
import JaapWidget from "@/components/JaapWidget";

// ── Time-Based Greeting ─────────────────────────────────────────────────────────────────
function getTimeGreeting(): { text: string; emoji: string; color: string } {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 6)   return { text: "Brahma Muhurta — Sabse Pavitra Samay", emoji: "🌅", color: "#F2C96E" };
  if (hour >= 6 && hour < 12)  return { text: "Suprabhat! Aaj ki Pooja Shuru Karo", emoji: "☀️", color: "#E8600A" };
  if (hour >= 12 && hour < 14) return { text: "Madhyanha Puja — Abhijit Muhurta", emoji: "☀️", color: "#C9922B" };
  if (hour >= 14 && hour < 17) return { text: "Shubh Dopahar! Mantra Jaap Karo", emoji: "🕉️", color: "#E8600A" };
  if (hour >= 17 && hour < 20) return { text: "Sandhya Aarti ka Samay — Diya Jalao", emoji: "🌇", color: "#C9922B" };
  if (hour >= 20 && hour < 22) return { text: "Shayan Puja — Din ka Samapan Karo", emoji: "🌙", color: "#8B5CF6" };
  return { text: "Ishwar ki Kripa Aap Par Bani Rahe", emoji: "🕉️", color: "#C9922B" };
}

// ── Track session to backend for ML ────────────────────────────────────────────────────
async function trackSession(email: string, activity: string) {
  try {
    await fetch("http://localhost:8000/api/user/track-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, activity_type: activity }),
    });
  } catch { /* silent fail */ }
}

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [greeting, setGreeting] = useState({ text: "", emoji: "🕉️", color: "#C9922B" });
  const [showGreeting, setShowGreeting] = useState(false);
  const [userScore, setUserScore] = useState<{ tier: string; cta: string } | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  // Set time-based greeting
  useEffect(() => {
    setGreeting(getTimeGreeting());
    // Show greeting banner for 6 seconds
    const timer = setTimeout(() => setShowGreeting(true), 500);
    const hideTimer = setTimeout(() => setShowGreeting(false), 7000);
    return () => { clearTimeout(timer); clearTimeout(hideTimer); };
  }, []);

  // First-visit redirect
  useEffect(() => {
    if (loading) return;
    if (!user) {
      const visited = localStorage.getItem("poojapath_visited");
      if (!visited) {
        localStorage.setItem("poojapath_visited", "1");
        router.replace("/login");
      }
    }
  }, [user, loading, router]);

  // Track homepage session + fetch user score
  useEffect(() => {
    if (user?.email) {
      trackSession(user.email, "homepage");
      // Fetch ML score for personalized CTA
      fetch(`http://localhost:8000/api/user/score/${encodeURIComponent(user.email)}`)
        .then(r => r.json())
        .then(data => setUserScore({ tier: data.tier, cta: data.cta }))
        .catch(() => {});
    }
  }, [user]);

  // Dynamic client-side sparks for spiritual atmosphere
  const [sparks, setSparks] = useState<{ id: number; left: string; top: string; size: string; delay: string; duration: string }[]>([]);

  useEffect(() => {
    // Generate 25 random golden sparkles
    const generated = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 5 + 2}px`,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 6 + 6}s`
    }));
    setSparks(generated);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".rv, .rv-l, .rv-r");
    const reveal = (el: HTMLElement) => el.classList.add("vis");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => { if (entry.isIntersecting) { reveal(entry.target as HTMLElement); observer.unobserve(entry.target); } }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) reveal(el);
      else observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Dynamic Golden Spiritual Sparks Layer */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
        {sparks.map((spark) => (
          <div
            key={spark.id}
            className="spiritual-sparkle-dot"
            style={{
              left: spark.left,
              top: spark.top,
              width: spark.size,
              height: spark.size,
              animationDelay: spark.delay,
              animationDuration: spark.duration,
            }}
          />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 10 }}>
        <Navbar />

        {/* Time-Based Greeting Banner */}
        {showGreeting && greeting.text && (
          <div style={{
            position: 'fixed', top: '70px', left: '50%', transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #1a0800ee, #0f0400ee)',
            border: `1px solid ${greeting.color}66`, borderRadius: '50px',
            padding: '10px 24px', zIndex: 1000, display: 'flex', alignItems: 'center',
            gap: '10px', backdropFilter: 'blur(12px)',
            animation: 'fadeInDown 0.5s ease', boxShadow: `0 4px 24px ${greeting.color}33`,
            whiteSpace: 'nowrap'
          }}>
            <span style={{ fontSize: '18px' }}>{greeting.emoji}</span>
            <span style={{ color: greeting.color, fontWeight: 700, fontSize: '13px' }}>{greeting.text}</span>
          </div>
        )}

        {/* Personalized CTA for returning users */}
        {userScore && (userScore.tier === "VIP Devotee" || userScore.tier === "Active Seeker") && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(232,96,10,0.15), rgba(201,146,43,0.1))',
            borderBottom: '1px solid rgba(201,146,43,0.3)', margin: '0', padding: '12px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            flexWrap: 'wrap', zIndex: 9, position: 'relative'
          }}>
            <span style={{ color: '#F2C96E', fontSize: '13px', fontWeight: 700 }}>🕉️ {userScore.tier}</span>
            <span style={{ color: 'rgba(253,240,220,0.85)', fontSize: '12px' }}>{userScore.cta}</span>
            <a href={userScore.tier === "VIP Devotee" ? "/kundli" : "/wallpapers"} style={{ background: 'linear-gradient(135deg, #E8600A, #C9922B)', color: '#fff', textDecoration: 'none', padding: '6px 18px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>Unlock Now</a>
          </div>
        )}

        <PanchangWidget />
        <main>
          <HeroSection />
          <div className="rv"><JaapWidget /></div>
          <div className="rv"><MantraForm /></div>
          <div className="rv-l"><Darshan /></div>
          <div className="rv-r">
            <Pricing onBookPandit={() => setDrawerOpen(true)} />
          </div>
          <div className="rv"><Tools /></div>
          <div className="rv-l"><Community /></div>
          <div className="rv"><Testimonials /></div>
          <div className="rv"><SacredVoices /></div>
          <div className="rv"><FAQSection faqs={homepageFAQs} /></div>
        </main>
        <Footer />
      </div>
      <GuruDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <PanditFloatChat />
    </>
  );
}