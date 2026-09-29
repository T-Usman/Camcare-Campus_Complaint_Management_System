import React from 'react';

/**
 * StatusDot
 * Strictly adheres to design system:
 * - Pending: medium gray dot
 * - Verified: medium gray ring (hollow)
 * - Assigned: indigo ring (hollow)
 * - In Progress: solid indigo dot rgb(79, 70, 229)
 * - High Priority: solid indigo dot with thin indigo ring around it
 * - Resolved: light gray dot
 * - Rejected: light gray ring (hollow)
 * - Text label is strictly neutral (never colored or tinted).
 */
const DOT_CLASS_BY_STATUS = {
  pending: 'dot-pending',
  verified: 'dot-verified',
  assigned: 'dot-assigned',
  'in progress': 'dot-inprogress',
  'high priority': 'dot-highpriority',
  resolved: 'dot-resolved',
  rejected: 'dot-rejected'
};

export function StatusDot({ status, showLabel = true, className = '' }) {
  const norm = (status || '').toLowerCase().trim();
  const dotClass = DOT_CLASS_BY_STATUS[norm] || 'dot-pending';

  return (
    <span className={`status-badge ${className}`}>
      <span className={`dot ${dotClass}`} aria-hidden="true" />
      {showLabel && <span>{status}</span>}
    </span>
  );
}

export default StatusDot;
