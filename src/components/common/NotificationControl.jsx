import React, { useState, useRef, useEffect } from 'react';

export function NotificationControl() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const dropdownRef = useRef(null);

  const notifications = [
    {
      id: 'notif-1',
      title: 'Complaint Escalation Alert',
      message: 'C-0039 has been escalated to High Priority (unanswered for >3 days).',
      time: '10m ago'
    },
    {
      id: 'notif-2',
      title: 'Campus Announcement',
      message: 'Campus Wi-Fi upgrade scheduled for August 5 from 11 PM to 3 AM.',
      time: '2h ago'
    }
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        id="notifications-control-btn"
        className="notification-pill"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        {unreadCount > 0 && <span className="notification-dot" aria-hidden="true" />}
        <span>Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '320px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: 'none',
            zIndex: 60,
            padding: '16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="btn-text"
                style={{ fontSize: '11px' }}
                onClick={() => setUnreadCount(0)}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notifications.map(n => (
              <div
                key={n.id}
                style={{
                  padding: '8px 10px',
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {n.title}
                  </span>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{n.time}</span>
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  {n.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationControl;
