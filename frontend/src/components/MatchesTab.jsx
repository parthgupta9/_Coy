import React, { useState } from 'react';
import { HeartHandshake, Compass, GraduationCap, ChevronRight, MessageSquare, Send, Sparkles } from 'lucide-react';
import ChatModal from './ChatModal';

export default function MatchesTab({ matches, onGoToDiscover }) {
  const [selectedMatch, setSelectedMatch] = useState(matches.length > 0 ? matches[0] : null);
  const [messagesMap, setMessagesMap] = useState({});
  const [desktopInputText, setDesktopInputText] = useState('');

  // Helper for message list per profile
  const getProfileMessages = (profile) => {
    if (!profile) return [];
    if (messagesMap[profile.id]) return messagesMap[profile.id];

    const icebreaker = profile.interests && profile.interests.length > 0
      ? `Hey! Saw you're into ${profile.interests[0]} too 😊`
      : `Hey! Love your bio about ${profile.city_or_college || 'traveling'}!`;

    const initial = [
      { id: 1, sender: 'them', text: `You matched with ${profile.name}! Say hi.`, isSystem: true },
      { id: 2, sender: 'them', text: icebreaker, time: 'Just now' }
    ];
    return initial;
  };

  const handleSendDesktopMessage = (e) => {
    e.preventDefault();
    if (!desktopInputText.trim() || !selectedMatch) return;

    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: desktopInputText.trim(),
      time: 'Just now'
    };

    const currentList = getProfileMessages(selectedMatch);
    const updated = [...currentList, newMsg];

    setMessagesMap(prev => ({
      ...prev,
      [selectedMatch.id]: updated
    }));

    setDesktopInputText('');

    // Simulated reply
    setTimeout(() => {
      const replies = [
        `Haha definitely! What coffee spot would you recommend around here? ☕`,
        `Totally agree! So glad we matched on Coy ✨`,
        `That's awesome! What got you interested in that?`,
        `Haha no way! We should definitely hang out soon 🙌`
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      setMessagesMap(prev => ({
        ...prev,
        [selectedMatch.id]: [
          ...(prev[selectedMatch.id] || updated),
          { id: Date.now() + 1, sender: 'them', text: randomReply, time: 'Just now' }
        ]
      }));
    }, 1200);
  };

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

  if (matches.length === 0) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 20px',
          gap: '18px',
          width: '100%',
          height: '100%'
        }}
      >
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'rgba(254, 60, 114, 0.1)',
            border: '2px solid rgba(254, 60, 114, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--coy-brand)'
          }}
        >
          <HeartHandshake size={42} />
        </div>

        <div style={{ maxWidth: '340px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
            No Mutual Matches Yet
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            When someone you swipe right on has also liked you, they'll appear here. Coy never reveals one-sided likes!
          </p>
        </div>

        <button className="btn-primary" onClick={onGoToDiscover}>
          <Compass size={18} />
          <span>Discover Profiles</span>
        </button>
      </div>
    );
  }

  // Active chat profile
  const activeChat = selectedMatch || matches[0];
  const activeMessages = getProfileMessages(activeChat);

  return (
    <div className="web-matches-workspace">
      {/* Left Column: Matches Inbox */}
      <aside className="matches-inbox-column">
        <div className="inbox-header">
          <div className="inbox-title">
            <span>Matches & Conversations</span>
            <span style={{ fontSize: '12px', background: 'var(--surface-hover)', padding: '2px 8px', borderRadius: '10px' }}>
              {matches.length} Mutual
            </span>
          </div>

          {/* New Matches Row */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              New Connections
            </div>
            <div className="new-matches-row">
              {matches.map((m) => (
                <div
                  key={m.id}
                  className="new-match-avatar-card"
                  onClick={() => setSelectedMatch(m)}
                >
                  <div className="new-match-avatar-ring">
                    <img src={m.photo} alt={m.name} className="new-match-avatar-img" />
                  </div>
                  <span className="new-match-name">{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Conversation List */}
        <div className="inbox-scrollable">
          <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
            All Messages
          </div>
          <div className="conversation-list">
            {matches.map((m) => {
              const isActive = activeChat?.id === m.id;
              return (
                <div
                  key={m.id}
                  className={`conversation-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedMatch(m)}
                >
                  <img src={m.photo} alt={m.name} className="conversation-avatar" />
                  <div className="conversation-meta">
                    <div className="conversation-name-time">
                      <span className="conversation-name">{m.name}, {m.age}</span>
                      <span className="conversation-time">{formatMatchTime(m.matched_at)}</span>
                    </div>
                    <div className="conversation-last-msg">
                      {m.city_or_college}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Right Column: Full-Screen Chat Conversation Stage (Desktop Web) */}
      <main className="chat-conversation-stage">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="chat-stage-header">
              <div className="chat-stage-user">
                <img src={activeChat.photo} alt={activeChat.name} className="chat-stage-avatar" />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '800' }}>
                    {activeChat.name}, {activeChat.age}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <GraduationCap size={14} />
                    <span>{activeChat.city_or_college}</span>
                    {activeChat.job && <span>• {activeChat.job}</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="brand-domain">Mutual Match ✨</span>
              </div>
            </div>

            {/* Messages Body */}
            <div className="chat-stage-messages">
              {activeMessages.map((msg) => {
                if (msg.isSystem) {
                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: 'center',
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        padding: '6px 16px',
                        borderRadius: '16px',
                        margin: '10px 0'
                      }}
                    >
                      {msg.text}
                    </div>
                  );
                }
                return (
                  <div
                    key={msg.id}
                    className={`chat-bubble ${msg.sender === 'me' ? 'bubble-sent' : 'bubble-received'}`}
                  >
                    <div>{msg.text}</div>
                    {msg.time && (
                      <div
                        style={{
                          fontSize: '10px',
                          opacity: 0.6,
                          marginTop: '4px',
                          textAlign: msg.sender === 'me' ? 'right' : 'left'
                        }}
                      >
                        {msg.time}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form className="chat-stage-input-bar" onSubmit={handleSendDesktopMessage}>
              <input
                type="text"
                className="chat-stage-input"
                placeholder={`Type a message to ${activeChat.name}...`}
                value={desktopInputText}
                onChange={(e) => setDesktopInputText(e.target.value)}
              />
              <button
                type="submit"
                className="btn-primary"
                style={{ borderRadius: '24px', padding: '12px 20px' }}
                disabled={!desktopInputText.trim()}
              >
                <Send size={16} />
                <span>Send</span>
              </button>
            </form>
          </>
        ) : (
          <div className="chat-stage-empty">
            <MessageSquare size={48} color="var(--text-muted)" />
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Select a match to start chatting</h3>
          </div>
        )}
      </main>
    </div>
  );
}
