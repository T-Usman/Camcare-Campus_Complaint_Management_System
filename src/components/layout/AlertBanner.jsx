import React from 'react';
import { useApp } from '../../context/AppContext';

export function AlertBanner({ count = 2 }) {
  const { navigateWithFilter, userRole } = useApp();

  const handleViewEscalated = () => {
    const targetPage = { admin: 'admin-complaints', staff: 'staff-complaints' }[userRole] || 'student-complaints';
    navigateWithFilter(targetPage, 'High Priority');
  };

  return (
    <div
      className="alert-banner"
      role="alert"
      onClick={handleViewEscalated}
      style={{ cursor: 'pointer' }}
    >
      <span className="alert-dot" aria-hidden="true" />
      <div style={{ flex: 1 }}>
        <span style={{ fontWeight: 600 }}>{count} complaints escalated to High Priority</span>
        <span> — no activity for more than 3 days.</span>
      </div>
      <button
        type="button"
        className="btn-text"
        onClick={(e) => {
          e.stopPropagation();
          handleViewEscalated();
        }}
        style={{ fontSize: '13px', textDecoration: 'underline' }}
      >
        Review escalated ›
      </button>
    </div>
  );
}

export default AlertBanner;
