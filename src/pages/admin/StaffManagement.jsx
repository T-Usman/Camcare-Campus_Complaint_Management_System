import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Topbar } from '../../components/layout/Topbar';
import { Modal } from '../../components/common/Modal';

const EMPTY_STAFF_FORM = { name: '', email: '', department: '', phone: '', password: '' };

export function StaffManagement() {
  const { staff, addStaffMember } = useApp();

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newStaff, setNewStaff] = useState(EMPTY_STAFF_FORM);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    const created = await addStaffMember(newStaff);
    if (created) {
      setIsAddOpen(false);
      setNewStaff(EMPTY_STAFF_FORM);
    }
  };

  return (
    <div>
      <Topbar
        title="Staff Management"
        subtitle={`${staff.length} staff members across all departments.`}
      />

      <main className="page-body">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button type="button" className="btn-primary" onClick={() => setIsAddOpen(true)}>
            + Add Staff Member
          </button>
        </div>

        <div className="staff-grid">
          {staff.map((member) => (
            <div key={member.id} className="staff-card card-hover">
              <div className="staff-header">
                <div className="avatar-circle" style={{ width: '42px', height: '42px', fontSize: '14px' }}>
                  {member.initials}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {member.department}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Login ID: {member.loginId || 'No login account'}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '13px', marginBottom: '14px' }}>
                <a
                  href={`mailto:${member.email}`}
                  style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                >
                  {member.email}
                </a>
              </div>

              {/* Two Stat Tiles: Active Count, Resolved Count (Numbers plain, NO color coding) */}
              <div className="staff-stats-row">
                <div>
                  <div className="staff-stat-val">{member.activeCount}</div>
                  <div className="staff-stat-lbl">Active</div>
                </div>
                <div>
                  <div className="staff-stat-val">{member.resolvedCount}</div>
                  <div className="staff-stat-lbl">Resolved</div>
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-text"
                  onClick={() => setSelectedStaff(member)}
                  style={{ fontSize: '12px' }}
                >
                  View details ›
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Staff Member Details Modal */}
      <Modal
        isOpen={Boolean(selectedStaff)}
        onClose={() => setSelectedStaff(null)}
        title={selectedStaff?.name || 'Staff Member'}
      >
        {selectedStaff && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div className="avatar-circle" style={{ width: '52px', height: '52px', fontSize: '18px' }}>
                {selectedStaff.initials}
              </div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedStaff.name}
                </h3>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {selectedStaff.department} • {selectedStaff.id}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedStaff.activeCount}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Assigned Active Tickets</div>
              </div>
              <div className="card" style={{ padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedStaff.resolvedCount}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Lifetime Resolved</div>
              </div>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div><strong>Direct Email:</strong> {selectedStaff.email}</div>
              <div><strong>Work Schedule:</strong> Monday – Friday (08:00 – 17:00 GMT)</div>
              <div><strong>Escalation Tier:</strong> Tier 2 Technical Response Officer</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setSelectedStaff(null)}
              >
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Staff Member Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Staff Member"
      >
        <form onSubmit={handleAddStaff}>
          <div className="form-group">
            <label className="form-label" htmlFor="new-staff-name">Full Name</label>
            <input
              id="new-staff-name"
              type="text"
              className="form-input"
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="new-staff-email">Work Email</label>
            <input
              id="new-staff-email"
              type="email"
              className="form-input"
              value={newStaff.email}
              onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="new-staff-department">Department</label>
            <input
              id="new-staff-department"
              type="text"
              className="form-input"
              placeholder="e.g. Facilities"
              value={newStaff.department}
              onChange={(e) => setNewStaff({ ...newStaff, department: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="new-staff-phone">Phone (optional)</label>
            <input
              id="new-staff-phone"
              type="text"
              className="form-input"
              value={newStaff.phone}
              onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="new-staff-password">Initial Password</label>
            <input
              id="new-staff-password"
              type="password"
              className="form-input"
              minLength={8}
              value={newStaff.password}
              onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
              required
            />
            <div className="form-help">A Staff ID (STF-xxxx) is generated automatically and shown after saving.</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Staff Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default StaffManagement;
