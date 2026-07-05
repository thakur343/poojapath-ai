import type { Metadata } from 'next';
import Link from 'next/link';

const BLOG_CONTENT: Record<string, { title: string; desc: string; emoji: string; category: string; readTime: string; content: string; keywords: string[] }> = {
  'hanuman-chalisa-benefits-hindi': {
    title: 'हनुमान चालीसा के 40 चमत्कारी फायदे',
    desc: 'रोज़ हनुमान चालीसा पढ़ने से क्या होता है? वैज्ञानिक और आध्यात्मिक दोनों नज़रिए से जानें।',
    emoji: '🙏', category: 'Mantras', readTime: '8 min',
    keywords: ['hanuman chalisa benefits', 'hanuman chalisa hindi', 'hanuman chalisa padhne ke fayde'],
    content: `
<h2>हनुमान चालीसा क्या है?</h2>
<p>हनुमान चालीसा गोस्वामी तुलसीदास द्वारा रचित 40 चौपाइयों का एक पवित्र स्तोत्र है। यह भगवान हनुमान की स्तुति में लिखा गया है और इसे दुनिया में सबसे अधिक पढ़े जाने वाले धार्मिक ग्रंथों में गिना जाता है।</p>
<br/>
<h2>रोज़ हनुमान चालीसा पढ़ने के मुख्य फायदे</h2>
<h3>1. भय और नकारात्मकता दूर होती है</h3>
<p>हनुमान चालीसा की ध्वनि तरंगें मन में सकारात्मक ऊर्जा उत्पन्न करती हैं। वैज्ञानिक शोध बताते हैं कि मंत्र जाप से मस्तिष्क में डोपामिन और सेरोटोनिन का स्तर बढ़ता है।</p>
<h3>2. शनि दोष से मुक्ति</h3>
<p>ज्योतिष शास्त्र के अनुसार, हनुमान जी शनि देव के भय को दूर करते हैं। शनिवार को हनुमान चालीसा पढ़ने से शनि की महादशा और साढ़ेसाती का प्रभाव कम होता है।</p>
<h3>3. मानसिक शांति और एकाग्रता</h3>
<p>नियमित पाठ से मन की चंचलता दूर होती है। छात्रों के लिए विशेष रूप से लाभदायक है — परीक्षा में एकाग्रता बढ़ती है।</p>
<h3>4. शारीरिक स्वास्थ्य में सुधार</h3>
<p>श्वास नियंत्रण के साथ मंत्र जाप फेफड़ों को मजबूत बनाता है। प्राणायाम जैसा प्रभाव होता है।</p>
<h3>5. बुरी नज़र और नकारात्मक शक्तियों से रक्षा</h3>
<p>हनुमान जी को महावीर कहा जाता है — उनका स्मरण मात्र ही नकारात्मक ऊर्जा को नष्ट करता है।</p>
<br/>
<h2>हनुमान चालीसा पाठ की सही विधि</h2>
<p><strong>समय:</strong> सुबह 6 बजे या शाम 6 बजे (सूर्योदय/सूर्यास्त के समय)</p>
<p><strong>दिशा:</strong> पूर्व या उत्तर की ओर मुख करके बैठें</p>
<p><strong>संख्या:</strong> 1, 3, 7, 11, या 108 बार — जो संभव हो</p>
<p><strong>सामग्री:</strong> लाल फूल, चमेली का तेल, गुड़ और चना का प्रसाद</p>
<br/>
<h2>PoojaPath AI पर हनुमान चालीसा का जाप करें</h2>
<p>हमारे AI-powered जाप काउंटर से अपनी streak track करें और सही उच्चारण guidance पाएं।</p>
`
  },
  'om-namah-shivaya-meaning-hindi': {
    title: 'ॐ नमः शिवाय — अर्थ, महत्व और जाप विधि',
    desc: 'पंचाक्षर मंत्र का गहरा अर्थ और इसे सही तरीके से जपने की विधि।',
    emoji: '🕉️', category: 'Mantras', readTime: '6 min',
    keywords: ['om namah shivaya meaning', 'om namah shivaya benefits', 'shiv mantra hindi'],
    content: `
<h2>ॐ नमः शिवाय — पंचाक्षर मंत्र का रहस्य</h2>
<p>"ॐ नमः शिवाय" को पंचाक्षर मंत्र कहते हैं क्योंकि "न", "मः", "शि", "वा", "य" — ये पाँच अक्षर पाँच तत्वों (पृथ्वी, जल, आकृति, वायु, आकाश) का प्रतिनिधित्व करते हैं।</p>
<br/>
<h2>मंत्र का शब्दशः अर्थ</h2>
<p><strong>ॐ</strong> — ब्रह्माण्ड की मूल ध्वनि</p>
<p><strong>नमः</strong> — मैं नमन करता हूँ, अहंकार का समर्पण</p>
<p><strong>शिवाय</strong> — शुभ, कल्याणकारी, शिव को</p>
<p>पूरा अर्थ: "मैं अपने अहंकार का त्याग करते हुए शिव (परम कल्याण) को नमन करता हूँ।"</p>
<br/>
<h2>जाप के नियम</h2>
<p>सोमवार को विशेष रूप से, रुद्राक्ष माला से 108 बार जप करें। बिल्वपत्र, धतूरा और गंगाजल अर्पित करें।</p>
`
  },
};

const DEFAULT_CONTENT = {
  title: 'Spiritual Guide', desc: 'A complete guide to Hindu spirituality.',
  emoji: '🕉️', category: 'Spiritual', readTime: '5 min', keywords: ['pooja', 'mantra', 'hindu'],
  content: '<h2>Introduction</h2><p>This is a comprehensive guide to Hindu spiritual practices, mantras and pooja vidhi.</p>'
};

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_CONTENT[slug] || DEFAULT_CONTENT;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://poojapath.ai';
  return {
    title: post.title,
    description: post.desc,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.desc,
      type: 'article',
      url: `${siteUrl}/blog/${slug}`,
    },
    alternates: { canonical: `/blog/${slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = BLOG_CONTENT[slug] || { 
    ...DEFAULT_CONTENT, 
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) 
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0500', color: '#FDF0DC', fontFamily: 'Georgia, serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a0800, #0f0400)', borderBottom: '1px solid #C9922B33', padding: '32px 24px 40px', textAlign: 'center' }}>
        <Link href="/blog" style={{ color: '#C9922B', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'inline-block', marginBottom: '24px' }}>← Back to Blog</Link>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>{post.emoji}</div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: '#E8600A22', color: '#E8600A', border: '1px solid #E8600A44' }}>{post.category}</span>
          <span style={{ fontSize: '11px', color: 'rgba(253,240,220,0.5)', display: 'flex', alignItems: 'center', gap: '4px' }}>📖 {post.readTime} read</span>
        </div>
        <h1 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 700, color: '#FDF0DC', maxWidth: '700px', margin: '0 auto 12px', lineHeight: 1.3 }}>{post.title}</h1>
        <p style={{ color: 'rgba(253,240,220,0.6)', fontSize: '15px', maxWidth: '600px', margin: '0 auto' }}>{post.desc}</p>
      </div>

      {/* Content + Sidebar */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '48px', alignItems: 'start' }}>
        {/* Article Content */}
        <article
          style={{ lineHeight: 1.8, fontSize: '16px', color: 'rgba(253,240,220,0.85)' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Sidebar CTA */}
        <aside style={{ position: 'sticky', top: '24px' }}>
          <div style={{ background: 'linear-gradient(135deg, #1a0800, #0f0300)', border: '1px solid #C9922B44', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🪔</div>
            <h3 style={{ color: '#F2C96E', fontSize: '16px', marginBottom: '8px' }}>Try PoojaPath AI</h3>
            <p style={{ color: 'rgba(253,240,220,0.6)', fontSize: '12px', marginBottom: '20px', lineHeight: 1.6 }}>Get personalized mantras, kundli analysis and AI pooja guidance.</p>
            <Link href="/" style={{ display: 'block', background: 'linear-gradient(135deg, #E8600A, #C9922B)', color: '#fff', textDecoration: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '13px', marginBottom: '12px' }}>Start Free 🕉️</Link>
            <Link href="/kundli" style={{ display: 'block', border: '1px solid #C9922B44', color: '#C9922B', textDecoration: 'none', padding: '10px', borderRadius: '12px', fontWeight: 600, fontSize: '12px' }}>Free Kundli →</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
