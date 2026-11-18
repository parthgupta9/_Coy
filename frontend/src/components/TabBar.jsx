import React from 'react';
import { Home, Compass, MessageCircleHeart } from 'lucide-react';

export default function TabBar({ activeTab, onSelectTab, matchCount }) {
  return (
    <nav className="bottom-tab-bar" aria-label="Main Navigation">
      <button
        className={`tab-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => onSelectTab('home')}
        title="Home Feed (Placeholder)"
      >
        <Home size={22} />
        <span className="tab-label">Home</span>
      </button>

      <button
        className={`tab-item ${activeTab === 'discover' ? 'active' : ''}`}
        onClick={() => onSelectTab('discover')}
        title="Discover - Swipe on profiles"
      >
        <Compass size={24} />
        <span className="tab-label">Discover</span>
      </button>

      <button
        className={`tab-item ${activeTab === 'matches' ? 'active' : ''}`}
        onClick={() => onSelectTab('matches')}
        title="Mutual Matches"
      >
        <MessageCircleHeart size={22} />
        <span className="tab-label">Matches</span>
        {matchCount > 0 && <span className="tab-badge">{matchCount}</span>}
      </button>
    </nav>
  );
}
