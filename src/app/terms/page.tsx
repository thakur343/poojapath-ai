import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions | PoojaPath AI',
  description: 'PoojaPath AI Terms and Conditions of Service.',
};

export default function TermsPage() {
  const sections = [
    { title: '1. Agreement to Terms', content: 'By accessing and using PoojaPath AI ("Service"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our Service. These terms apply to all users including registered accounts and guest visitors.' },
    { title: '2. Description of Service', content: 'PoojaPath AI provides AI-powered Hindu spiritual services including:\n• Personalized mantra guidance via AI chatbot (Pandit Ji AI)\n• Online Kundli (birth chart) generation and analysis\n• AI-curated devotional wallpapers\n• Vastu Shastra AI scanning\n• Jaap (mantra chanting) counter and tracking\n• Online booking facilitation for pandits\n\nWe are a digital platform and do not employ pandits directly.' },
    { title: '3. User Accounts', content: '• You must provide accurate information when creating an account.\n• You are responsible for maintaining the security of your account credentials.\n• You must be 13 years or older to use PoojaPath AI.\n• We reserve the right to terminate accounts that violate these terms.' },
    { title: '4. Payment Terms', content: '• All prices are listed in Indian Rupees (INR) and include GST where applicable.\n• Payments are processed by Razorpay — a PCI-DSS compliant payment gateway.\n• Digital products (Kundli PDFs, wallpapers, mantra reports) are non-refundable once delivered.\n• For pandit booking services, refunds are processed within 7 business days if the pandit cancels.' },
    { title: '5. Refund Policy', content: '• AI-generated content (kundli, mantras, wallpapers) — No refund once generated and delivered.\n• Pandit Booking — Full refund if cancelled 24+ hours before event. 50% refund for 12-24 hours cancellation.\n• Technical Issues — Full refund if service fails to deliver due to our error.\n\nTo request a refund: refunds@poojapath.ai' },
    { title: '6. Prohibited Use', content: 'You may NOT:\n• Use our Service for any unlawful purpose\n• Attempt to reverse engineer or scrape our AI systems\n• Use our platform to spread misinformation about Hindu practices\n• Impersonate religious authorities or pandits\n• Use automated bots to abuse our free tier services' },
    { title: '7. Intellectual Property', content: 'All content on PoojaPath AI including AI-generated mantras, kundli reports, and wallpapers remain the intellectual property of PoojaPath AI. You receive a personal, non-transferable license to use purchased content. Redistribution or resale is prohibited.' },
    { title: '8. Limitation of Liability', content: 'PoojaPath AI provides spiritual guidance for informational and entertainment purposes. We are not a substitute for qualified religious counsel, medical advice, or legal advice. We are not liable for decisions made based on our AI-generated content. Our maximum liability is limited to the amount paid for the specific service in question.' },
    { title: '9. Governing Law', content: 'These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India. If any provision of these Terms is found invalid, the remaining provisions continue in full force.' },
    { title: '10. Contact', content: 'For questions about these Terms:\n📧 legal@poojapath.ai\n🌐 https://poojapath.ai/contact\n\nLast updated: July 1, 2026' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0500', color: '#FDF0DC', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: 'linear-gradient(135deg, #1a0800, #0f0400)', borderBottom: '1px solid #C9922B33', padding: '40px 24px', textAlign: 'center' }}>
        <Link href="/" style={{ color: '#C9922B', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'inline-block', marginBottom: '20px' }}>← Back to PoojaPath AI</Link>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>📜</div>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#FDF0DC', margin: '0 0 8px' }}>Terms & Conditions</h1>
        <p style={{ color: 'rgba(253,240,220,0.6)', fontSize: '14px' }}>Last updated: July 1, 2026</p>
      </div>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        {sections.map((sec, i) => (
          <div key={i} style={{ marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #C9922B1A' }}>
            <h2 style={{ color: '#F2C96E', fontSize: '18px', marginBottom: '12px' }}>{sec.title}</h2>
            <p style={{ color: 'rgba(253,240,220,0.8)', fontSize: '14px', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{sec.content}</p>
          </div>
        ))}
        <div style={{ textAlign: 'center' }}>
          <Link href="/" style={{ color: '#C9922B', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>← Return to PoojaPath AI</Link>
        </div>
      </div>
    </div>
  );
}
