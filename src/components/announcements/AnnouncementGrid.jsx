import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

export function AnnouncementGrid({ isAdmin = false }) {
  const { announcements, addAnnouncement, editAnnouncement, deleteAnnouncement } = useApp();

  const [activeAnnouncement, setActiveAnnouncement] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Form states for create / edit
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [snippet, setSnippet] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState('/images/campus-hero.jpg');

  const categories = ['IT', 'Facilities', 'Policy', 'Welfare', 'Academic', 'General'];

  const openCreateModal = () => {
    setTitle('');
    setCategory('General');
    setSnippet('');
    setBody('');
    setImage('/images/campus-hero.jpg');
    setIsCreateModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingAnnouncement(item);
    setTitle(item.title);
    setCategory(item.category);
    setSnippet(item.snippet);
    setBody(item.body || item.snippet);
    setImage(item.image);
  };

  const handleSaveAnnouncement = (e) => {
    e.preventDefault();
    if (editingAnnouncement) {
      editAnnouncement(editingAnnouncement.id, {
        title,
        category,
        snippet,
        body,
        image
      });
      setEditingAnnouncement(null);
    } else {
      addAnnouncement({
        title,
        category,
        snippet,
        body,
        image
      });
      setIsCreateModalOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      deleteAnnouncement(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

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

      {/* Grid of Announcement Cards */}
      <div className="announcement-grid">
        {announcements.map((item) => (
          <div key={item.id} className="announcement-card">
            <div className="announcement-thumbnail-wrapper">
              <img
                src={item.image}
                alt={item.title}
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
                <span>{item.date}</span>
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
                    onClick={() => setDeleteTargetId(item.id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Read Detail Modal */}
      <Modal
        isOpen={Boolean(activeAnnouncement)}
        onClose={() => setActiveAnnouncement(null)}
        title={activeAnnouncement?.title || 'Announcement'}
      >
        {activeAnnouncement && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="badge-pill">{activeAnnouncement.category}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{activeAnnouncement.date}</span>
            </div>
            <img
              src={activeAnnouncement.image}
              alt=""
              style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '6px', marginBottom: '16px' }}
            />
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
              {activeAnnouncement.body || activeAnnouncement.snippet}
            </p>
          </div>
        )}
      </Modal>

      {/* Admin Create / Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen || Boolean(editingAnnouncement)}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingAnnouncement(null);
        }}
        title={editingAnnouncement ? 'Edit Announcement' : 'New Campus Announcement'}
      >
        <form onSubmit={handleSaveAnnouncement}>
          <div className="form-group">
            <label className="form-label" htmlFor="ann-title">Title *</label>
            <input
              id="ann-title"
              type="text"
              className="form-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Campus Wi-Fi upgrade scheduled for August 5"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ann-category">Category *</label>
            <select
              id="ann-category"
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(c => (
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
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              placeholder="Brief overview shown on card..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ann-body">Full Article Text *</label>
            <textarea
              id="ann-body"
              rows={4}
              className="form-textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Full announcement instructions and details..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="ann-image">Thumbnail Image Preset</label>
            <select
              id="ann-image"
              className="form-select"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            >
              <option value="/images/wifi.jpg">Wi-Fi Equipment</option>
              <option value="/images/policy.jpg">Policy Documents</option>
              <option value="/images/cafeteria.jpg">Campus Cafeteria</option>
              <option value="/images/students.jpg">Students Group</option>
              <option value="/images/campus-hero.jpg">Campus Building</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingAnnouncement(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingAnnouncement ? 'Save Changes' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Delete Confirmation Dialog */}
      <Modal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        title="Confirm Deletion"
        maxWidth="420px"
      >
        <div>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '20px' }}>
            Are you sure you want to delete this announcement? This action will remove it for all students and faculty.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setDeleteTargetId(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleConfirmDelete}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AnnouncementGrid;
