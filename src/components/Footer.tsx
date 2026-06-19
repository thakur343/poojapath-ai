import React from "react";

export default function Footer() {
  return (
    <footer>
      <div>
        <div style={{ color: 'var(--sl)', fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>PoojaPath.ai</div>
        <div style={{ fontSize: '10px' }}>Silicon Valley Precision. Kashi Wisdom.</div>
      </div>
      <div style={{ display: 'flex', gap: '14px' }}>
        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Refunds</a>
      </div>
    </footer>
  );
}
