import React, { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children, maxWidth = '560px' }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content" style={{ maxWidth }}>
        <div className="modal-header">
          <h2 id="modal-title" className="heading-serif" style={{ fontSize: '20px', margin: 0 }}>
            {title}
          </h2>
          <button
            type="button"
            className="btn-text"
            onClick={onClose}
            aria-label="Close dialog"
            style={{ fontSize: '13px', padding: '4px 8px' }}
          >
            Close
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
