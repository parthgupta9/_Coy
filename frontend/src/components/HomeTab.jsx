import React from 'react';
import { Home, Sparkles, ArrowRight } from 'lucide-react';

export default function HomeTab({ onGoToDiscover }) {
  return (
    <div className="home-placeholder-view">
      <div className="home-icon-wrap">
        <Home size={34} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '300px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Coy Home</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          This is the placeholder Home tab. Coy's new swipe discovery feature lives inside the <strong>Discover</strong> tab.
        </p>
      </div>

      <button className="btn-primary" onClick={onGoToDiscover} style={{ marginTop: '12px' }}>
        <Sparkles size={18} />
        <span>Open Discover Tab</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
