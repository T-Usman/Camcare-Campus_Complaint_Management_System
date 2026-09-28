import React from 'react';

/**
 * UrgencyDot
 * Strictly adheres to design system:
 * - Low: light gray dot
 * - Medium: medium gray dot
 * - High: solid indigo dot rgb(79, 70, 229)
 * - Critical: solid indigo dot with thin indigo ring around it
 * - Text label is strictly neutral (never colored or tinted).
 */
export function UrgencyDot({ urgency, showLabel = true, className = '' }) {
  const norm = (urgency || '').toLowerCase().trim();

  let dotClass = 'dot-medium';
  if (norm === 'low') {
    dotClass = 'dot-low';
  } else if (norm === 'medium') {
    dotClass = 'dot-medium';
  } else if (norm === 'high') {
    dotClass = 'dot-high';
  } else if (norm === 'critical') {
    dotClass = 'dot-critical';
  }

  return (
    <span className={`urgency-badge ${className}`}>
      <span className={`dot ${dotClass}`} aria-hidden="true" />
      {showLabel && <span>{urgency}</span>}
    </span>
  );
}

export default UrgencyDot;
