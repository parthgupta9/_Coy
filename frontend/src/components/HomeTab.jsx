import React from 'react';
import { Home, Sparkles, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function HomeTab({ onGoToDiscover }) {
  return (
    <div className="web-home-workspace">
      <div className="home-hero-card">
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '24px',
            background: 'rgba(254, 60, 114, 0.12)',
            border: '2px solid rgba(254, 60, 114, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--coy-brand)'
          }}
        >
          <Home size={38} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>
            Welcome to Coy
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '480px' }}>
            This is the placeholder Home tab at <strong>app.getcoy.com</strong>. Coy's new swipe-based discovery feature lives in the <strong>Discover</strong> tab.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '16px 24px',
            borderRadius: '16px',
            border: '1px solid var(--surface-border)',
            textAlign: 'left'
          }}
        >
          <ShieldCheck size={28} color="var(--coy-brand)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '13px', color: 'var(--text-sub)' }}>
            <strong>Coy Promise:</strong> No awkward one-sided reveals. You only see connections when both people have liked each other.
          </div>
        </div>

        <button className="btn-primary" onClick={onGoToDiscover} style={{ marginTop: '8px' }}>
          <Sparkles size={18} />
          <span>Launch Discover Tab</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
