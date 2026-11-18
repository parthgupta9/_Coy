import React from 'react';
import { Flame, RotateCcw, Monitor, Smartphone } from 'lucide-react';

export default function TopNav({ onReset, isResetting, user, viewMode, onToggleViewMode }) {
  return (
    <header className="top-nav">
      <div className="brand-logo" title="Coy Discovery">
        <Flame size={26} color="#FE3C72" fill="#FE3C72" />
        <span>Coy</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Desktop / Mobile view toggle for testing */}
        <button
          className="view-toggle-btn"
          onClick={onToggleViewMode}
          title={viewMode === 'desktop' ? 'Switch to Mobile Frame' : 'Switch to Full Desktop View'}
        >
          {viewMode === 'desktop' ? (
            <>
              <Smartphone size={14} />
              <span className="hide-on-small">Phone Frame</span>
            </>
          ) : (
            <>
              <Monitor size={14} />
              <span className="hide-on-small">Desktop View</span>
            </>
          )}
        </button>

        <div className="user-status-pill" title="Logged in as demo user">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"}
            alt="Alex"
            className="user-status-avatar"
          />
          <span className="hide-on-small">{user?.name || "Alex, 24"}</span>
        </div>

        <button
          className="reset-btn"
          onClick={onReset}
          disabled={isResetting}
          title="Reset deck to original 35 profiles & clear swipes/matches"
        >
          <RotateCcw size={13} className={isResetting ? 'spin' : ''} />
          <span>{isResetting ? 'Resetting...' : 'Reset'}</span>
        </button>
      </div>
    </header>
  );
}
