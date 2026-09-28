import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Topbar } from '../../components/layout/Topbar';
import { StatusDot } from '../../components/common/StatusDot';
import { UrgencyDot } from '../../components/common/UrgencyDot';
import { ComplaintDetailModal } from '../../components/complaints/ComplaintDetailModal';

export function AllComplaints() {
  const { complaints, staff, statusFilter } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState(statusFilter || 'All');
  const [prevFilter, setPrevFilter] = useState(statusFilter);
  const [selectedStaff, setSelectedStaff] = useState('All');
  const [activeComplaint, setActiveComplaint] = useState(null);

  if (statusFilter !== prevFilter) {
    setPrevFilter(statusFilter);
    setSelectedStatus(statusFilter || 'All');
  }

  const categories = ['All', 'Facilities', 'IT', 'Library', 'Catering', 'Welfare', 'Academic', 'Transport'];
  const statuses = ['All', 'Pending', 'In Progress', 'High Priority', 'Resolved'];

  const filtered = complaints.filter(c => {
    const matchesSearch = searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.student && c.student.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.studentId && c.studentId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' ||
      c.category === selectedCategory ||
      (c.category && c.category.toLowerCase().startsWith(selectedCategory.toLowerCase()));

    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    const matchesStaff = selectedStaff === 'All' || c.assignedTo === selectedStaff;

    return matchesSearch && matchesCategory && matchesStatus && matchesStaff;
  });

  return (
    <div>
      <Topbar
        title="All Complaints"
        subtitle={`${filtered.length} complaints found across campus`}
      />

      <main className="page-body">
        {/* Filters Card */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '12px',
              alignItems: 'center'
            }}
          >
            <div>
              <input
                type="text"
                className="form-input"
                placeholder="Search by title, ID, student, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>Category: {cat}</option>
                ))}
              </select>
            </div>

            <div>
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

            <div>
              <select
                className="form-select"
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
              >
                <option value="All">Staff: All</option>
                <option value="Unassigned">Staff: Unassigned</option>
                {staff.map(s => (
                  <option key={s.id} value={s.name}>Staff: {s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Complaints Table */}
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
                  <th>Assigned To</th>
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
                    <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                      {comp.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {comp.title}
                      </div>
                      {comp.agingDays > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <span className="dot dot-pending" style={{ width: '5px', height: '5px' }} />
                          <span>{comp.agingDays}d old</span>
                        </div>
                      )}
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
                    <td style={{ color: comp.assignedTo === 'Unassigned' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {comp.assignedTo}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{comp.date}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>›</span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No matching complaints found. Try clearing your search or filters.
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

export default AllComplaints;
