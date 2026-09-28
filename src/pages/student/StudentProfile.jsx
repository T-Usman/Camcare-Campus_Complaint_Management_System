import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Topbar } from '../../components/layout/Topbar';

export function StudentProfile() {
  const { studentUser, updateProfile, complaints } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: studentUser.name,
    email: studentUser.email,
    phone: studentUser.phone,
    department: studentUser.department,
    residence: studentUser.residence
  });

  const myComplaints = complaints.filter(c => c.student === studentUser.name || c.studentId === studentUser.id);
  const totalCount = myComplaints.length;
  const resolvedCount = myComplaints.filter(c => c.status === 'Resolved').length;
  const pendingCount = myComplaints.filter(c => c.status === 'Pending').length;
  const highPriorityCount = myComplaints.filter(c => c.status === 'High Priority').length;

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setIsEditing(false);
  };

  return (
    <div>
      <Topbar
        title="Student Profile"
        subtitle="Manage your personal information and view your activity summary."
      />

      <main className="page-body">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          {/* Left Card: Avatar, ID, Role pill, Activity List */}
          <div className="card">
            <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
              <div
                className="avatar-circle"
                style={{ width: '64px', height: '64px', fontSize: '22px', margin: '0 auto 12px' }}
              >
                {studentUser.initials}
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {studentUser.name}
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {studentUser.id}
              </div>
              <span className="badge-pill">
                Undergraduate Student
              </span>
            </div>

            {/* My Activity List (Plain neutral numbers, no color-by-value) */}
            <div style={{ paddingTop: '20px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '14px' }}>
                My Activity
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Submitted</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{totalCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Resolved</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{resolvedCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Pending</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pendingCount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>High Priority</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{highPriorityCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Account Details with Edit Profile */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="heading-serif" style={{ fontSize: '20px', margin: 0 }}>
                Account Details
              </h2>
              {!isEditing ? (
                <button
                  type="button"
                  id="edit-profile-btn"
                  className="btn-secondary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-text"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-name">Full Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-email">Campus Email</label>
                  <input
                    id="edit-email"
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-phone">Phone Number</label>
                  <input
                    id="edit-phone"
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-department">Department / Programme</label>
                  <input
                    id="edit-department"
                    type="text"
                    className="form-input"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-residence">Campus Residence / Hostel</label>
                  <input
                    id="edit-residence"
                    type="text"
                    className="form-input"
                    value={formData.residence}
                    onChange={(e) => setFormData({ ...formData, residence: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                  <button type="submit" id="save-profile-btn" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Full Name
                  </span>
                  <div style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {studentUser.name}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Student ID
                  </span>
                  <div style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {studentUser.id}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Campus Email
                  </span>
                  <div style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {studentUser.email}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Phone Number
                  </span>
                  <div style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {studentUser.phone}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Department / Programme
                  </span>
                  <div style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {studentUser.department}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Campus Residence
                  </span>
                  <div style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {studentUser.residence}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentProfile;
