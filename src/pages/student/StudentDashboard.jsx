import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Topbar } from '../../components/layout/Topbar';
import { AlertBanner } from '../../components/layout/AlertBanner';
import { StatusDot } from '../../components/common/StatusDot';
import { ComplaintDetailModal } from '../../components/complaints/ComplaintDetailModal';
import { Modal } from '../../components/common/Modal';

export function StudentDashboard() {
  const { studentUser, complaints, announcements, navigateTo, navigateWithFilter, token, userRole } = useApp();

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Filter complaints for this student: API already scopes when authenticated
  const myComplaints = (token && userRole === 'student')
    ? complaints
    : complaints.filter(c =>
        (c.studentId && studentUser?.id && c.studentId.toLowerCase() === studentUser.id.toLowerCase()) ||
        (c.student && studentUser?.name && c.student.toLowerCase() === studentUser.name.toLowerCase())
      );
  const recentComplaints = myComplaints.slice(0, 5);

  const pendingCount = myComplaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = myComplaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = myComplaints.filter(c => c.status === 'Resolved').length;
  const highPriorityCount = myComplaints.filter(c => c.status === 'High Priority').length;

  const latestAnnouncement = announcements[0];

  return (
    <div>
      <Topbar
        title={`Good morning, ${studentUser.name.split(' ')[0]}`}
        subtitle="Campus complaint overview for today."
      />

      <main className="page-body">
        {/* Escalation Alert Banner */}
        {highPriorityCount > 0 && <AlertBanner count={highPriorityCount} />}

        {/* 4 Stat Cards */}
        <div className="stat-grid-4">
          <div
            className="stat-card stat-card-clickable"
            onClick={() => navigateWithFilter('student-complaints', 'Pending')}
            role="button"
            tabIndex={0}
            title="View Pending Complaints"
          >
            <div className="stat-card-header">
              <span className="stat-label">Pending</span>
              <StatusDot status="Pending" showLabel={false} />
            </div>
            <div className="stat-number">{pendingCount}</div>
            <div className="stat-caption">Awaiting assignment</div>
          </div>

          <div
            className="stat-card stat-card-clickable"
            onClick={() => navigateWithFilter('student-complaints', 'In Progress')}
            role="button"
            tabIndex={0}
            title="View In Progress Complaints"
          >
            <div className="stat-card-header">
              <span className="stat-label">In Progress</span>
              <StatusDot status="In Progress" showLabel={false} />
            </div>
            <div className="stat-number">{inProgressCount}</div>
            <div className="stat-caption">Being handled</div>
          </div>

          <div
            className="stat-card stat-card-clickable"
            onClick={() => navigateWithFilter('student-complaints', 'Resolved')}
            role="button"
            tabIndex={0}
            title="View Resolved Complaints"
          >
            <div className="stat-card-header">
              <span className="stat-label">Resolved</span>
              <StatusDot status="Resolved" showLabel={false} />
            </div>
            <div className="stat-number">{resolvedCount}</div>
            <div className="stat-caption">This semester</div>
          </div>

          <div
            className="stat-card stat-card-clickable"
            onClick={() => navigateWithFilter('student-complaints', 'High Priority')}
            role="button"
            tabIndex={0}
            title="View High Priority Complaints"
          >
            <div className="stat-card-header">
              <span className="stat-label">High Priority</span>
              <StatusDot status="High Priority" showLabel={false} />
            </div>
            <div className="stat-number">{highPriorityCount}</div>
            <div className="stat-caption">Needs immediate action</div>
          </div>
        </div>

        {/* Split Layout: Recent Complaints Table + Latest Announcement Card */}
        <div className="dashboard-split-layout">
          {/* Table Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="heading-serif" style={{ fontSize: '18px', margin: 0 }}>
                Recent Complaints
              </h2>
              <button
                type="button"
                className="btn-text"
                onClick={() => navigateTo('student-complaints')}
                style={{ fontSize: '12.5px' }}
              >
                View all →
              </button>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentComplaints.map(comp => (
                    <tr
                      key={comp.id}
                      onClick={() => setSelectedComplaint(comp)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{comp.id}</td>
                      <td>{comp.title}</td>
                      <td>
                        <span className="badge-pill">{comp.category}</span>
                      </td>
                      <td>
                        <StatusDot status={comp.status} />
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{comp.date}</td>
                    </tr>
                  ))}
                  {recentComplaints.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        No complaints submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Latest Announcement Side Panel */}
          {latestAnnouncement && (
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Latest Announcement
                </span>
              </div>

              <div style={{ position: 'relative', height: '140px' }}>
                <img
                  src={latestAnnouncement.image}
                  alt={latestAnnouncement.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="announcement-category-tag">
                  {latestAnnouncement.category}
                </span>
              </div>

              <div style={{ padding: '18px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.35 }}>
                  {latestAnnouncement.title}
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                  {latestAnnouncement.snippet}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{latestAnnouncement.date}</span>
                  <button
                    type="button"
                    className="btn-text"
                    onClick={() => setSelectedAnnouncement(latestAnnouncement)}
                    style={{ fontSize: '12px' }}
                  >
                    Read more →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Complaint Detail Modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
      />

      {/* Announcement Modal */}
      <Modal
        isOpen={Boolean(selectedAnnouncement)}
        onClose={() => setSelectedAnnouncement(null)}
        title={selectedAnnouncement?.title || 'Announcement'}
      >
        {selectedAnnouncement && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="badge-pill">{selectedAnnouncement.category}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedAnnouncement.date}</span>
            </div>
            <img
              src={selectedAnnouncement.image}
              alt=""
              style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '6px', marginBottom: '16px' }}
            />
            <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
              {selectedAnnouncement.body || selectedAnnouncement.snippet}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default StudentDashboard;
