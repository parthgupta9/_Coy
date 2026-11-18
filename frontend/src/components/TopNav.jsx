import React from 'react';
import { Flame, RotateCcw, Home, Compass, MessageCircleHeart } from 'lucide-react';

export default function TopNav({
  activeTab,
  onSelectTab,
  matchCount,
  onReset,
  isResetting,
  user
}) {
  return (
    <header className="web-header">
      {/* Brand Section */}
      <div className="brand-section" onClick={() => onSelectTab('discover')} title="Coy Discovery">
        <Flame size={28} color="#FE3C72" fill="#FE3C72" />
        <span className="brand-title">Coy</span>
        <span className="brand-domain">app.getcoy.com</span>
      </div>

      {/* Desktop Navigation Tabs */}
      <nav className="header-nav-tabs" aria-label="Web Navigation">
        <button
          className={`header-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => onSelectTab('home')}
        >
          <Home size={18} />
          <span>Home</span>
        </button>

        <button
          className={`header-tab-btn ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => onSelectTab('discover')}
        >
          <Compass size={18} />
          <span>Discover</span>
        </button>

        <button
          className={`header-tab-btn ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => onSelectTab('matches')}
        >
          <MessageCircleHeart size={18} />
          <span>Matches</span>
          {matchCount > 0 && <span className="match-counter-pill">{matchCount}</span>}
        </button>
      </nav>

      {/* User Status & Demo Controls */}
      <div className="header-user-section">
        <div className="user-profile-badge" title="Single logged-in user">
          <img
            src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"}
            alt="Alex"
            className="user-avatar-img"
          />
          <span>{user?.name || "Alex, 24"}</span>
        </div>

        <button
          className="btn-header-reset"
          onClick={onReset}
          disabled={isResetting}
          title="Reset deck to 35 profiles & clear demo swipes"
        >
          <RotateCcw size={14} className={isResetting ? 'spin' : ''} />
          <span>{isResetting ? 'Resetting...' : 'Reset Deck'}</span>
        </button>
      </div>
    </header>
  );
}
