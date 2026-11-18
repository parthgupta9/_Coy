import React from 'react';
import { Compass, RotateCcw, MessageCircleHeart } from 'lucide-react';

export default function EmptyState({ onReset, onViewMatches, matchCount }) {
  return (
    <div className="empty-state">
      <div className="empty-radar-wrap">
        <div className="radar-pulse" />
        <div className="radar-pulse-2" />
        <div className="empty-avatar-center">
          <Compass size={32} color="#FE3C72" />
        </div>
      </div>

      <h2 className="empty-title">You're All Caught Up!</h2>
      <p className="empty-desc">
        There are no more new profiles in your area right now. Check back soon for new connections.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '280px', marginTop: '10px' }}>
        {matchCount > 0 && (
          <button className="btn-primary" onClick={onViewMatches} style={{ justifyContent: 'center' }}>
            <MessageCircleHeart size={18} />
            <span>View {matchCount} {matchCount === 1 ? 'Match' : 'Matches'}</span>
          </button>
        )}

        <button
          onClick={onReset}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#E2E8F0',
            padding: '12px 20px',
            borderRadius: '24px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <RotateCcw size={16} />
          <span>Reset Demo Deck (35 Profiles)</span>
        </button>
      </div>
    </div>
  );
}
