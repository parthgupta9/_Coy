import React, { useState } from 'react';
import { HeartHandshake, Compass, GraduationCap, ChevronRight, MessageSquare } from 'lucide-react';
import ChatModal from './ChatModal';

export default function MatchesTab({ matches, onGoToDiscover }) {
  const [activeChatProfile, setActiveChatProfile] = useState(null);

  const formatMatchTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="matches-view">
      {matches.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px 20px',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(254, 60, 114, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--coy-brand)'
            }}
          >
            <HeartHandshake size={36} />
          </div>

          <div style={{ maxWidth: '280px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
              No Mutual Matches Yet
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              When someone you swipe right on has also liked you, they'll appear here. Coy never reveals one-sided likes!
            </p>
          </div>

          <button className="btn-primary" onClick={onGoToDiscover}>
            <Compass size={18} />
            <span>Discover Profiles</span>
          </button>
        </div>
      ) : (
        <>
          {/* New Matches Row */}
          <div>
            <div className="matches-section-title" style={{ marginBottom: '12px' }}>
              New Matches ({matches.length})
            </div>
            <div className="new-matches-row">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="new-match-avatar-card"
                  onClick={() => setActiveChatProfile(m)}
                >
                  <div className="new-match-avatar-ring">
                    <img src={m.photo} alt={m.name} className="new-match-avatar-img" />
                  </div>
                  <span className="new-match-name">{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Messages & Match list */}
          <div>
            <div className="matches-section-title" style={{ marginBottom: '12px' }}>
              Messages
            </div>
            <div className="matches-list">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="match-list-item"
                  onClick={() => setActiveChatProfile(m)}
                >
                  <img src={m.photo} alt={m.name} className="match-list-avatar" />

                  <div className="match-list-info">
                    <div className="match-list-name-row">
                      <span className="match-list-name">
                        {m.name}, {m.age}
                      </span>
                      <span className="match-list-time">
                        {formatMatchTime(m.matched_at)}
                      </span>
                    </div>

                    <div className="match-list-sub">
                      {m.city_or_college}
                    </div>

                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--coy-brand)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '2px'
                      }}
                    >
                      <MessageSquare size={12} />
                      <span>Matched! Tap to chat</span>
                    </div>
                  </div>

                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Chat Drawer Modal */}
      {activeChatProfile && (
        <ChatModal
          profile={activeChatProfile}
          onClose={() => setActiveChatProfile(null)}
        />
      )}
    </div>
  );
}
