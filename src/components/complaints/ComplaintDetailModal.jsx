import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { StatusDot } from '../common/StatusDot';
import { UrgencyDot } from '../common/UrgencyDot';

export function ComplaintDetailModal({ complaint, isOpen, onClose }) {
  const { userRole, staff, updateComplaint } = useApp();

  const [selectedStaff, setSelectedStaff] = useState(complaint?.assignedTo || 'Unassigned');
  const [selectedStatus, setSelectedStatus] = useState(complaint?.status || 'Pending');
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    if (complaint) {
      setSelectedStaff(complaint.assignedTo || 'Unassigned');
      setSelectedStatus(complaint.status || 'Pending');
      setAdminNote('');
    }
  }, [complaint]);

  if (!complaint) return null;

  const isAdmin = userRole === 'admin';

  const handleSaveAdminChanges = (e) => {
    e.preventDefault();
    updateComplaint(complaint.id, {
      assignedTo: selectedStaff,
      status: selectedStatus,
      note: adminNote || `Updated by Administrator`
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Complaint ${complaint.id}`} maxWidth="620px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title & Category Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-pill">{complaint.category}</span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Reported {complaint.date} ({complaint.agingDays}d ago)
            </span>
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {complaint.title}
          </h3>
        </div>

        {/* Status & Urgency Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            backgroundColor: 'var(--bg-page)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '12px 16px'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Status
            </div>
            <StatusDot status={complaint.status} />
          </div>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
              Urgency
            </div>
            <UrgencyDot urgency={complaint.urgency} />
          </div>
        </div>

        {/* Location & Reported By */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontSize: '13px'
          }}
        >
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11.5px' }}>Location</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{complaint.location}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11.5px' }}>Reported By</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {complaint.student} ({complaint.studentId})
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11.5px', marginBottom: '4px' }}>
            Description
          </span>
          <p
            style={{
              backgroundColor: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '12px',
              fontSize: '13px',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              margin: 0
            }}
          >
            {complaint.description}
          </p>
        </div>

        {/* Attached Photo Evidence */}
        {complaint.photo && (
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11.5px', marginBottom: '6px' }}>
              Attached Photo Evidence
            </span>
            <div
              style={{
                backgroundColor: 'var(--bg-card-subtle)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '10px',
                display: 'inline-block',
                maxWidth: '100%'
              }}
            >
              <img
                src={complaint.photo}
                alt="Complaint photo evidence"
                style={{
                  maxWidth: '100%',
                  maxHeight: '260px',
                  borderRadius: '4px',
                  display: 'block',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        )}

        {/* Progress Timeline */}
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11.5px', marginBottom: '8px' }}>
            Resolution Timeline
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(complaint.timeline || []).map((t, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  fontSize: '12px'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: index === (complaint.timeline.length - 1) ? 'rgb(79, 70, 229)' : 'var(--text-muted)',
                    marginTop: '5px',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.step}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{t.time}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{t.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Management Controls */}
        {isAdmin && (
          <form
            onSubmit={handleSaveAdminChanges}
            style={{
              marginTop: '10px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Admin Triage & Assignment
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="admin-assign-staff">Assign Staff Officer</label>
                <select
                  id="admin-assign-staff"
                  className="form-select"
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                >
                  <option value="Unassigned">Unassigned</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="admin-change-status">Update Status</label>
                <select
                  id="admin-change-status"
                  className="form-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="High Priority">High Priority</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="admin-note-input">Action / Resolution Note</label>
              <input
                id="admin-note-input"
                type="text"
                className="form-input"
                placeholder="e.g. Work order issued to Facilities maintenance team"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
              <button type="button" className="btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save & Update Ticket
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

export default ComplaintDetailModal;
