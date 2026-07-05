"use client";

import React from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useLang } from "@/lib/i18n/LanguageContext";
const DivineHeroCanvas = dynamic(() => import("./DivineHeroCanvas"), { ssr: false });

export default function HeroSection() {
  const { t } = useLang();
  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 overflow-hidden">
        <DivineHeroCanvas />
        
        {/* Foreground Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 bg-[#E8600A]/10 border border-[#E8600A]/20 backdrop-blur-md rounded-full px-5 py-2 text-[11px] text-[#F5841F] font-medium mb-8 tracking-widest uppercase shadow-[0_0_20px_rgba(232,96,10,0.15)]"
          >
            <span className="text-[14px]">👁️</span> {t("hero_badge")}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-cormorant text-[clamp(44px,7.5vw,82px)] font-light leading-[1.06] text-[#FDF0DC]/95 mb-4"
          >
            {t("hero_h1_a")} <em className="text-[#F5841F] italic">{t("hero_h1_b")}</em><br/>
            <strong className="font-bold bg-gradient-to-br from-[#F2C96E] via-[#E8600A] to-[#F2C96E] text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(232,96,10,0.3)]">{t("hero_h1_c")}</strong>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(14px,1.8vw,17px)] text-[#C8AF8C]/70 font-light leading-[1.75] max-w-[560px] mx-auto mb-10 drop-shadow-md"
          >
            {t("hero_sub")}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.8 }}
            className="font-tiro text-[clamp(26px,4vw,36px)] text-[#C9922B] mb-12 tracking-[4px] drop-shadow-[0_0_20px_rgba(201,146,43,0.5)]"
          >
            ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <button 
              className="relative group border-none rounded-2xl px-9 py-4 text-[15px] font-semibold cursor-pointer font-sans transition-all duration-300 tracking-wide bg-gradient-to-br from-[#E8600A] to-[#B84A08] text-white shadow-[0_8px_32px_rgba(232,96,10,0.4)] hover:-translate-y-1 hover:shadow-[0_14px_48px_rgba(232,96,10,0.6)] overflow-hidden" 
              onClick={() => scrollToSection('#form-sec')}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-2">
                {t("hero_btn1")}
                <span className="text-[9px] bg-gradient-to-br from-[#FFD700] to-[#DAA520] text-[#1C0A00] px-2 py-[2px] rounded font-extrabold tracking-wider">₹51</span>
              </span>
            </button>
            <button
              className="border-[1.5px] border-[#DAA520]/40 rounded-2xl px-9 py-4 text-[15px] font-semibold cursor-pointer font-sans transition-all duration-300 tracking-wide bg-[#140A00]/60 backdrop-blur-md text-[#F2C96E] hover:border-[#DAA520] hover:shadow-[0_0_40px_rgba(218,165,32,0.2)] hover:-translate-y-1"
              onClick={() => scrollToSection('#darshan-sec')}
            >
              {t("hero_btn2")}
            </button>
          </motion.div>
        </div>
      </section>

      <div className="flex items-center justify-center gap-8 flex-wrap px-9 py-5 border-y border-[#C8913C]/10 bg-[#080402]/60 backdrop-blur-xl relative z-20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2 text-[12px] text-[#C8AF8C]/60 transition-all duration-300 hover:text-[#F2C96E]/90 hover:-translate-y-0.5 cursor-default group">
          <span className="text-[16px] group-hover:drop-shadow-[0_0_8px_rgba(242,201,110,0.8)] transition-all">⚡</span> {t("hero_stat1")}
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[#C8AF8C]/60 transition-all duration-300 hover:text-[#F2C96E]/90 hover:-translate-y-0.5 cursor-default group">
          <span className="text-[16px] group-hover:drop-shadow-[0_0_8px_rgba(242,201,110,0.8)] transition-all">🔒</span> {t("hero_stat2")}
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[#C8AF8C]/60 transition-all duration-300 hover:text-[#F2C96E]/90 hover:-translate-y-0.5 cursor-default group">
          <span className="text-[16px] group-hover:drop-shadow-[0_0_8px_rgba(242,201,110,0.8)] transition-all">📜</span> {t("hero_stat3")}
        </div>
        <div className="flex items-center gap-2 text-[12px] text-[#C8AF8C]/60 transition-all duration-300 hover:text-[#F2C96E]/90 hover:-translate-y-0.5 cursor-default group">
          <span className="text-[16px] group-hover:drop-shadow-[0_0_8px_rgba(242,201,110,0.8)] transition-all">🕉️</span> {t("hero_stat4")}
        </div>
      </div>
    </>
  );
}
