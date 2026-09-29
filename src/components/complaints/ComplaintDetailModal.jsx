import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { StatusDot } from '../common/StatusDot';
import { UrgencyDot } from '../common/UrgencyDot';
import { getAllowedActions, isNoteRequired } from './complaintWorkflow';

const NOTE_REQUIRED_MESSAGES = {
  reject: 'Enter a reason before rejecting this complaint.',
  resolve: 'Describe how the issue was resolved.',
  note: 'Enter a note first.'
};

export function ComplaintDetailModal({ complaint, isOpen, onClose }) {
  const { userRole, staff, updateComplaint } = useApp();

  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [actionNote, setActionNote] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevComplaint, setPrevComplaint] = useState(complaint);

  // Reset the action form whenever a different complaint is opened
  if (complaint !== prevComplaint) {
    setPrevComplaint(complaint);
    setSelectedStaffId('');
    setActionNote('');
    setFormError('');
  }

  if (!complaint) return null;

  const allowedActions = getAllowedActions(complaint, userRole);
  const canAssign = allowedActions.includes('assign');
  const buttonActions = allowedActions.filter(a => a !== 'assign' && a !== 'note');
  const assignableStaff = staff.filter(s => s.id !== complaint.assignedStaffId);

  const runAction = async (action) => {
    const note = actionNote.trim();
    if (isNoteRequired(action, userRole) && !note) {
      setFormError(NOTE_REQUIRED_MESSAGES[action]);
      return;
    }
    if (action === 'assign' && !selectedStaffId) {
      setFormError('Select a staff member to assign.');
      return;
    }

    setFormError('');
    setIsSubmitting(true);
    const updated = await updateComplaint(complaint.id, {
      action,
      note,
      ...(action === 'assign' ? { staffId: selectedStaffId } : {})
    });
    setIsSubmitting(false);
    if (updated) onClose();
  };

  const ACTION_BUTTONS = {
    verify: { label: 'Verify Complaint', className: 'btn-primary' },
    start: { label: 'Start Work', className: 'btn-primary' },
    resolve: {
      label: 'Mark Resolved',
      className: userRole === 'staff' && complaint.status === 'In Progress' ? 'btn-primary' : 'btn-secondary'
    },
    reject: { label: 'Reject', className: 'btn-secondary' }
  };

  const noteHint = userRole === 'staff'
    ? 'Required when marking resolved. Visible to the student.'
    : 'Required to reject. Optional for other actions. Visible to the student.';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Complaint ${complaint.id}`} maxWidth="620px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Title & Category Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge-pill">{complaint.category}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
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
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '12px' }}>Location</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{complaint.location}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '12px' }}>Reported By</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
              {complaint.student} ({complaint.studentId})
            </span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '12px' }}>Assigned To</span>
            <span style={{ color: complaint.assignedStaffId ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 500 }}>
              {complaint.assignedStaffId ? complaint.assignedTo : 'Not assigned'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '12px', marginBottom: '4px' }}>
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
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '12px', marginBottom: '6px' }}>
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
          <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '12px', marginBottom: '8px' }}>
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
                  {t.actor && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>by {t.actor}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Actions (admin, or the staff member assigned to this complaint) */}
        {allowedActions.length > 0 && (
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{
              marginTop: '10px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              {userRole === 'admin' ? 'Admin Actions' : 'Staff Actions'}
            </div>

            {canAssign && (
              <div className="form-group">
                <label className="form-label" htmlFor="action-assign-staff">
                  {complaint.assignedStaffId ? 'Reassign to Staff Member' : 'Assign to Staff Member'}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    id="action-assign-staff"
                    className="form-select"
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="">Select staff member</option>
                    {assignableStaff.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.department})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={isSubmitting}
                    onClick={() => runAction('assign')}
                  >
                    {complaint.assignedStaffId ? 'Reassign' : 'Assign'}
                  </button>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="action-note-input">Note</label>
              <textarea
                id="action-note-input"
                className="form-textarea"
                rows={2}
                placeholder={userRole === 'staff' ? 'e.g. Replaced the faulty cable and tested the projector' : 'e.g. Confirmed on site by the Office of Student Affairs'}
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
              />
              <div className="form-help">{noteHint}</div>
            </div>

            {formError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-primary)', marginBottom: '8px' }}>
                <span className="dot dot-highpriority" aria-hidden="true" />
                {formError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-text"
                disabled={isSubmitting}
                onClick={() => runAction('note')}
              >
                Add note only
              </button>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {buttonActions.map(action => (
                  <button
                    key={action}
                    type="button"
                    className={ACTION_BUTTONS[action].className}
                    disabled={isSubmitting}
                    onClick={() => runAction(action)}
                  >
                    {ACTION_BUTTONS[action].label}
                  </button>
                ))}
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

export default ComplaintDetailModal;
