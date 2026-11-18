import React, { useState } from 'react';
import { X, Heart, Star, RotateCcw, Info, Loader2 } from 'lucide-react';
import SwipeCard from './SwipeCard';
import EmptyState from './EmptyState';
import InfoDrawer from './InfoDrawer';

export default function DiscoverTab({
  feed,
  isLoading,
  onSwipe,
  onReset,
  matchCount,
  onViewMatches
}) {
  const [triggerAction, setTriggerAction] = useState(null);
  const [selectedProfileForInfo, setSelectedProfileForInfo] = useState(null);
  const [actionFeedbackToast, setActionFeedbackToast] = useState(null);

  const showToast = (text) => {
    setActionFeedbackToast(text);
    setTimeout(() => {
      setActionFeedbackToast(null);
    }, 1500);
  };

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
          gap: '12px'
        }}
      >
        <Loader2 size={36} color="var(--coy-brand)" className="spin" />
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Finding people near you...
        </span>
      </div>
    );
  }

  if (!feed || feed.length === 0) {
    return (
      <EmptyState
        onReset={onReset}
        onViewMatches={onViewMatches}
        matchCount={matchCount}
      />
    );
  }

  const topProfile = feed[0];
  const stackedProfile = feed.length > 1 ? feed[1] : null;
  const deepStackedProfile = feed.length > 2 ? feed[2] : null;

  return (
    <div className="discover-view">
      {/* Toast feedback */}
      {actionFeedbackToast && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(22, 24, 36, 0.95)',
            border: '1px solid var(--surface-border)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#FFF',
            zIndex: 50,
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
          }}
        >
          {actionFeedbackToast}
        </div>
      )}

      {/* Card Deck Stack */}
      <div className="card-stack-container">
        {/* Deep Stack Card (Shadow 3) */}
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

        {/* Stacked Preview Card (Underneath 2) */}
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

        {/* Top Active Card (Draggable 1) */}
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

      {/* Desktop Keyboard Shortcuts Hint */}
      <div className="desktop-shortcuts-bar">
        <span className="shortcut-pill"><kbd>←</kbd> Pass</span>
        <span className="shortcut-pill"><kbd>↑</kbd> Super</span>
        <span className="shortcut-pill"><kbd>→</kbd> Like</span>
        <span className="shortcut-pill"><kbd>I</kbd> Info</span>
      </div>

      {/* Action Buttons Bar */}
      <div className="action-bar">
        {/* Pass Button */}
        <button
          className="action-btn btn-pass"
          onClick={() => handleButtonAction('pass')}
          title="Pass (Swipe Left)"
          disabled={!topProfile || triggerAction !== null}
        >
          <X size={28} strokeWidth={2.5} />
        </button>

        {/* Superlike Button */}
        <button
          className="action-btn btn-super"
          onClick={() => handleButtonAction('super')}
          title="Superlike (Swipe Up)"
          disabled={!topProfile || triggerAction !== null}
        >
          <Star size={22} fill="currentColor" />
        </button>

        {/* Like Button */}
        <button
          className="action-btn btn-like"
          onClick={() => handleButtonAction('like')}
          title="Like (Swipe Right)"
          disabled={!topProfile || triggerAction !== null}
        >
          <Heart size={34} fill="currentColor" />
        </button>

        {/* Info Button */}
        <button
          className="action-btn btn-info"
          onClick={() => {
            if (topProfile) setSelectedProfileForInfo(topProfile);
          }}
          title="Profile Details"
          disabled={!topProfile}
        >
          <Info size={20} />
        </button>
      </div>

      {/* Info Drawer Modal */}
      {selectedProfileForInfo && (
        <InfoDrawer
          profile={selectedProfileForInfo}
          onClose={() => setSelectedProfileForInfo(null)}
        />
      )}
    </div>
  );
}
