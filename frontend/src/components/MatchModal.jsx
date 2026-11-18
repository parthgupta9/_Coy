import React, { useEffect, useRef } from 'react';
import { Heart, MessageSquare, Compass } from 'lucide-react';

export default function MatchModal({ matchProfile, user, onSendMessage, onKeepSwiping }) {
  const canvasRef = useRef(null);

  // Confetti celebration animation using HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    const colors = ['#FE3C72', '#FF655B', '#FFA07A', '#FFD700', '#38BDF8', '#A78BFA', '#34D399'];
    const particles = Array.from({ length: 75 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: (Math.random() - 0.5) * 3,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!matchProfile) return null;

  const userAvatar = user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80";

  return (
    <div className="match-modal-overlay">
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Header */}
      <div className="match-header" style={{ zIndex: 10 }}>
        <span className="match-coy-tag">Coy Discovery</span>
        <h1 className="match-title">It's a Match!</h1>
        <p className="match-subtitle">
          You and <strong style={{ color: '#FFF' }}>{matchProfile.name}</strong> liked each other.
        </p>
      </div>

      {/* Intersecting Avatars */}
      <div className="match-avatars-wrap" style={{ zIndex: 10 }}>
        <div className="match-avatar-circle avatar-left">
          <img src={userAvatar} alt="You" />
        </div>

        <div className="match-heart-badge">
          <Heart size={24} fill="#FFF" color="#FFF" />
        </div>

        <div className="match-avatar-circle avatar-right">
          <img src={matchProfile.photo} alt={matchProfile.name} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="match-actions-group" style={{ zIndex: 10 }}>
        <button
          className="btn-send-message"
          onClick={() => onSendMessage(matchProfile)}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <MessageSquare size={20} />
            <span>Say Hello to {matchProfile.name}</span>
          </div>
        </button>

        <button
          className="btn-keep-swiping"
          onClick={onKeepSwiping}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Compass size={18} />
            <span>Keep Swiping</span>
          </div>
        </button>
      </div>
    </div>
  );
}
