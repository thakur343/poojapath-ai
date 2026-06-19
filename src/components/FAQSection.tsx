"use client";
// /src/components/seo/FAQSection.tsx
// Accordion FAQ with JSON-LD injection — appears in Google's "People Also Ask"
// This is one of the highest-ROI SEO features for PoojaPath

import { useState } from "react";
import { getFAQSchema } from "@/lib/seo";

interface FAQ {
  q: string;
  a: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  title?: string;
}

export function FAQSection({
  faqs,
  title = "Frequently Asked Questions",
}: FAQSectionProps) {
  const [open, setOpen] = useState<number | null>(null);
  const schema = getFAQSchema(faqs.map(faq => ({ question: faq.q, answer: faq.a })));

  return (
    <>
      {/* JSON-LD for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <section className="py-16 px-4 max-w-3xl mx-auto">
        <h2 className="text-3xl font-cormorant font-semibold text-center text-white mb-2">
          {title}
        </h2>
        <p className="text-center text-orange-300/60 text-sm tracking-widest mb-10 uppercase">
          Aapke Sawaal, Hamare Jawab
        </p>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-orange-500/20 rounded-2xl overflow-hidden bg-orange-950/20 backdrop-blur-sm"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left text-white hover:bg-orange-500/5 transition-colors"
                aria-expanded={open === i}
              >
                <span className="font-medium text-base pr-4">{faq.q}</span>
                <span
                  className={`text-orange-400 text-xl transition-transform duration-300 flex-shrink-0 ${
                    open === i ? "rotate-45" : ""
                  }`}
                >
                  +
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open === i ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="px-5 pb-5 text-white/70 text-sm leading-relaxed border-t border-orange-500/10 pt-4">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// ── PRESET FAQs FOR HOMEPAGE ──────────────────────────────────────────────────
export const homepageFAQs: FAQ[] = [
  {
    q: "PoojaPath AI kya hai?",
    a: "PoojaPath AI ek AI-powered Hindu pooja booking platform hai jahan aap certified pandits book kar sakte hain, Panditji AI se spiritual guidance le sakte hain, aur samagri checklist automatically generate kar sakte hain. Yeh India ka pehla ऐसा platform hai jo AI aur traditional rituals ko combine karta hai.",
  },
  {
    q: "Pandit booking kaise karte hain?",
    a: "Bahut simple hai! Apna pooja type select karein (Satyanarayan, Griha Pravesh, etc.), date aur city choose karein, aur ek verified pandit choose karein. Payment ₹51 se shuru hoti hai. Booking confirmation aur pandit details WhatsApp par aate hain.",
  },
  {
    q: "Kya AI Panditji real spiritual guidance deta hai?",
    a: "Haan! Panditji AI Vedic scriptures, Puranas, aur classical texts se trained hai. Yeh aapko mantra, vidhi steps, aur pooja muhurat ke baare mein guidance deta hai. Complex questions ke liye real pandits se connect karne ka option bhi milta hai.",
  },
  {
    q: "Kya PoojaPath India ke saare cities mein available hai?",
    a: "Abhi hum Delhi NCR, Mumbai, Bangalore, Hyderabad, Pune, Jaipur, aur Bhopal mein available hain. Har mahine nayi cities add ho rahi hain. Aap apna city suggest bhi kar sakte hain booking form mein.",
  },
  {
    q: "Payment kitni safe hai?",
    a: "100% safe. Hum Razorpay use karte hain jo RBI-registered payment gateway hai. UPI, net banking, aur cards sab accept hote hain. Pooja complete nahi hone par full refund milta hai.",
  },
  {
    q: "Kya main pooja virtually attend kar sakta hoon?",
    a: "Haan! Virtual pooja option mein panditji video call par pooja karte hain. Aap apne ghar se pooja perform kar sakte hain, prasad delivery bhi available hai premium plan mein.",
  },
];

// ── PRESET FAQs FOR SATYANARAYAN PAGE ────────────────────────────────────────
export const satyanarayanFAQs: FAQ[] = [
  {
    q: "Satyanarayan Pooja ke liye kya samagri chahiye?",
    a: "PoojaPath AI automatically ek personalised samagri list generate karta hai. Basic items mein shamil hain: panchamrit, flowers, tulsi, chana dal, banana, coconut, incense sticks, ghee, camphor. Pooja date book karne par complete list WhatsApp par aati hai.",
  },
  {
    q: "Satyanarayan Katha mein kitna time lagta hai?",
    a: "Satyanarayan Katha typically 2-3 ghante ki hoti hai. Isme pooja, katha, aarti, aur prasad vitaran included hai. Pandit typically 30 minute pehle arrive karte hain setup ke liye.",
  },
  {
    q: "Satyanarayan Pooja ki fees kya hai PoojaPath par?",
    a: "PoojaPath par Satyanarayan Pooja ₹501 se shuru hoti hai. Premium package ₹1,100 mein samagri delivery bhi included hai. Sabse achha muhurat ke liye AI suggestion bhi free milta hai.",
  },
];