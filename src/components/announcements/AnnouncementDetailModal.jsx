import React from 'react';
import { Modal } from '../common/Modal';
import { formatAnnouncementDate } from './announcementUtils';

export function AnnouncementDetailModal({ announcement, onClose }) {
  return (
    <Modal
      isOpen={Boolean(announcement)}
      onClose={onClose}
      title={announcement?.title || 'Announcement'}
    >
      {announcement && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="badge-pill">{announcement.category}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {formatAnnouncementDate(announcement.date)}
            </span>
          </div>
          {announcement.image && (
            <img
              src={announcement.image}
              alt=""
              style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '6px', marginBottom: '16px', backgroundColor: 'var(--bg-card-subtle)' }}
            />
          )}
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {announcement.body || announcement.snippet}
          </p>
        </div>
      )}
    </Modal>
  );
}

export default AnnouncementDetailModal;
