import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Spiritual Blog — Mantras, Pooja Vidhi & Astrology | PoojaPath AI',
  description: 'Read AI-curated articles on Hindu mantras, pooja vidhi, Vedic astrology, Vastu Shastra and festival guides in Hindi & English.',
  keywords: ['hanuman chalisa hindi', 'om namah shivaya benefits', 'pooja vidhi hindi', 'kundli kaise banaye', 'vastu shastra tips', 'gayatri mantra meaning'],
};

const BLOGS = [
  { slug: 'hanuman-chalisa-benefits-hindi', title: 'हनुमान चालीसा के 40 चमत्कारी फायदे', desc: 'रोज़ हनुमान चालीसा पढ़ने से क्या होता है? वैज्ञानिक और आध्यात्मिक दोनों नज़रिए से जानें।', category: 'Mantras', readTime: '8 min', emoji: '🙏', lang: 'Hindi' },
  { slug: 'om-namah-shivaya-meaning-hindi', title: 'ॐ नमः शिवाय — अर्थ, महत्व और जाप विधि', desc: 'पंचाक्षर मंत्र का गहरा अर्थ और इसे सही तरीके से जपने की विधि।', category: 'Mantras', readTime: '6 min', emoji: '🕉️', lang: 'Hindi' },
  { slug: 'kundli-online-free-kaise-banaye', title: 'Free Kundli Kaise Banaye Online — Step by Step Guide', desc: 'Ghar baithe AI se apni janam kundli banao — koi pandit ki zaroorat nahi.', category: 'Astrology', readTime: '5 min', emoji: '⭐', lang: 'Hinglish' },
  { slug: 'krishna-aarti-lyrics-meaning', title: 'Krishna Aarti Lyrics with Hindi Meaning — Complete Guide', desc: 'Aarti Kunj Bihari Ki — full lyrics, meaning, and how to perform at home correctly.', category: 'Pooja Vidhi', readTime: '7 min', emoji: '🪔', lang: 'English' },
  { slug: 'pooja-vidhi-in-hindi-complete-guide', title: 'घर पर पूजा कैसे करें — संपूर्ण विधि हिंदी में', desc: 'सुबह की पूजा की सही विधि, सामग्री की सूची, और मंत्र — सब कुछ एक जगह।', category: 'Pooja Vidhi', readTime: '10 min', emoji: '🌺', lang: 'Hindi' },
  { slug: 'vastu-shastra-tips-for-home', title: 'Vastu Shastra Tips for Home — Room-by-Room Guide 2026', desc: 'AI-powered Vastu analysis: which direction for bedroom, kitchen, mandir and study room.', category: 'Vastu', readTime: '12 min', emoji: '🧭', lang: 'English' },
  { slug: 'gayatri-mantra-power-benefits', title: 'गायत्री मंत्र — शक्ति, फायदे and 108 बार जप की विधि', desc: 'वेदों का सबसे शक्तिशाली मंत्र। सूर्योदय में जपने से क्या होता है — जानें।', category: 'Mantras', readTime: '9 min', emoji: '☀️', lang: 'Hindi' },
  { slug: 'navratri-pooja-vidhi-2026', title: 'Navratri Pooja Vidhi 2026 — Complete Day-by-Day Guide', desc: 'Nine days, nine goddesses — complete guide to Navratri puja with colors, mantras and prasad.', category: 'Festivals', readTime: '15 min', emoji: '🌸', lang: 'English' },
  { slug: 'saturday-hanuman-puja-vidhi', title: 'शनिवार को हनुमान जी की पूजा कैसे करें', desc: 'शनि दोष से मुक्ति के लिए शनिवार की विशेष हनुमान पूजा विधि।', category: 'Pooja Vidhi', readTime: '6 min', emoji: '💪', lang: 'Hindi' },
  { slug: 'mangal-dosh-remedies-astrology', title: 'Mangal Dosh — Remedies, Effects & How AI Kundli Detects It', desc: 'Is Mangal Dosh real? What are its effects on marriage? AI-based analysis and proven remedies.', category: 'Astrology', readTime: '11 min', emoji: '🔴', lang: 'English' },
  { slug: 'best-time-for-morning-pooja', title: 'सुबह पूजा का सबसे शुभ समय क्या है? — ब्रह्म मुहूर्त का रहस्य', desc: 'ब्रह्म मुहूर्त (4-6 AM) में पूजा क्यों करें? वैज्ञानिक कारण और आध्यात्मिक महत्व।', category: 'Pooja Vidhi', readTime: '5 min', emoji: '🌅', lang: 'Hindi' },
  { slug: 'mahamrityunjaya-mantra-108-times-benefits', title: 'Mahamrityunjaya Mantra — 108 Times Chanting Benefits & Method', desc: 'The Maha Mantra of Lord Shiva that defeats death and illness. Complete guide with audio tips.', category: 'Mantras', readTime: '8 min', emoji: '☯️', lang: 'English' },
];

const CATEGORIES = ['All', 'Mantras', 'Pooja Vidhi', 'Astrology', 'Vastu', 'Festivals'];
const CAT_COLORS: Record<string, string> = {
  'Mantras': '#8B5CF6',
  'Pooja Vidhi': '#E8600A',
  'Astrology': '#C9922B',
  'Vastu': '#10B981',
  'Festivals': '#EC4899',
  'All': '#6B7280',
};

export default function BlogPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0500', color: '#FDF0DC', fontFamily: 'Georgia, serif' }}>
      
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a0800, #0f0400)', borderBottom: '1px solid #C9922B33', padding: '48px 24px 40px', textAlign: 'center' }}>
        <Link href="/" style={{ color: '#C9922B', textDecoration: 'none', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em', display: 'inline-block', marginBottom: '24px' }}>← Back to PoojaPath AI</Link>
        <div style={{ fontSize: '13px', color: '#E8600A', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>📿 Spiritual Knowledge Base</div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, color: '#FDF0DC', margin: '0 0 16px', lineHeight: 1.2 }}>Divine Wisdom Blog</h1>
        <p style={{ color: 'rgba(253,240,220,0.65)', fontSize: '15px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>AI-curated articles on Hindu mantras, pooja vidhi, Vedic astrology and festival guides in Hindi & English.</p>
        <div style={{ marginTop: '16px', fontSize: '12px', color: '#C9922B', fontWeight: 600 }}>{BLOGS.length} Articles • Updated Daily by AI</div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', padding: '24px', overflowX: 'auto', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '900px', margin: '0 auto' }}>
        {CATEGORIES.map(cat => (
          <span key={cat} style={{ padding: '6px 18px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', border: `1px solid ${CAT_COLORS[cat]}44`, color: CAT_COLORS[cat], background: `${CAT_COLORS[cat]}11`, whiteSpace: 'nowrap', cursor: 'pointer' }}>
            {cat}
          </span>
        ))}
      </div>

      {/* Blog Grid */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px 64px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '24px' }}>
        {BLOGS.map(blog => (
          <Link key={blog.slug} href={`/blog/${blog.slug}`} style={{ textDecoration: 'none' }}>
            <article className="divine-glow-card" style={{ borderRadius: '16px', padding: '24px', height: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '32px' }}>{blog.emoji}</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', background: `${CAT_COLORS[blog.category]}22`, color: CAT_COLORS[blog.category], border: `1px solid ${CAT_COLORS[blog.category]}44` }}>{blog.category}</span>
                <span style={{ fontSize: '10px', color: 'rgba(253,240,220,0.4)', fontWeight: 600 }}>{blog.lang} • {blog.readTime} read</span>
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#FDF0DC', margin: 0, lineHeight: 1.4 }}>{blog.title}</h2>
              <p style={{ fontSize: '13px', color: 'rgba(253,240,220,0.6)', lineHeight: 1.65, margin: 0, flex: 1 }}>{blog.desc}</p>
              <div style={{ fontSize: '12px', color: '#E8600A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto' }}>Read Article →</div>
            </article>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '48px 24px', background: 'linear-gradient(135deg, #1a0800, #0f0300)', borderTop: '1px solid #C9922B22' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>🕉️</div>
        <h2 style={{ color: '#FDF0DC', fontSize: '22px', marginBottom: '8px' }}>Ready for Your Personalized Pooja?</h2>
        <p style={{ color: 'rgba(253,240,220,0.6)', fontSize: '14px', marginBottom: '24px' }}>Let AI guide your spiritual journey with personalized mantras and kundli.</p>
        <Link href="/" style={{ background: 'linear-gradient(135deg, #E8600A, #C9922B)', color: '#fff', textDecoration: 'none', padding: '14px 32px', borderRadius: '50px', fontWeight: 700, fontSize: '14px', display: 'inline-block', boxShadow: '0 4px 20px rgba(232,96,10,0.4)' }}>Begin Your Journey 🪔</Link>
      </div>
    </div>
  );
}
