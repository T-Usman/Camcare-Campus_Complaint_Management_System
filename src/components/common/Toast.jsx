import React from 'react';
import { useApp } from '../../context/AppContext';

export function Toast() {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-primary)',
        border: '1px solid var(--color-primary)',
        borderRadius: '6px',
        padding: '12px 18px',
        fontSize: '13px',
        fontWeight: 500,
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: 'none'
      }}
      role="status"
      aria-live="polite"
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)'
        }}
      />
      <span>{toastMessage}</span>
    </div>
  );
}

export default Toast;
