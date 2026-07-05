'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/firebase/AuthProvider';

export default function ReferralPage() {
  const { user } = useAuth();
  const [referralCount, setReferralCount] = useState(3);
  const [copied, setCopied] = useState(false);

  const refCode = user?.email
    ? 'PP' + user.email.split('@')[0].toUpperCase().slice(0, 6) + Math.abs(user.email.charCodeAt(0) * 13 % 999)
    : 'PPDEVOT123';
  const referralLink = `https://poojapath.ai?ref=${refCode}`;

  const earnings = referralCount * 50;
  const commissionEarnings = referralCount >= 5 ? referralCount * 90 : referralCount * 50;

  const tiers = [
    { name: 'Devotee', emoji: '🙏', min: 0, max: 4, reward: '₹50/referral', color: '#C9922B' },
    { name: 'Seva Doot', emoji: '🪔', min: 5, max: 14, reward: '₹90/referral + Badge', color: '#E8600A' },
    { name: 'Dharmik Doot', emoji: '⭐', min: 15, max: 29, reward: '₹150/referral + 25% cut', color: '#8B5CF6' },
    { name: 'Guru Bhakt', emoji: '🕉️', min: 30, max: 9999, reward: '30% commission forever', color: '#EC4899' },
  ];

  const currentTier = tiers.find(t => referralCount >= t.min && referralCount <= t.max) || tiers[0];

  const leaderboard = [
    { name: 'Ramesh K.', city: 'Mumbai', refs: 47, earned: '₹4,230', emoji: '🥇' },
    { name: 'Priya S.', city: 'Delhi', refs: 38, earned: '₹3,420', emoji: '🥈' },
    { name: 'Ankit M.', city: 'Pune', refs: 29, earned: '₹2,610', emoji: '🥉' },
    { name: 'Sunita R.', city: 'Jaipur', refs: 22, earned: '₹1,980', emoji: '4️⃣' },
    { name: 'Vikram P.', city: 'Ahmedabad', refs: 17, earned: '₹1,530', emoji: '5️⃣' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Namaste! Main PoojaPath AI use kar raha/rahi hun — India ka #1 AI Pooja Platform!\n\nYahan FREE kundli aur personalized mantra milti hai:\n${referralLink}\n\nMere referral code se join karo: ${refCode} 🙏`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0500', color: '#FDF0DC', fontFamily: 'Georgia, serif' }}>
      
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1a0800, #0f0400)', borderBottom: '1px solid #C9922B33', padding: '40px 24px', textAlign: 'center' }}>
        <Link href="/" style={{ color: '#C9922B', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'inline-block', marginBottom: '20px' }}>← Back to PoojaPath AI</Link>
        <div style={{ fontSize: '13px', color: '#E8600A', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>💰 Earn While Spreading Dharma</div>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 44px)', fontWeight: 700, color: '#FDF0DC', margin: '0 0 12px' }}>PoojaPath Referral Program</h1>
        <p style={{ color: 'rgba(253,240,220,0.65)', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>Apne dosto ko PoojaPath AI se milao aur har referral par ₹50–₹150 kamao!</p>
        <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
          {[['₹50', 'Per Referral'], ['₹4,230', 'Top Earner'], ['500+', 'Ambassadors']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#F2C96E' }}>{val}</div>
              <div style={{ fontSize: '11px', color: 'rgba(253,240,220,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Referral Link Box */}
        <div style={{ background: 'linear-gradient(135deg, #1a0800, #0f0300)', border: '2px solid #C9922B', borderRadius: '20px', padding: '32px', marginBottom: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#C9922B', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>Aapka Referral Code</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#F2C96E', letterSpacing: '0.15em', marginBottom: '16px', fontFamily: 'monospace' }}>{refCode}</div>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '20px', wordBreak: 'break-all', fontSize: '12px', color: 'rgba(253,240,220,0.6)', border: '1px solid #C9922B33' }}>{referralLink}</div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={handleCopy} style={{ background: copied ? '#10B981' : 'linear-gradient(135deg, #E8600A, #C9922B)', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '50px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s' }}>
              {copied ? '✅ Copied!' : '📋 Copy Link'}
            </button>
            <button onClick={handleWhatsApp} style={{ background: '#25D366', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '50px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              📱 Share on WhatsApp
            </button>
          </div>
        </div>

        {/* Earnings Calculator */}
        <div style={{ background: 'linear-gradient(135deg, #1a0800, #0f0300)', border: '1px solid #C9922B33', borderRadius: '16px', padding: '28px', marginBottom: '32px' }}>
          <h2 style={{ color: '#F2C96E', fontSize: '18px', marginBottom: '20px', textAlign: 'center' }}>💰 Earnings Calculator</h2>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: 'rgba(253,240,220,0.6)' }}>Referrals: </span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#E8600A' }}>{referralCount}</span>
          </div>
          <input type="range" min={1} max={100} value={referralCount} onChange={e => setReferralCount(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#E8600A', marginBottom: '20px', cursor: 'pointer' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(232,96,10,0.1)', border: '1px solid #E8600A44', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#E8600A' }}>₹{commissionEarnings.toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: 'rgba(253,240,220,0.5)', marginTop: '4px' }}>Total Earned</div>
            </div>
            <div style={{ background: 'rgba(201,146,43,0.1)', border: '1px solid #C9922B44', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#C9922B' }}>{currentTier.emoji} {currentTier.name}</div>
              <div style={{ fontSize: '11px', color: 'rgba(253,240,220,0.5)', marginTop: '4px' }}>Current Tier</div>
            </div>
          </div>
        </div>

        {/* Ambassador Tiers */}
        <h2 style={{ color: '#F2C96E', fontSize: '18px', marginBottom: '16px', textAlign: 'center' }}>🏆 Ambassador Tiers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          {tiers.map(tier => (
            <div key={tier.name} style={{ background: 'linear-gradient(135deg, #1a0800, #0f0300)', border: `1px solid ${tier.color}44`, borderRadius: '14px', padding: '20px', textAlign: 'center', ...(currentTier.name === tier.name ? { borderColor: tier.color, boxShadow: `0 0 20px ${tier.color}33` } : {}) }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{tier.emoji}</div>
              <div style={{ fontWeight: 700, color: tier.color, fontSize: '14px', marginBottom: '4px' }}>{tier.name}</div>
              <div style={{ fontSize: '10px', color: 'rgba(253,240,220,0.5)', marginBottom: '8px' }}>{tier.min}–{tier.max === 9999 ? '∞' : tier.max} referrals</div>
              <div style={{ fontSize: '11px', color: '#FDF0DC', fontWeight: 600 }}>{tier.reward}</div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <h2 style={{ color: '#F2C96E', fontSize: '18px', marginBottom: '20px', textAlign: 'center' }}>How It Works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '48px' }}>
          {[
            { step: '1', emoji: '📤', title: 'Share Your Link', desc: 'Send your unique referral link to friends on WhatsApp, Instagram or email.' },
            { step: '2', emoji: '🙏', title: 'Friend Joins', desc: 'Your friend signs up and tries PoojaPath AI for the first time.' },
            { step: '3', emoji: '💰', title: 'You Earn', desc: 'When they make their first purchase, ₹50 is credited to your wallet instantly!' },
          ].map(item => (
            <div key={item.step} style={{ background: 'linear-gradient(135deg, #1a0800, #0f0300)', border: '1px solid #C9922B33', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>{item.emoji}</div>
              <div style={{ fontSize: '10px', color: '#E8600A', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '6px' }}>STEP {item.step}</div>
              <div style={{ fontWeight: 700, color: '#FDF0DC', fontSize: '14px', marginBottom: '8px' }}>{item.title}</div>
              <div style={{ fontSize: '12px', color: 'rgba(253,240,220,0.6)', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Leaderboard */}
        <h2 style={{ color: '#F2C96E', fontSize: '18px', marginBottom: '16px', textAlign: 'center' }}>🏅 Top Ambassadors This Month</h2>
        <div style={{ background: 'linear-gradient(135deg, #1a0800, #0f0300)', border: '1px solid #C9922B33', borderRadius: '16px', overflow: 'hidden', marginBottom: '48px' }}>
          {leaderboard.map((person, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderBottom: i < leaderboard.length - 1 ? '1px solid #C9922B1A' : 'none' }}>
              <span style={{ fontSize: '20px' }}>{person.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: '#FDF0DC', fontSize: '14px' }}>{person.name}</div>
                <div style={{ fontSize: '11px', color: 'rgba(253,240,220,0.5)' }}>{person.city}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, color: '#E8600A', fontSize: '13px' }}>{person.earned}</div>
                <div style={{ fontSize: '10px', color: 'rgba(253,240,220,0.4)' }}>{person.refs} referrals</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
