import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Topbar } from '../../components/layout/Topbar';
import { countByStatus } from '../../components/complaints/complaintWorkflow';
import { useAssignedComplaints } from './useAssignedComplaints';

export function StaffProfile() {
  const { staffUser, updateStaffProfile } = useApp();
  const myComplaints = useAssignedComplaints();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: staffUser.name || '',
    email: staffUser.email || '',
    phone: staffUser.phone || '',
    department: staffUser.department || ''
  });

  const metrics = [
    { label: 'Total Assigned', value: myComplaints.length },
    { label: 'Open', value: countByStatus(myComplaints, 'With Staff') + countByStatus(myComplaints, 'High Priority') },
    { label: 'Resolved', value: countByStatus(myComplaints, 'Resolved') }
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    await updateStaffProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: staffUser.name || '',
      email: staffUser.email || '',
      phone: staffUser.phone || '',
      department: staffUser.department || ''
    });
    setIsEditing(false);
  };

  const detailFields = [
    { label: 'Full Name', value: staffUser.name },
    { label: 'Staff ID', value: staffUser.id },
    { label: 'Work Email', value: staffUser.email },
    { label: 'Phone', value: staffUser.phone },
    { label: 'Department', value: staffUser.department }
  ];

  return (
    <div>
      <Topbar
        title="Staff Profile"
        subtitle="Your contact details and assignment summary."
      />

      <main className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Left Card */}
          <div className="card">
            <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <div
                className="avatar-circle"
                style={{ width: '64px', height: '64px', fontSize: '22px', margin: '0 auto 12px' }}
              >
                {staffUser.initials}
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {staffUser.name}
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {staffUser.id}
              </div>
              <span className="badge-pill">
                {staffUser.department ? `${staffUser.department} Staff` : 'Campus Staff'}
              </span>
            </div>

            <div style={{ paddingTop: '20px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '14px' }}>
                Assignment Summary
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {metrics.map(m => (
                  <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{m.label}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Card: Account Details with Edit Mode */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="heading-serif" style={{ fontSize: '20px', margin: 0 }}>
                Account Details
              </h2>
              {!isEditing ? (
                <button
                  type="button"
                  id="edit-staff-profile-btn"
                  className="btn-secondary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-text"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-staff-name">Full Name</label>
                  <input
                    id="edit-staff-name"
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-staff-email">Work Email</label>
                  <input
                    id="edit-staff-email"
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-staff-phone">Phone</label>
                  <input
                    id="edit-staff-phone"
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-staff-department">Department</label>
                  <input
                    id="edit-staff-department"
                    type="text"
                    className="form-input"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                  <button type="submit" id="save-staff-profile-btn" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {detailFields.map(field => (
                  <div key={field.label}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      {field.label}
                    </span>
                    <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                      {field.value || '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StaffProfile;
