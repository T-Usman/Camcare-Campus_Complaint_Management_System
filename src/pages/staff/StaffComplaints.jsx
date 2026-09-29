import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Topbar } from '../../components/layout/Topbar';
import { StatusDot } from '../../components/common/StatusDot';
import { UrgencyDot } from '../../components/common/UrgencyDot';
import { ComplaintDetailModal } from '../../components/complaints/ComplaintDetailModal';
import { STATUS_FILTER_OPTIONS, matchesStatusFilter } from '../../components/complaints/complaintWorkflow';
import { useAssignedComplaints } from './useAssignedComplaints';

export function StaffComplaints() {
  const { statusFilter } = useApp();
  const myComplaints = useAssignedComplaints();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(statusFilter || 'All');
  const [prevFilter, setPrevFilter] = useState(statusFilter);
  const [activeComplaint, setActiveComplaint] = useState(null);

  if (statusFilter !== prevFilter) {
    setPrevFilter(statusFilter);
    setSelectedStatus(statusFilter || 'All');
  }

  // Staff never see Under Review complaints, so leave that group out
  const statuses = STATUS_FILTER_OPTIONS.filter(st => !['Under Review', 'Pending', 'Verified'].includes(st));

  const filtered = myComplaints.filter(c => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = query === '' ||
      c.title.toLowerCase().includes(query) ||
      c.id.toLowerCase().includes(query) ||
      c.location.toLowerCase().includes(query);

    return matchesSearch && matchesStatusFilter(c.status, selectedStatus);
  });

  return (
    <div>
      <Topbar
        title="My Assignments"
        subtitle={`${filtered.length} complaints assigned to you`}
      />

      <main className="page-body">
        <div className="card" style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              className="form-input"
              placeholder="Search by title, ID, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="form-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(st => (
                <option key={st} value={st}>Status: {st}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th>Reported By</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(comp => (
                  <tr
                    key={comp.id}
                    onClick={() => setActiveComplaint(comp)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{comp.id}</td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{comp.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{comp.location}</div>
                    </td>
                    <td>
                      <span className="badge-pill">{comp.category}</span>
                    </td>
                    <td>
                      <UrgencyDot urgency={comp.urgency} />
                    </td>
                    <td>
                      <StatusDot status={comp.status} />
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{comp.student}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{comp.date}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>›</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No matching complaints. Try clearing your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <ComplaintDetailModal
        complaint={activeComplaint}
        isOpen={Boolean(activeComplaint)}
        onClose={() => setActiveComplaint(null)}
      />
    </div>
  );
}

export default StaffComplaints;
