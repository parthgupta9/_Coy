import React, { useState, useEffect, useCallback } from 'react';
import TopNav from './components/TopNav';
import DiscoverTab from './components/DiscoverTab';
import MatchesTab from './components/MatchesTab';
import HomeTab from './components/HomeTab';
import MatchModal from './components/MatchModal';
import ChatModal from './components/ChatModal';
import { Home, Compass, MessageCircleHeart } from 'lucide-react';

// Determine API base url (if frontend running on port 3000, call backend on 5000)
const getApiBase = () => {
  if (typeof window !== 'undefined') {
    if (window.location.port === '3000') {
      return 'http://localhost:5000';
    }
  }
  return '';
};

export default function App() {
  const [activeTab, setActiveTab] = useState('discover');
  const [feed, setFeed] = useState([]);
  const [matches, setMatches] = useState([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [currentMatchModal, setCurrentMatchModal] = useState(null);
  const [activeMobileChatProfile, setActiveMobileChatProfile] = useState(null);

  const currentUser = {
    name: "Alex, 24",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"
  };

  // Keyboard navigation for desktop web users (← Pass, → Like, ↑ Superlike, Esc Close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in chat input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'Escape') {
        if (currentMatchModal) setCurrentMatchModal(null);
        if (activeMobileChatProfile) setActiveMobileChatProfile(null);
        return;
      }

      if (activeTab === 'discover' && feed.length > 0 && !currentMatchModal && !activeMobileChatProfile) {
        const topProfile = feed[0];
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handleSwipe('pass', topProfile);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleSwipe('like', topProfile);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          handleSwipe('super', topProfile);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, feed, currentMatchModal, activeMobileChatProfile]);

  // Fetch feed (unswiped profiles)
  const fetchFeed = useCallback(async () => {
    try {
      setIsLoadingFeed(true);
      const res = await fetch(`${getApiBase()}/feed`);
      const data = await res.json();
      if (data.success && Array.isArray(data.profiles)) {
        setFeed(data.profiles);
      }
    } catch (err) {
      console.error('Failed to fetch feed:', err);
    } finally {
      setIsLoadingFeed(false);
    }
  }, []);

  // Fetch mutual matches
  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch(`${getApiBase()}/matches`);
      const data = await res.json();
      if (data.success && Array.isArray(data.matches)) {
        setMatches(data.matches);
      }
    } catch (err) {
      console.error('Failed to fetch matches:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchFeed();
    fetchMatches();
  }, [fetchFeed, fetchMatches]);

  // Handle Swipe (like or pass)
  const handleSwipe = async (action, profile) => {
    if (!profile) return;

    // Normalize superlike to like for matching logic
    const backendAction = action === 'super' ? 'like' : action;

    // Optimistically remove from feed
    setFeed(prev => prev.filter(p => p.id !== profile.id));

    try {
      const res = await fetch(`${getApiBase()}/swipe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          action: backendAction
        })
      });

      const data = await res.json();

      // If it created a mutual match, trigger celebration modal!
      if (data.success && data.match) {
        const matchedProfile = data.profile || profile;
        setCurrentMatchModal(matchedProfile);
        // Refresh matches
        fetchMatches();
      }
    } catch (err) {
      console.error('Failed to record swipe:', err);
    }
  };

  // Reset demo deck
  const handleReset = async () => {
    try {
      setIsResetting(true);
      const res = await fetch(`${getApiBase()}/reset`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await Promise.all([fetchFeed(), fetchMatches()]);
      }
    } catch (err) {
      console.error('Failed to reset:', err);
    } finally {
      setIsResetting(false);
    }
  };

  // Match modal CTA: Send Message
  const handleSendMessageFromMatch = (profile) => {
    setCurrentMatchModal(null);
    if (window.innerWidth < 768) {
      setActiveMobileChatProfile(profile);
    } else {
      setActiveTab('matches');
    }
  };

  return (
    <div className="web-app-shell">
      {/* Top Web Header Navbar (Full Width) */}
      <TopNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        matchCount={matches.length}
        onReset={handleReset}
        isResetting={isResetting}
        user={currentUser}
      />

      {/* Main Web Workspace */}
      <div className="web-main-workspace">
        {activeTab === 'home' && (
          <HomeTab onGoToDiscover={() => setActiveTab('discover')} />
        )}

        {activeTab === 'discover' && (
          <DiscoverTab
            feed={feed}
            matches={matches}
            isLoading={isLoadingFeed}
            onSwipe={handleSwipe}
            onReset={handleReset}
            matchCount={matches.length}
            onViewMatches={() => setActiveTab('matches')}
            onOpenChat={(profile) => {
              if (window.innerWidth < 768) {
                setActiveMobileChatProfile(profile);
              } else {
                setActiveTab('matches');
              }
            }}
          />
        )}

        {activeTab === 'matches' && (
          <MatchesTab
            matches={matches}
            onGoToDiscover={() => setActiveTab('discover')}
          />
        )}
      </div>

      {/* Mobile Bottom Tab Bar (Appears on screens < 768px for thumbs navigation) */}
      <nav className="mobile-bottom-tabs" aria-label="Mobile Navigation">
        <button
          className={`tab-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={22} />
          <span className="tab-label">Home</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          <Compass size={24} />
          <span className="tab-label">Discover</span>
        </button>

        <button
          className={`tab-item ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          <MessageCircleHeart size={22} />
          <span className="tab-label">Matches {matches.length > 0 ? `(${matches.length})` : ''}</span>
        </button>
      </nav>

      {/* Match Celebration Modal */}
      {currentMatchModal && (
        <MatchModal
          matchProfile={currentMatchModal}
          user={currentUser}
          onSendMessage={handleSendMessageFromMatch}
          onKeepSwiping={() => setCurrentMatchModal(null)}
        />
      )}

      {/* Mobile Chat Drawer if triggered on small screens */}
      {activeMobileChatProfile && (
        <ChatModal
          profile={activeMobileChatProfile}
          onClose={() => setActiveMobileChatProfile(null)}
        />
      )}
    </div>
  );
}
