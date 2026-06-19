"use client";
import { useEffect, useState } from "react";
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

export default function Home() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>(".rv, .rv-l, .rv-r");

    const reveal = (el: HTMLElement) => {
      el.classList.add("vis");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target as HTMLElement);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        reveal(el);
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div style={{ position: "relative", zIndex: 10 }}>
        <Navbar />
        <PanchangWidget />
        <main>
          <HeroSection />
          <div className="rv"><MantraForm /></div>
          <div className="rv-l"><Darshan /></div>
          <div className="rv-r">
            <Pricing onBookPandit={() => setDrawerOpen(true)} />
          </div>
          <div className="rv"><Tools /></div>
          <div className="rv-l"><Community /></div>
          <div className="rv"><Testimonials /></div>
          <div className="rv"><FAQSection faqs={homepageFAQs} /></div>
        </main>
        <Footer />
      </div>
      <GuruDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <PanditFloatChat />
    </>
  );
}