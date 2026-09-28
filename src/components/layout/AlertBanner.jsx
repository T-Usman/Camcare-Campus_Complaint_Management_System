import React from 'react';
import { useApp } from '../../context/AppContext';

export function AlertBanner({ count = 2 }) {
  const { navigateWithFilter, userRole } = useApp();

  const handleViewEscalated = () => {
    const targetPage = userRole === 'admin' ? 'admin-complaints' : 'student-complaints';
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
        <span> — unanswered for more than 3 days.</span>
      </div>
      <button
        type="button"
        className="btn-text"
        onClick={(e) => {
          e.stopPropagation();
          handleViewEscalated();
        }}
        style={{ fontSize: '12.5px', textDecoration: 'underline' }}
      >
        Review escalated ›
      </button>
    </div>
  );
}

export default AlertBanner;
