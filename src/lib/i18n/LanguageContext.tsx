"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "en" | "hi" | "sa";

// ══════════════════════════════════════════════════════════
//  ALL TRANSLATIONS
// ══════════════════════════════════════════════════════════
export const T = {
  en: {
    // Navbar
    nav_home:    "🕉️ Home",
    nav_pandit:  "🧘 Pandit Ji",
    nav_jaap:    "📿 Nama Jaap",
    nav_kundli:  "📊 Kundli",
    nav_darshan: "🙏 Live Darshan",
    nav_pricing: "💎 Pricing",
    nav_login:   "👤 Login",
    nav_signout: "Sign Out",
    nav_btn1:    "Get Mantra — ₹51",
    nav_btn2:    "🕉️ Live Darshan",

    // Hero
    hero_badge:    "The Most Advanced Spiritual AI",
    hero_h1_a:     "Your",
    hero_h1_b:     "Divine",
    hero_h1_c:     "Pandit Ji",
    hero_sub:      "Personalized Sanskrit mantras, Live Darshan, Kundli insights, and Shubh Muhurat — powered by 5000 years of Vedic wisdom.",
    hero_btn1:     "Get Your Mantra",
    hero_btn2:     "🙏 Watch Live Darshan",
    hero_stat1:    "0.2s Inference",
    hero_stat2:    "100% Private",
    hero_stat3:    "100k+ Shlokas",
    hero_stat4:    "Kashi Scholars Verified",

    // Sacred Voices CTA
    sv_cta:        "Talk with Pandit Ji",
    sv_sub:        "10,000+ devotees seeking divine guidance daily",
    sv_note:       "Powered by ancient wisdom · Guided by AI · Free to start",

    // Pricing
    price_title:   "Spiritual Investment",
    price_sub:     "Affordable access to authentic Vedic wisdom, powered by technology.",
    price1_name:   "Personalized Mantra",
    price1_desc:   "One-time generation based on your current astrological transit.",
    price1_freq:   "One-time Dakshina",
    price1_btn:    "Get Your Mantra",
    price2_name:   "AI Pandit Live Pooja",
    price2_desc:   "Interactive, real-time spiritual guidance and custom pooja rituals.",
    price2_freq:   "Per Session (30 mins)",
    price2_btn:    "Book Pandit Ji",
    price3_name:   "Lifetime Access",
    price3_desc:   "Unlimited mantras, daily muhurat alerts, and ad-free darshan.",
    price3_freq:   "Billed Once, Forever Yours",
    price3_btn:    "Join Premium Waitlist",

    // Chat
    chat_placeholder: "Ask your question... 🙏",
    chat_send:        "Send",
  },

  hi: {
    // Navbar
    nav_home:    "🕉️ होम",
    nav_pandit:  "🧘 पंडित जी",
    nav_jaap:    "📿 नाम जाप",
    nav_kundli:  "📊 जन्म कुंडली",
    nav_darshan: "🙏 लाइव दर्शन",
    nav_pricing: "💎 मूल्य सूची",
    nav_login:   "👤 लॉगिन",
    nav_signout: "साइन आउट",
    nav_btn1:    "मंत्र पाएं — ₹51",
    nav_btn2:    "🕉️ लाइव दर्शन",

    // Hero
    hero_badge:    "सबसे उन्नत आध्यात्मिक AI",
    hero_h1_a:     "आपके",
    hero_h1_b:     "दिव्य",
    hero_h1_c:     "पंडित जी",
    hero_sub:      "व्यक्तिगत संस्कृत मंत्र, लाइव दर्शन, कुंडली विश्लेषण और शुभ मुहूर्त — 5000 वर्षों की वैदिक परंपरा से संचालित।",
    hero_btn1:     "मंत्र प्राप्त करें",
    hero_btn2:     "🙏 लाइव दर्शन देखें",
    hero_stat1:    "0.2 सेकंड में उत्तर",
    hero_stat2:    "100% गोपनीय",
    hero_stat3:    "1 लाख+ श्लोक",
    hero_stat4:    "काशी विद्वानों द्वारा सत्यापित",

    // Sacred Voices CTA
    sv_cta:        "पंडित जी से बात करें",
    sv_sub:        "10,000+ भक्त प्रतिदिन दिव्य मार्गदर्शन ले रहे हैं",
    sv_note:       "प्राचीन ज्ञान से संचालित · AI द्वारा निर्देशित · निःशुल्क शुरुआत",

    // Pricing
    price_title:   "आध्यात्मिक निवेश",
    price_sub:     "प्रामाणिक वैदिक ज्ञान तक सस्ती पहुँच, प्रौद्योगिकी द्वारा संचालित।",
    price1_name:   "व्यक्तिगत मंत्र",
    price1_desc:   "आपकी वर्तमान ग्रह दशा के आधार पर एक बार का मंत्र।",
    price1_freq:   "एकमुश्त दक्षिणा",
    price1_btn:    "मंत्र पाएं",
    price2_name:   "AI पंडित लाइव पूजा",
    price2_desc:   "इंटरैक्टिव, रियल-टाइम आध्यात्मिक मार्गदर्शन और कस्टम पूजा।",
    price2_freq:   "प्रति सत्र (30 मिनट)",
    price2_btn:    "पंडित जी बुक करें",
    price3_name:   "आजीवन एक्सेस",
    price3_desc:   "असीमित मंत्र, दैनिक मुहूर्त अलर्ट और विज्ञापन-मुक्त दर्शन।",
    price3_freq:   "एक बार भुगतान, सदा के लिए",
    price3_btn:    "प्रीमियम वेटलिस्ट में जुड़ें",

    // Chat
    chat_placeholder: "अपना प्रश्न पूछें... 🙏",
    chat_send:        "भेजें",
  },

  sa: {
    // Navbar
    nav_home:    "🕉️ गृहम्",
    nav_pandit:  "🧘 पण्डितः",
    nav_jaap:    "📿 नामजपः",
    nav_kundli:  "📊 जन्मकुण्डली",
    nav_darshan: "🙏 सजीवदर्शनम्",
    nav_pricing: "💎 मूल्यसूची",
    nav_login:   "👤 प्रवेशः",
    nav_signout: "निर्गमः",
    nav_btn1:    "मन्त्रं प्राप्नुत — ₹51",
    nav_btn2:    "🕉️ सजीवदर्शनम्",

    // Hero
    hero_badge:    "सर्वोत्तमः आध्यात्मिकः AI",
    hero_h1_a:     "भवतः",
    hero_h1_b:     "दिव्यः",
    hero_h1_c:     "पण्डितजी",
    hero_sub:      "व्यक्तिगतं संस्कृतमन्त्रम्, सजीवदर्शनम्, कुण्डलीज्ञानम्, शुभमुहूर्तश्च — पञ्चसहस्रवर्षीयवैदिकज्ञानेन संचालितम्।",
    hero_btn1:     "मन्त्रं प्राप्नुत",
    hero_btn2:     "🙏 दर्शनं पश्यत",
    hero_stat1:    "०.२ सेकण्डे उत्तरम्",
    hero_stat2:    "१००% गोपनीयम्",
    hero_stat3:    "१ लक्ष+ श्लोकाः",
    hero_stat4:    "काशीपण्डितैः प्रमाणितम्",

    // Sacred Voices CTA
    sv_cta:        "पण्डितजीना सह वदत",
    sv_sub:        "दशसहस्रभक्ताः प्रतिदिनं दिव्यमार्गदर्शनं प्राप्नुवन्ति",
    sv_note:       "प्राचीनज्ञानेन संचालितम् · AI द्वारा निर्देशितम् · निःशुल्कम्",

    // Pricing
    price_title:   "आध्यात्मिकं निवेशनम्",
    price_sub:     "प्रामाणिकवैदिकज्ञानस्य सुलभः प्रवेशः, प्रौद्योगिक्या संचालितः।",
    price1_name:   "व्यक्तिगतं मन्त्रम्",
    price1_desc:   "भवतः वर्तमानग्रहदशाया आधारेण एकवारिकं मन्त्रम्।",
    price1_freq:   "एकवारिका दक्षिणा",
    price1_btn:    "मन्त्रं प्राप्नुत",
    price2_name:   "AI पण्डित सजीवपूजा",
    price2_desc:   "इन्टरैक्टिवं, वास्तविककालिकं आध्यात्मिकमार्गदर्शनम्।",
    price2_freq:   "प्रतिसत्रम् (३० मिनिटानि)",
    price2_btn:    "पण्डितजीं निर्दिशत",
    price3_name:   "आजीवनप्रवेशः",
    price3_desc:   "असीमितानि मन्त्राणि, दैनिकमुहूर्तसूचना, विज्ञापनरहितदर्शनम्।",
    price3_freq:   "एकवारं प्रदत्तं, सर्वदा भवतः",
    price3_btn:    "प्रीमियमसूचीम् योजयत",

    // Chat
    chat_placeholder: "स्वप्रश्नं पृच्छत... 🙏",
    chat_send:        "प्रेषयत",
  },
} as const;

export type TKey = keyof typeof T["en"];

// ── Context ──────────────────────────────────────────────
interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
}

const LangContext = createContext<LangCtx>({
  lang: "en",
  setLang: () => {},
  t: (k) => T.en[k],
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("poojapath_lang") as Lang | null;
    if (saved && ["en", "hi", "sa"].includes(saved)) setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("poojapath_lang", l);
  };

  const t = (key: TKey): string => T[lang][key] as string;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
