import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { AnnouncementDetailModal } from './AnnouncementDetailModal';
import {
  ANNOUNCEMENT_CATEGORIES,
  ANNOUNCEMENT_IMAGES,
  DEFAULT_ANNOUNCEMENT_IMAGE,
  formatAnnouncementDate
} from './announcementUtils';

const EMPTY_FORM = {
  title: '',
  category: 'General',
  snippet: '',
  body: '',
  image: DEFAULT_ANNOUNCEMENT_IMAGE
};

export function AnnouncementGrid({ isAdmin = false }) {
  const { announcements, refreshAnnouncements, addAnnouncement, editAnnouncement, deleteAnnouncement } = useApp();

  const [activeAnnouncement, setActiveAnnouncement] = useState(null);
  // null = form closed, 'new' = creating, otherwise the announcement being edited
  const [formTarget, setFormTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = formTarget !== null && formTarget !== 'new';

  // Pick up announcements posted since the app loaded
  useEffect(() => {
    refreshAnnouncements();
  }, [refreshAnnouncements]);

  const setField = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const openCreateModal = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setFormTarget('new');
  };

  const openEditModal = (item) => {
    setForm({
      title: item.title || '',
      category: item.category || 'General',
      snippet: item.snippet || '',
      body: item.body || item.snippet || '',
      image: item.image || DEFAULT_ANNOUNCEMENT_IMAGE
    });
    setFormError('');
    setFormTarget(item);
  };

  const closeFormModal = () => {
    if (!isSaving) setFormTarget(null);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    const payload = {
      title: form.title.trim(),
      category: form.category,
      snippet: form.snippet.trim(),
      body: form.body.trim(),
      image: form.image
    };
    if (!payload.title || !payload.snippet || !payload.body) {
      setFormError('Title, summary, and full text cannot be blank.');
      return;
    }

    setIsSaving(true);
    const saved = isEditing
      ? await editAnnouncement(formTarget.id, payload)
      : await addAnnouncement(payload);
    setIsSaving(false);

    if (saved) setFormTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isSaving) return;
    setIsSaving(true);
    const deleted = await deleteAnnouncement(deleteTarget.id);
    setIsSaving(false);
    if (deleted) setDeleteTarget(null);
  };

  const categoryOptions = ANNOUNCEMENT_CATEGORIES.includes(form.category)
    ? ANNOUNCEMENT_CATEGORIES
    : [...ANNOUNCEMENT_CATEGORIES, form.category];
  const imageOptions = ANNOUNCEMENT_IMAGES.some(o => o.value === form.image)
    ? ANNOUNCEMENT_IMAGES
    : [...ANNOUNCEMENT_IMAGES, { value: form.image, label: 'Current image' }];

  return (
    <div>
      {/* Admin Top Action */}
      {isAdmin && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button
            type="button"
            id="new-announcement-btn"
            className="btn-primary"
            onClick={openCreateModal}
          >
            + New Announcement
          </button>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No announcements yet
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {isAdmin
              ? 'Publish an announcement to share campus updates with students and staff.'
              : 'Campus updates from the administration office will appear here.'}
          </p>
        </div>
      ) : (
        <div className="announcement-grid">
          {announcements.map((item) => (
            <div key={item.id} className="announcement-card">
              <div className="announcement-thumbnail-wrapper">
                <img
                  src={item.image || DEFAULT_ANNOUNCEMENT_IMAGE}
                  alt=""
                  className="announcement-img"
                />
                <span className="announcement-category-tag">
                  {item.category}
                </span>
              </div>

              <div className="announcement-body">
                <h3 className="announcement-title">
                  {item.title}
                </h3>
                <p className="announcement-snippet">
                  {item.snippet}
                </p>

                <div className="announcement-footer">
                  <span>{formatAnnouncementDate(item.date)}</span>
                  <button
                    type="button"
                    className="btn-text"
                    onClick={() => setActiveAnnouncement(item)}
                    style={{ fontSize: '12px', fontWeight: 500 }}
                  >
                    Read more →
                  </button>
                </div>

                {/* Admin-only plain text Edit and Delete controls */}
                {isAdmin && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      gap: '10px',
                      marginTop: '10px',
                      paddingTop: '8px',
                      borderTop: '1px solid var(--border-color)'
                    }}
                  >
                    <button
                      type="button"
                      className="btn-text"
                      style={{ fontSize: '12px' }}
                      onClick={() => openEditModal(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-text btn-text-danger"
                      style={{ fontSize: '12px' }}
                      onClick={() => setDeleteTarget(item)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Read Detail Modal */}
      <AnnouncementDetailModal
        announcement={activeAnnouncement}
        onClose={() => setActiveAnnouncement(null)}
      />

      {/* Admin Create / Edit Modal */}
      <Modal
        isOpen={formTarget !== null}
        onClose={closeFormModal}
        title={isEditing ? 'Edit Announcement' : 'New Campus Announcement'}
      >
        <form onSubmit={handleSaveAnnouncement}>
          <div className="form-group">
            <label className="form-label" htmlFor="ann-title">Title *</label>
            <input
              id="ann-title"
              type="text"
              className="form-input"
              value={form.title}
              onChange={setField('title')}
              placeholder="e.g. Campus Wi-Fi upgrade scheduled for August 5"
              maxLength={255}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ann-category">Category *</label>
            <select
              id="ann-category"
              className="form-select"
              value={form.category}
              onChange={setField('category')}
            >
              {categoryOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ann-snippet">Summary / Snippet *</label>
            <textarea
              id="ann-snippet"
              rows={2}
              className="form-textarea"
              value={form.snippet}
              onChange={setField('snippet')}
              placeholder="Brief overview shown on card..."
              maxLength={1000}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ann-body">Full Article Text *</label>
            <textarea
              id="ann-body"
              rows={5}
              className="form-textarea"
              value={form.body}
              onChange={setField('body')}
              placeholder="Full announcement instructions and details..."
              maxLength={10000}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ann-image">Thumbnail Image</label>
            <select
              id="ann-image"
              className="form-select"
              value={form.image}
              onChange={setField('image')}
            >
              {imageOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <img
              src={form.image}
              alt=""
              style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '6px', marginTop: '10px', backgroundColor: 'var(--bg-card-subtle)' }}
            />
          </div>

          {formError && (
            <p role="alert" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {formError}
            </p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={closeFormModal}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving
                ? (isEditing ? 'Saving…' : 'Publishing…')
                : (isEditing ? 'Save Changes' : 'Publish Announcement')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Delete Confirmation Dialog */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => { if (!isSaving) setDeleteTarget(null); }}
        title="Delete Announcement"
        maxWidth="420px"
      >
        <div>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: 600, overflowWrap: 'anywhere' }}>
            {deleteTarget?.title}
          </p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            This announcement will be removed for all students and staff. This cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleConfirmDelete}
              disabled={isSaving}
            >
              {isSaving ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AnnouncementGrid;
