import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Spiritual Blog — Mantra, Pooja Vidhi, Kundli Guide | PoojaPath AI",
  description: "Read expert articles on Hindu rituals, mantra jaap, free kundli guide, pooja vidhi in Hindi, Navratri tips, Vastu shastra, and more. India's #1 spiritual knowledge hub.",
  keywords: [
    "pooja vidhi in hindi", "mantra jaap benefits", "kundli online free kaise banaye",
    "navratri pooja vidhi 2026", "hanuman chalisa benefits", "gayatri mantra meaning",
    "vastu shastra tips", "om namah shivaya meaning", "diwali puja samagri list",
    "how to do rudra abhishek", "mahamrityunjaya mantra benefits", "online pandit booking guide"
  ],
};

const POSTS = [
  {
    slug: "hanuman-chalisa-benefits-hindi",
    title: "Hanuman Chalisa ke 40 Fayde — Complete Guide 2026",
    desc: "Hanuman Chalisa padhne ke scientific aur spiritual fayde, sahi ucharan vidhi, aur paath ka sahi samay janein.",
    emoji: "🙏", tag: "Mantra", readTime: "5 min", date: "Aug 10, 2026",
  },
  {
    slug: "kundli-online-free-kaise-banaye",
    title: "Free Janam Kundli Online Kaise Banayein — Step by Step",
    desc: "Ghar baithe apni Janam Kundli banayein bilkul free. Lagna, Rashi, Nakshatra sab kuch ek jagah.",
    emoji: "📜", tag: "Kundli", readTime: "4 min", date: "Aug 8, 2026",
  },
  {
    slug: "om-namah-shivaya-meaning-hindi",
    title: "Om Namah Shivaya ka Arth aur Shakti — Hindi mein",
    desc: "Panchakshari mantra ka gehara arth, iske paanch akshar kis tatva ko darshate hain, aur daily jaap ke fayde.",
    emoji: "🔱", tag: "Mantra", readTime: "6 min", date: "Aug 6, 2026",
  },
  {
    slug: "navratri-pooja-vidhi-2026",
    title: "Navratri Pooja Vidhi 2026 — 9 Din ki Complete Puja Guide",
    desc: "Navratri mein har din kaun si Devi ki pooja karein, kya bhog lagayein, aur ghar par Kalash Sthapna kaise karein.",
    emoji: "🪔", tag: "Pooja Vidhi", readTime: "8 min", date: "Aug 4, 2026",
  },
  {
    slug: "gayatri-mantra-power-benefits",
    title: "Gayatri Mantra — 108 Baar Jaap ke Fayde aur Niyam",
    desc: "Gayatri Mantra ka sahi ucharan, jaap ka sahi samay (Brahma Muhurta), aur 108 baar paath se kya milta hai.",
    emoji: "☀️", tag: "Mantra", readTime: "5 min", date: "Aug 2, 2026",
  },
  {
    slug: "vastu-shastra-tips-for-home",
    title: "Ghar ke liye 21 Vastu Shastra Tips — Sukh aur Samriddhi ke liye",
    desc: "Ghar ki disha, pooja ghar ki sahi jagah, kitchen vastu, bedroom vastu — sab kuch simple Hindi mein.",
    emoji: "🧭", tag: "Vastu", readTime: "7 min", date: "Jul 30, 2026",
  },
  {
    slug: "pooja-vidhi-in-hindi-complete-guide",
    title: "Ghar Par Pooja Kaise Karein — Complete Vidhi Hindi Mein",
    desc: "Subah ki pooja, Sandhya aarti, aur special puja ki step-by-step vidhi. Naye logon ke liye beginners guide.",
    emoji: "🕯️", tag: "Pooja Vidhi", readTime: "6 min", date: "Jul 28, 2026",
  },
  {
    slug: "how-to-do-rudra-abhishek",
    title: "Rudrabhishek Kaise Karein — Ghar Par Poori Vidhi",
    desc: "Shiv Ji ko prasann karne ke liye Rudrabhishek ki sampurna vidhi, samagri list, aur mantra — sab ek jagah.",
    emoji: "🌊", tag: "Pooja Vidhi", readTime: "7 min", date: "Jul 25, 2026",
  },
  {
    slug: "mahamrityunjaya-mantra-108-times-benefits",
    title: "Mahamrityunjaya Mantra 108 Baar — Fayde aur Niyam",
    desc: "Swasth rehne, bimari door karne aur Shiv kripa paane ke liye Mahamrityunjaya Mantra ka sahi paath kaise karein.",
    emoji: "🕉️", tag: "Mantra", readTime: "5 min", date: "Jul 22, 2026",
  },
  {
    slug: "monday-shiv-puja-vidhi",
    title: "Somvar Shiv Puja Vidhi — Somvar ke Upay aur Fayde",
    desc: "Har Somvar Shiv Ji ki pooja kaise karein, kya chadhayein, Shiv Chalisa padhne ka sahi tarika.",
    emoji: "🔱", tag: "Pooja Vidhi", readTime: "4 min", date: "Jul 19, 2026",
  },
  {
    slug: "saturday-hanuman-puja-vidhi",
    title: "Shanivar ko Hanuman Ji ki Puja — Vidhi aur Upay",
    desc: "Shani dosh door karne aur Hanuman Ji ki kripa paane ke liye Shanivar ki pooja vidhi aur special upay.",
    emoji: "🙏", tag: "Pooja Vidhi", readTime: "4 min", date: "Jul 16, 2026",
  },
  {
    slug: "krishna-aarti-lyrics-meaning",
    title: "Shri Krishna Aarti — Lyrics, Arth aur Paath Vidhi",
    desc: "Aarti Kunj Bihari Ki — complete lyrics Hindi mein, har line ka arth, aur aarti gane ka sahi tarika.",
    emoji: "🪷", tag: "Aarti", readTime: "3 min", date: "Jul 13, 2026",
  },
  {
    slug: "mangal-dosh-remedies-astrology",
    title: "Mangal Dosh — Kya Hai, Kaise Pehchanen, aur Upay",
    desc: "Kundli mein Mangal Dosh ka pata kaise lagayein, shaadi par kya asar hota hai, aur ghar par karne wale simple upay.",
    emoji: "⚔️", tag: "Jyotish", readTime: "6 min", date: "Jul 10, 2026",
  },
  {
    slug: "best-time-for-morning-pooja",
    title: "Subah Pooja ka Sahi Samay — Brahma Muhurta Guide",
    desc: "Brahma Muhurta kya hota hai, subah 4–6 baje pooja karne ke fayde, aur apni routine kaise set karein.",
    emoji: "🌅", tag: "Spiritual", readTime: "4 min", date: "Jul 7, 2026",
  },
  {
    slug: "diwali-puja-samagri-list",
    title: "Diwali Lakshmi Puja Samagri List 2026 — Complete List Hindi Mein",
    desc: "Diwali par Lakshmi Puja ke liye kya kya chahiye, Puja Vidhi kaise karein, aur Diwali ki shubh muhurat kab hai.",
    emoji: "🪔", tag: "Festival", readTime: "5 min", date: "Jul 4, 2026",
  },
];

const TAG_COLORS: Record<string, string> = {
  "Mantra":     "rgba(232,96,10,.15)",
  "Kundli":     "rgba(92,107,192,.15)",
  "Pooja Vidhi":"rgba(22,163,74,.12)",
  "Vastu":      "rgba(201,146,43,.15)",
  "Aarti":      "rgba(173,20,87,.15)",
  "Jyotish":    "rgba(232,96,10,.12)",
  "Festival":   "rgba(218,165,32,.15)",
  "Spiritual":  "rgba(201,146,43,.12)",
};
const TAG_TEXT: Record<string, string> = {
  "Mantra":"#F5841F","Kundli":"#90caf9","Pooja Vidhi":"#4ade80",
  "Vastu":"#F2C96E","Aarti":"#f48fb1","Jyotish":"#F5841F",
  "Festival":"#DAA520","Spiritual":"#C9922B",
};

export default function BlogPage() {
  return (
    <>
      {/* ── JSON-LD for Blog ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "PoojaPath AI Spiritual Blog",
          url: "https://poojapath.ai/blog",
          description: "Expert articles on Hindu rituals, mantra jaap, kundli, pooja vidhi, and Vedic astrology in Hindi and English.",
          publisher: { "@type": "Organization", name: "PoojaPath AI", url: "https://poojapath.ai" },
          blogPost: POSTS.map(p => ({
            "@type": "BlogPosting",
            headline: p.title,
            description: p.desc,
            url: `https://poojapath.ai/blog/${p.slug}`,
            datePublished: p.date,
            author: { "@type": "Organization", name: "PoojaPath AI" },
          })),
        }) }}
      />

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0502 0%, #0d0602 100%)",
        color: "#FDF0DC",
        fontFamily: "var(--font-sans, sans-serif)",
      }}>
        {/* Header */}
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "clamp(40px,8vw,80px) clamp(16px,4vw,24px) 0",
          textAlign: "center",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(232,96,10,.1)", border: "1px solid rgba(232,96,10,.2)",
            borderRadius: 100, padding: "6px 18px", fontSize: 11,
            color: "#F5841F", fontWeight: 600, letterSpacing: ".08em",
            textTransform: "uppercase", marginBottom: 20,
          }}>
            📖 Spiritual Knowledge Hub
          </div>
          <h1 style={{
            fontFamily: "var(--font-cormorant, serif)",
            fontSize: "clamp(32px,5vw,52px)", fontWeight: 400,
            lineHeight: 1.1, marginBottom: 16,
            color: "rgba(253,240,220,.95)",
          }}>
            Pooja, Mantra & <em style={{ color: "#F5841F", fontStyle: "italic" }}>Jyotish</em> Blog
          </h1>
          <p style={{
            fontSize: "clamp(13px,1.8vw,16px)", color: "rgba(200,175,140,.6)",
            lineHeight: 1.75, maxWidth: 560, margin: "0 auto 48px",
          }}>
            Expert guides on Hindu rituals, Vedic astrology, mantra jaap, and sacred traditions — in Hindi & English.
          </p>
        </div>

        {/* Blog Grid */}
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "0 clamp(16px,4vw,24px) clamp(60px,8vw,100px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(320px,100%), 1fr))",
          gap: "clamp(14px,2vw,20px)",
        }}>
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ textDecoration: "none", display: "block" }}
            >
              <article style={{
                background: "rgba(255,248,235,.025)",
                border: "1px solid rgba(200,145,60,.08)",
                borderRadius: 20,
                padding: "clamp(18px,3vw,26px)",
                cursor: "pointer",
                transition: "all .35s cubic-bezier(.16,1,.3,1)",
                height: "100%",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,145,60,.28)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-5px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 18px 50px rgba(0,0,0,.4)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,248,235,.04)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,145,60,.08)";
                (e.currentTarget as HTMLElement).style.transform = "none";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,248,235,.025)";
              }}
              >
                <div style={{ fontSize: "clamp(28px,5vw,36px)", marginBottom: 12 }}>{post.emoji}</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "3px 10px",
                    borderRadius: 100,
                    background: TAG_COLORS[post.tag] || "rgba(232,96,10,.12)",
                    color: TAG_TEXT[post.tag] || "#F5841F",
                  }}>{post.tag}</span>
                  <span style={{ fontSize: 10, color: "rgba(200,175,140,.4)" }}>⏱ {post.readTime}</span>
                  <span style={{ fontSize: 10, color: "rgba(200,175,140,.35)" }}>{post.date}</span>
                </div>
                <h2 style={{
                  fontFamily: "var(--font-cormorant, serif)",
                  fontSize: "clamp(16px,2.5vw,19px)", fontWeight: 600,
                  color: "rgba(253,240,220,.9)", lineHeight: 1.3,
                  marginBottom: 10,
                }}>
                  {post.title}
                </h2>
                <p style={{
                  fontSize: "clamp(12px,1.5vw,13px)",
                  color: "rgba(200,175,140,.55)",
                  lineHeight: 1.65,
                }}>
                  {post.desc}
                </p>
                <div style={{
                  marginTop: 16, fontSize: 12, fontWeight: 600,
                  color: "#F5841F", display: "flex", alignItems: "center", gap: 4,
                }}>
                  Poora Padhein →
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          textAlign: "center",
          padding: "clamp(40px,6vw,60px) 16px clamp(60px,8vw,80px)",
          borderTop: "1px solid rgba(200,145,60,.08)",
        }}>
          <p style={{ color: "rgba(200,175,140,.5)", fontSize: 14, marginBottom: 20 }}>
            🕉️ Aaj hi apni pooja shuru karein
          </p>
          <Link href="/" style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #E8600A, #B84A08)",
            color: "#fff", textDecoration: "none",
            padding: "14px 36px", borderRadius: 14,
            fontSize: 14, fontWeight: 700,
            boxShadow: "0 8px 32px rgba(232,96,10,.4)",
          }}>
            🪔 PoojaPath AI Par Jaayein
          </Link>
        </div>
      </div>
    </>
  );
}
