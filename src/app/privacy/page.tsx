import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | PoojaPath AI',
  description: 'PoojaPath AI Privacy Policy — How we collect, use and protect your personal data.',
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: `We collect the following types of information when you use PoojaPath AI:

• **Account Information**: Name, email address, and profile photo when you sign up via Google or email.
• **Usage Data**: Pages visited, features used, jaap count, session timestamps — used to personalize your experience.
• **Birth Details**: Date, time, and place of birth — used solely to generate your Kundli report. This data is never shared with third parties.
• **Payment Information**: We do not store your card or UPI details. All payments are processed securely by Razorpay.
• **Device Data**: Browser type, IP address, and device information for security and analytics.`
    },
    {
      title: '2. How We Use Your Data',
      content: `• To provide personalized pooja guidance, mantra recommendations, and kundli analysis.
• To send you devotional email reminders at your preferred pooja time (you can unsubscribe anytime).
• To improve our AI models and app features.
• To process payments and prevent fraud.
• To send important service updates and security notices.`
    },
    {
      title: '3. Data Sharing',
      content: `We do NOT sell your personal data to third parties. We share data only with:

• **Razorpay**: For payment processing (governed by Razorpay Privacy Policy).
• **Firebase (Google)**: For authentication and cloud storage.
• **Groq AI**: For generating AI responses — only your message text, never personal details.
• **Legal Requirements**: When required by law or to protect our rights.`
    },
    {
      title: '4. Cookies',
      content: `We use cookies and local storage to:
• Keep you logged in between sessions.
• Remember your language preference (Hindi/English).
• Track your jaap streak without requiring repeated login.

You can clear cookies via your browser settings. Note that this will log you out.`
    },
    {
      title: '5. Your Rights (GDPR & Indian IT Act)',
      content: `You have the right to:
• **Access**: Request a copy of your personal data.
• **Correction**: Update incorrect information in your profile.
• **Deletion**: Request deletion of your account and all associated data.
• **Unsubscribe**: Opt out of marketing emails via the unsubscribe link in every email.

To exercise these rights, email us at: privacy@poojapath.ai`
    },
    {
      title: '6. Data Security',
      content: `We implement industry-standard security measures including:
• HTTPS encryption for all data transmission.
• Firebase Authentication for secure login.
• No storage of payment card data on our servers.
• Regular security audits.`
    },
    {
      title: '7. Data Retention',
      content: `• Account data is retained while your account is active.
• Birth details for kundli are stored encrypted and deleted upon account deletion.
• Email logs are retained for 12 months for deliverability analysis.
• You can request immediate deletion by emailing privacy@poojapath.ai.`
    },
    {
      title: '8. Contact Us',
      content: `For privacy concerns, data requests, or questions:

📧 Email: privacy@poojapath.ai
🌐 Website: https://poojapath.ai/contact
📍 PoojaPath AI, India

This policy was last updated on July 1, 2026.`
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0500', color: '#FDF0DC', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a0800, #0f0400)', borderBottom: '1px solid #C9922B33', padding: '40px 24px', textAlign: 'center' }}>
        <Link href="/" style={{ color: '#C9922B', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'inline-block', marginBottom: '20px' }}>← Back to PoojaPath AI</Link>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔐</div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#FDF0DC', margin: '0 0 8px' }}>Privacy Policy</h1>
        <p style={{ color: 'rgba(253,240,220,0.6)', fontSize: '14px' }}>Last updated: July 1, 2026 | Effective immediately</p>
      </div>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        {sections.map((sec, i) => (
          <div key={i} style={{ marginBottom: '36px', paddingBottom: '36px', borderBottom: '1px solid #C9922B1A' }}>
            <h2 style={{ color: '#F2C96E', fontSize: '18px', marginBottom: '16px' }}>{sec.title}</h2>
            <div style={{ color: 'rgba(253,240,220,0.8)', fontSize: '14px', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{sec.content}</div>
          </div>
        ))}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link href="/" style={{ color: '#C9922B', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>← Return to PoojaPath AI</Link>
        </div>
      </div>
    </div>
  );
}
