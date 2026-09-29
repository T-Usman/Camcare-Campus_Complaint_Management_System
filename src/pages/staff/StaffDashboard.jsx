import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Topbar } from '../../components/layout/Topbar';
import { AlertBanner } from '../../components/layout/AlertBanner';
import { StatusDot } from '../../components/common/StatusDot';
import { UrgencyDot } from '../../components/common/UrgencyDot';
import { ComplaintDetailModal } from '../../components/complaints/ComplaintDetailModal';
import { countByStatus, OPEN_STATUSES } from '../../components/complaints/complaintWorkflow';
import { useAssignedComplaints } from './useAssignedComplaints';

export function StaffDashboard() {
  const { staffUser, navigateTo, navigateWithFilter } = useApp();
  const myComplaints = useAssignedComplaints();

  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const highPriorityCount = countByStatus(myComplaints, 'High Priority');
  const openComplaints = myComplaints.filter(c => OPEN_STATUSES.includes(c.status));

  const statCards = [
    { label: 'New Assignments', filter: 'Assigned', dot: 'Assigned', caption: 'Not started yet' },
    { label: 'In Progress', filter: 'In Progress', dot: 'In Progress', caption: 'Work underway' },
    { label: 'High Priority', filter: 'High Priority', dot: 'High Priority', caption: 'Escalated, act first' },
    { label: 'Resolved', filter: 'Resolved', dot: 'Resolved', caption: 'Completed by you' }
  ];

  return (
    <div>
      <Topbar
        title={`Good morning, ${staffUser.name.split(' ')[0]}`}
        subtitle={`${staffUser.department || 'Staff'} · complaints assigned to you.`}
      />

      <main className="page-body">
        {highPriorityCount > 0 && <AlertBanner count={highPriorityCount} />}

        <div className="stat-grid-4">
          {statCards.map(card => (
            <div
              key={card.filter}
              className="stat-card stat-card-clickable"
              onClick={() => navigateWithFilter('staff-complaints', card.filter)}
              role="button"
              tabIndex={0}
              title={`View ${card.label}`}
            >
              <div className="stat-card-header">
                <span className="stat-label">{card.label}</span>
                <StatusDot status={card.dot} showLabel={false} />
              </div>
              <div className="stat-number">{countByStatus(myComplaints, card.filter)}</div>
              <div className="stat-caption">{card.caption}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="heading-serif" style={{ fontSize: '18px', margin: 0 }}>
              Open Assignments
            </h2>
            <button
              type="button"
              className="btn-text"
              onClick={() => navigateTo('staff-complaints')}
              style={{ fontSize: '13px' }}
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
                  <th>Location</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Reported</th>
                </tr>
              </thead>
              <tbody>
                {openComplaints.map(comp => (
                  <tr
                    key={comp.id}
                    onClick={() => setSelectedComplaint(comp)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{comp.id}</td>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{comp.title}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{comp.location}</td>
                    <td>
                      <UrgencyDot urgency={comp.urgency} />
                    </td>
                    <td>
                      <StatusDot status={comp.status} />
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{comp.date}</td>
                  </tr>
                ))}
                {openComplaints.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No open assignments. New complaints appear here when an administrator assigns them to you.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ComplaintDetailModal
        complaint={selectedComplaint}
        isOpen={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
      />
    </div>
  );
}

export default StaffDashboard;
