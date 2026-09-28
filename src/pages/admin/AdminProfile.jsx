import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Topbar } from '../../components/layout/Topbar';

export function AdminProfile() {
  const { adminUser, updateAdminProfile, complaints, staff } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: adminUser.name || '',
    email: adminUser.email || '',
    phone: adminUser.phone || '',
    department: adminUser.department || ''
  });

  const totalComplaints = complaints.length;
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
  const escalatedComplaints = complaints.filter(c => c.status === 'High Priority').length;
  const staffCount = staff.length;

  const handleSave = async (e) => {
    e.preventDefault();
    await updateAdminProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: adminUser.name || '',
      email: adminUser.email || '',
      phone: adminUser.phone || '',
      department: adminUser.department || ''
    });
    setIsEditing(false);
  };

  return (
    <div>
      <Topbar
        title="Admin Profile"
        subtitle="Administrator credentials, oversight metrics, and campus office details."
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
                {adminUser.initials}
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {adminUser.name}
              </h2>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                {adminUser.id}
              </div>
              <span className="badge-pill">
                Campus Administrator
              </span>
            </div>

            {/* Oversight Metrics */}
            <div style={{ paddingTop: '20px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '14px' }}>
                Oversight Metrics
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Managed Tickets</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{totalComplaints}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Resolved Tickets</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{resolvedComplaints}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Escalated to Dean</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{escalatedComplaints}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Active Officers</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{staffCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Account Details with Edit Mode */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 className="heading-serif" style={{ fontSize: '20px', margin: 0 }}>
                Administrative Credentials & Office
              </h2>
              {!isEditing ? (
                <button
                  type="button"
                  id="edit-admin-profile-btn"
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
                  <label className="form-label" htmlFor="edit-admin-name">Full Name & Title</label>
                  <input
                    id="edit-admin-name"
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-admin-email">Official Email</label>
                  <input
                    id="edit-admin-email"
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-admin-phone">Direct Phone</label>
                  <input
                    id="edit-admin-phone"
                    type="text"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-admin-department">Division / Office</label>
                  <input
                    id="edit-admin-department"
                    type="text"
                    className="form-input"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                  <button type="submit" id="save-admin-profile-btn" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Full Name & Title
                  </span>
                  <div style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {adminUser.name}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Administrator ID
                  </span>
                  <div style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {adminUser.id}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Official Email
                  </span>
                  <div style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {adminUser.email}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Direct Phone
                  </span>
                  <div style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {adminUser.phone}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Division
                  </span>
                  <div style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {adminUser.department}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Campus Office
                  </span>
                  <div style={{ fontSize: '14.5px', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                    Administration Building, Suite 302
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '32px', padding: '16px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Governance Note
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Administrator credentials have full privileges to assign work orders, update ticket SLA targets, and broadcast campus announcements.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminProfile;
