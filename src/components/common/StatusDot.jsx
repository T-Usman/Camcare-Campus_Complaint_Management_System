import React from 'react';

/**
 * StatusDot
 * Strictly adheres to design system:
 * - Resolved: light gray dot
 * - Pending: medium gray dot
 * - In Progress: solid indigo dot rgb(79, 70, 229)
 * - High Priority: solid indigo dot with thin indigo ring around it
 * - Text label is strictly neutral (never colored or tinted).
 */
export function StatusDot({ status, showLabel = true, className = '' }) {
  const norm = (status || '').toLowerCase().trim();

  let dotClass = 'dot-pending';
  if (norm === 'resolved') {
    dotClass = 'dot-resolved';
  } else if (norm === 'pending') {
    dotClass = 'dot-pending';
  } else if (norm === 'in progress') {
    dotClass = 'dot-inprogress';
  } else if (norm === 'high priority') {
    dotClass = 'dot-highpriority';
  }

  return (
    <span className={`status-badge ${className}`}>
      <span className={`dot ${dotClass}`} aria-hidden="true" />
      {showLabel && <span>{status}</span>}
    </span>
  );
}

export default StatusDot;
