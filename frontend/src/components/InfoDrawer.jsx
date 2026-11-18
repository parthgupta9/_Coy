import React from 'react';
import { X, GraduationCap, Briefcase, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';

export default function InfoDrawer({ profile, onClose }) {
  if (!profile) return null;

  return (
    <div className="info-drawer-overlay" onClick={onClose}>
      <div className="info-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-drag-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '26px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{profile.name}, {profile.age}</span>
              <CheckCircle2 size={20} fill="#38BDF8" color="#0D0E15" />
            </div>
            {profile.city_or_college && (
              <div style={{ fontSize: '14px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <GraduationCap size={16} />
                <span>{profile.city_or_college}</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFF',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {profile.job && (
          <div style={{ fontSize: '14px', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={16} />
            <span>{profile.job}</span>
            {profile.distance && <span>• {profile.distance}</span>}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '14px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
            About Me
          </div>
          <p style={{ fontSize: '15px', lineHeight: '1.5', color: '#F1F5F9' }}>
            {profile.bio}
          </p>
        </div>

        {profile.interests && profile.interests.length > 0 && (
          <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '14px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Passions & Interests
            </div>
            <div className="interests-wrap">
              {profile.interests.map((tag, idx) => (
                <span key={idx} className="interest-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
