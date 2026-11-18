import React, { useState } from 'react';
import { X, Heart, Star, RotateCcw, Info, Loader2, ShieldCheck, Sparkles, MessageCircleHeart } from 'lucide-react';
import SwipeCard from './SwipeCard';
import EmptyState from './EmptyState';
import InfoDrawer from './InfoDrawer';

export default function DiscoverTab({
  feed,
  matches,
  isLoading,
  onSwipe,
  onReset,
  matchCount,
  onViewMatches,
  onOpenChat
}) {
  const [triggerAction, setTriggerAction] = useState(null);
  const [selectedProfileForInfo, setSelectedProfileForInfo] = useState(null);
  const [actionFeedbackToast, setActionFeedbackToast] = useState(null);

  const handleButtonAction = (action) => {
    if (feed.length === 0 || triggerAction) return;
    setTriggerAction(action);
  };

  const handleCardSwipeComplete = (action, profile) => {
    setTriggerAction(null);
    onSwipe(action, profile);
  };

  if (isLoading) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          width: '100%',
          height: '100%'
        }}
      >
        <Loader2 size={40} color="var(--coy-brand)" className="spin" />
        <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '600' }}>
          Finding nearby profiles on Coy...
        </span>
      </div>
    );
  }

  const topProfile = feed.length > 0 ? feed[0] : null;
  const stackedProfile = feed.length > 1 ? feed[1] : null;
  const deepStackedProfile = feed.length > 2 ? feed[2] : null;

  return (
    <div className="discover-layout-desktop">
      {/* Left Sidebar (Desktop Web Experience) */}
      <aside className="discover-sidebar">
        {/* Discovery Stats Widget */}
        <div className="sidebar-widget">
          <div className="widget-title">
            <span>Discovery Radar</span>
            <Sparkles size={14} color="var(--coy-brand)" />
          </div>
          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-num">{feed.length}</div>
              <div className="stat-label">Profiles Remaining</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{matchCount}</div>
              <div className="stat-label">Mutual Matches</div>
            </div>
          </div>
        </div>

        {/* Privacy Guarantee Reassurance Widget */}
        <div className="privacy-banner">
          <ShieldCheck size={24} className="privacy-banner-icon" />
          <div className="privacy-banner-text">
            <strong>Coy Privacy Guarantee</strong>
            <p style={{ marginTop: '3px' }}>
              Likes are 100% confidential. You only see someone's interest when the feeling is mutual.
            </p>
          </div>
        </div>

        {/* Matches Quick-Access Strip */}
        <div className="sidebar-widget">
          <div className="widget-title">
            <span>Recent Matches ({matchCount})</span>
            <button
              onClick={onViewMatches}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--coy-brand)',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              View All
            </button>
          </div>

          {matches.length === 0 ? (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
              No matches yet. Swipe right on profiles to discover mutual connections!
            </div>
          ) : (
            <div className="sidebar-matches-grid">
              {matches.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  className="sidebar-match-item"
                  onClick={() => onOpenChat(m)}
                  title={`Chat with ${m.name}`}
                >
                  <img src={m.photo} alt={m.name} className="sidebar-match-avatar" />
                  <div className="sidebar-match-info">
                    <span className="sidebar-match-name">{m.name}, {m.age}</span>
                    <span className="sidebar-match-sub">{m.city_or_college}</span>
                  </div>
                  <MessageCircleHeart size={16} color="var(--coy-brand)" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts Helper */}
        <div className="sidebar-widget">
          <div className="widget-title">
            <span>Keyboard Shortcuts</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-sub)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Pass</span>
              <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>← Left Arrow</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Like</span>
              <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>→ Right Arrow</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Superlike</span>
              <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>↑ Up Arrow</kbd>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Open Info</span>
              <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>I Key</kbd>
            </div>
          </div>
        </div>
      </aside>

      {/* Center Stage: The Swipe Arena */}
      <main className="discover-center-stage">
        {feed.length === 0 ? (
          <EmptyState
            onReset={onReset}
            onViewMatches={onViewMatches}
            matchCount={matchCount}
          />
        ) : (
          <>
            {/* Card Deck Stack */}
            <div className="card-stack-container">
              {deepStackedProfile && (
                <SwipeCard
                  key={deepStackedProfile.id}
                  profile={deepStackedProfile}
                  isTop={false}
                  isStacked={true}
                  onSwipe={() => {}}
                  onShowInfo={() => {}}
                />
              )}

              {stackedProfile && (
                <SwipeCard
                  key={stackedProfile.id}
                  profile={stackedProfile}
                  isTop={false}
                  isStacked={true}
                  onSwipe={() => {}}
                  onShowInfo={() => {}}
                />
              )}

              {topProfile && (
                <SwipeCard
                  key={topProfile.id}
                  profile={topProfile}
                  isTop={true}
                  isStacked={false}
                  triggerAction={triggerAction}
                  onSwipe={handleCardSwipeComplete}
                  onShowInfo={(p) => setSelectedProfileForInfo(p)}
                />
              )}
            </div>

            {/* Desktop Shortcuts Hint Bar */}
            <div className="desktop-shortcuts-bar">
              <span className="shortcut-pill"><kbd>←</kbd> Pass</span>
              <span className="shortcut-pill"><kbd>↑</kbd> Super</span>
              <span className="shortcut-pill"><kbd>→</kbd> Like</span>
              <span className="shortcut-pill"><kbd>I</kbd> Info</span>
            </div>

            {/* Action Buttons Bar */}
            <div className="action-bar">
              <button
                className="action-btn btn-pass"
                onClick={() => handleButtonAction('pass')}
                title="Pass (Swipe Left / ←)"
                disabled={!topProfile || triggerAction !== null}
              >
                <X size={28} strokeWidth={2.5} />
              </button>

              <button
                className="action-btn btn-super"
                onClick={() => handleButtonAction('super')}
                title="Superlike (Swipe Up / ↑)"
                disabled={!topProfile || triggerAction !== null}
              >
                <Star size={22} fill="currentColor" />
              </button>

              <button
                className="action-btn btn-like"
                onClick={() => handleButtonAction('like')}
                title="Like (Swipe Right / →)"
                disabled={!topProfile || triggerAction !== null}
              >
                <Heart size={34} fill="currentColor" />
              </button>

              <button
                className="action-btn btn-info"
                onClick={() => {
                  if (topProfile) setSelectedProfileForInfo(topProfile);
                }}
                title="Profile Details (I)"
                disabled={!topProfile}
              >
                <Info size={20} />
              </button>
            </div>
          </>
        )}
      </main>

      {/* Info Modal Drawer */}
      {selectedProfileForInfo && (
        <InfoDrawer
          profile={selectedProfileForInfo}
          onClose={() => setSelectedProfileForInfo(null)}
        />
      )}
    </div>
  );
}
