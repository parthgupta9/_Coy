import React, { useState, useEffect, useCallback } from 'react';
import TopNav from './components/TopNav';
import TabBar from './components/TabBar';
import DiscoverTab from './components/DiscoverTab';
import MatchesTab from './components/MatchesTab';
import HomeTab from './components/HomeTab';
import MatchModal from './components/MatchModal';
import ChatModal from './components/ChatModal';

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
  const [activeChatProfile, setActiveChatProfile] = useState(null);
  
  // Default to desktop view on wide screens (>= 768px), mobile on small
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      return 'desktop';
    }
    return 'mobile';
  });

  const currentUser = {
    name: "Alex, 24",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80"
  };

  // Keyboard navigation for desktop users (← Pass, → Like, ↑ Superlike, Esc Close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in chat input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'Escape') {
        if (currentMatchModal) setCurrentMatchModal(null);
        if (activeChatProfile) setActiveChatProfile(null);
        return;
      }

      if (activeTab === 'discover' && feed.length > 0 && !currentMatchModal && !activeChatProfile) {
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
  }, [activeTab, feed, currentMatchModal, activeChatProfile]);

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
    setActiveChatProfile(profile);
  };

  const toggleViewMode = () => {
    setViewMode(prev => prev === 'desktop' ? 'mobile' : 'desktop');
  };

  return (
    <div className={`app-container ${viewMode === 'desktop' ? 'desktop-layout' : 'mobile-frame'}`}>
      {/* Top Header */}
      <TopNav
        onReset={handleReset}
        isResetting={isResetting}
        user={currentUser}
        viewMode={viewMode}
        onToggleViewMode={toggleViewMode}
      />

      {/* Main Tab Screen */}
      <main className="main-content">
        {activeTab === 'home' && (
          <HomeTab onGoToDiscover={() => setActiveTab('discover')} />
        )}

        {activeTab === 'discover' && (
          <DiscoverTab
            feed={feed}
            isLoading={isLoadingFeed}
            onSwipe={handleSwipe}
            onReset={handleReset}
            matchCount={matches.length}
            onViewMatches={() => setActiveTab('matches')}
          />
        )}

        {activeTab === 'matches' && (
          <MatchesTab
            matches={matches}
            onGoToDiscover={() => setActiveTab('discover')}
          />
        )}
      </main>

      {/* Bottom Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        matchCount={matches.length}
      />

      {/* Match Celebration Modal */}
      {currentMatchModal && (
        <MatchModal
          matchProfile={currentMatchModal}
          user={currentUser}
          onSendMessage={handleSendMessageFromMatch}
          onKeepSwiping={() => setCurrentMatchModal(null)}
        />
      )}

      {/* Chat Drawer if opened from Match modal */}
      {activeChatProfile && (
        <ChatModal
          profile={activeChatProfile}
          onClose={() => setActiveChatProfile(null)}
        />
      )}
    </div>
  );
}
