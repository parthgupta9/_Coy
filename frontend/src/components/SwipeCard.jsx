import React, { useState, useRef, useEffect } from 'react';
import { MapPin, GraduationCap, Briefcase, CheckCircle2, Info } from 'lucide-react';

export default function SwipeCard({
  profile,
  isTop,
  isStacked,
  onSwipe,
  onShowInfo,
  triggerAction // 'like' | 'pass' | 'super' triggered from parent buttons
}) {
  const cardRef = useRef(null);
  const [dragState, setDragState] = useState({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startTime: 0
  });

  const [flyOutDirection, setFlyOutDirection] = useState(null);
  const [imgError, setImgError] = useState(false);

  // Handle external button trigger (e.g. Pass or Like button clicked)
  useEffect(() => {
    if (triggerAction && isTop && !flyOutDirection) {
      handleFlyOut(triggerAction);
    }
  }, [triggerAction, isTop]);

  const handleFlyOut = (action) => {
    setFlyOutDirection(action);
    setTimeout(() => {
      onSwipe(action, profile);
    }, 280);
  };

  // Pointer gesture handlers
  const handlePointerDown = (e) => {
    if (!isTop || flyOutDirection) return;
    
    // Ignore clicks on info button
    if (e.target.closest('.card-info-btn') || e.target.closest('.interest-tag')) {
      return;
    }

    try {
      e.target.setPointerCapture(e.pointerId);
    } catch (_) {}

    setDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      currentX: 0,
      currentY: 0,
      startTime: Date.now()
    });
  };

  const handlePointerMove = (e) => {
    if (!dragState.isDragging || !isTop || flyOutDirection) return;

    const currentX = e.clientX - dragState.startX;
    const currentY = e.clientY - dragState.startY;

    setDragState(prev => ({
      ...prev,
      currentX,
      currentY
    }));
  };

  const handlePointerUp = (e) => {
    if (!dragState.isDragging || !isTop || flyOutDirection) return;

    const { currentX, currentY, startTime } = dragState;
    const duration = Date.now() - startTime;
    const velocityX = Math.abs(currentX) / Math.max(duration, 1);

    const SWIPE_THRESHOLD = 95;
    const VELOCITY_THRESHOLD = 0.45;

    if (currentX > SWIPE_THRESHOLD || (currentX > 40 && velocityX > VELOCITY_THRESHOLD)) {
      handleFlyOut('like');
    } else if (currentX < -SWIPE_THRESHOLD || (currentX < -40 && velocityX > VELOCITY_THRESHOLD)) {
      handleFlyOut('pass');
    } else if (currentY < -120) {
      handleFlyOut('super');
    } else {
      // Spring back to center
      setDragState({
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        startTime: 0
      });
    }

    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerCancel = (e) => {
    if (dragState.isDragging) {
      setDragState({
        isDragging: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        startTime: 0
      });
    }
  };

  // Calculate dynamic transform & rotation
  let transformStyle = '';
  let transitionStyle = 'none';
  const { currentX, currentY, isDragging } = dragState;

  if (flyOutDirection === 'like') {
    transformStyle = 'translate3d(1200px, 60px, 0) rotate(35deg)';
    transitionStyle = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.25s ease';
  } else if (flyOutDirection === 'pass') {
    transformStyle = 'translate3d(-1200px, 60px, 0) rotate(-35deg)';
    transitionStyle = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.25s ease';
  } else if (flyOutDirection === 'super') {
    transformStyle = 'translate3d(0, -1200px, 0) rotate(0deg)';
    transitionStyle = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.25s ease';
  } else if (isDragging) {
    const rotation = currentX * 0.08;
    transformStyle = `translate3d(${currentX}px, ${currentY}px, 0) rotate(${rotation}deg)`;
  } else {
    transitionStyle = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.15)';
  }

  // Stamp opacities
  const likeOpacity = flyOutDirection === 'like' ? 1 : Math.min(Math.max(currentX / 70, 0), 1);
  const nopeOpacity = flyOutDirection === 'pass' ? 1 : Math.min(Math.max(-currentX / 70, 0), 1);
  const superOpacity = flyOutDirection === 'super' ? 1 : Math.min(Math.max(-currentY / 90, 0), 1);

  // Avatar placeholder if image fails to load
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=FE3C72&color=fff&size=512`;

  return (
    <div
      ref={cardRef}
      className={`swipe-card ${isTop ? 'active' : ''} ${isStacked ? 'stacked' : ''}`}
      style={{
        transform: isTop ? transformStyle : undefined,
        transition: isTop ? transitionStyle : undefined,
        opacity: flyOutDirection ? 0 : 1
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {/* Stamp Badges */}
      {isTop && (
        <>
          <div
            className="stamp-badge stamp-like"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </div>
          <div
            className="stamp-badge stamp-nope"
            style={{ opacity: nopeOpacity }}
          >
            NOPE
          </div>
          {superOpacity > 0.1 && (
            <div
              className="stamp-badge stamp-super"
              style={{ opacity: superOpacity }}
            >
              SUPER LIKE
            </div>
          )}
        </>
      )}

      {/* Media & Overlay */}
      <div className="card-media">
        <img
          src={imgError ? fallbackAvatar : profile.photo}
          alt={profile.name}
          className="card-img"
          loading="eager"
          onError={() => setImgError(true)}
        />
        <div className="card-overlay" />
      </div>

      {/* Card Info */}
      <div className="card-info">
        <div className="card-title-row">
          <div className="card-name-age">
            <span>{profile.name}</span>
            <span className="card-age">{profile.age}</span>
            <CheckCircle2 size={20} className="verified-icon" fill="#38BDF8" color="#0D0E15" />
          </div>

          <button
            className="card-info-btn"
            onClick={(e) => {
              e.stopPropagation();
              onShowInfo(profile);
            }}
            title="View details"
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
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
            <Info size={18} />
          </button>
        </div>

        {profile.city_or_college && (
          <div className="card-college">
            <GraduationCap size={16} />
            <span>{profile.city_or_college}</span>
          </div>
        )}

        {profile.job && (
          <div className="card-job">
            <Briefcase size={14} />
            <span>{profile.job}</span>
            {profile.distance && <span>• {profile.distance}</span>}
          </div>
        )}

        <p className="card-bio">{profile.bio}</p>

        {/* Interests */}
        {profile.interests && profile.interests.length > 0 && (
          <div className="interests-wrap">
            {profile.interests.slice(0, 4).map((interest, idx) => (
              <span key={idx} className="interest-tag">
                {interest}
              </span>
            ))}
            {profile.interests.length > 4 && (
              <span className="interest-tag">+{profile.interests.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
