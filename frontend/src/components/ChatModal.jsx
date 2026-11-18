import React, { useState, useEffect, useRef } from 'react';
import { X, Send, GraduationCap, MapPin } from 'lucide-react';

export default function ChatModal({ profile, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  // Generate initial icebreaker message based on profile bio
  useEffect(() => {
    if (profile) {
      const icebreaker = profile.interests && profile.interests.length > 0
        ? `Hey! Saw you're into ${profile.interests[0]} too 😊`
        : `Hey! Love your bio about ${profile.city_or_college || 'traveling'}!`;

      setMessages([
        {
          id: 1,
          sender: 'them',
          text: `You matched with ${profile.name}! Say hi.`,
          isSystem: true
        },
        {
          id: 2,
          sender: 'them',
          text: icebreaker,
          time: 'Just now'
        }
      ]);
    }
  }, [profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'me',
      text: inputText.trim(),
      time: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Simulated friendly reply after 1.2s
    setTimeout(() => {
      const replies = [
        `Haha definitely! What coffee spot would you recommend around here? ☕`,
        `Totally agree! So glad we matched on Coy ✨`,
        `That's awesome! What got you interested in that?`,
        `Haha no way! We should definitely hang out soon 🙌`
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'them',
          text: randomReply,
          time: 'Just now'
        }
      ]);
    }, 1200);
  };

  if (!profile) return null;

  return (
    <div className="chat-drawer-overlay" onClick={onClose}>
      <div className="chat-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-user">
            <img src={profile.photo} alt={profile.name} className="chat-header-avatar" />
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>
                {profile.name}, {profile.age}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <GraduationCap size={12} />
                <span>{profile.city_or_college}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
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

        {/* Messages Body */}
        <div className="chat-messages-body">
          {messages.map((m) => {
            if (m.isSystem) {
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: 'center',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    margin: '6px 0'
                  }}
                >
                  {m.text}
                </div>
              );
            }
            return (
              <div
                key={m.id}
                className={`chat-bubble ${m.sender === 'me' ? 'bubble-sent' : 'bubble-received'}`}
              >
                <div>{m.text}</div>
                {m.time && (
                  <div
                    style={{
                      fontSize: '10px',
                      opacity: 0.6,
                      marginTop: '4px',
                      textAlign: m.sender === 'me' ? 'right' : 'left'
                    }}
                  >
                    {m.time}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form className="chat-input-bar" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-input"
            placeholder={`Message ${profile.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            autoFocus
          />
          <button type="submit" className="chat-send-btn" disabled={!inputText.trim()}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
