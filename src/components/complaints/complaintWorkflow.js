// Complaint workflow rules. Mirrors getAllowedActions() in server/index.js —
// the server is the source of truth; this copy drives which buttons are shown
// and the offline fallback.
//
//   Student submits (Pending) -> Admin verifies (Verified) or rejects (Rejected)
//   -> Admin resolves directly (Resolved) or assigns staff (Assigned)
//   -> Assigned staff starts work (In Progress) and resolves (Resolved).
// High Priority is set by auto-escalation after 3 days without activity.

export const COMPLAINT_STATUSES = [
  'Pending',
  'Verified',
  'Assigned',
  'In Progress',
  'High Priority',
  'Resolved',
  'Rejected'
];

export const OPEN_STATUSES = ['Pending', 'Verified', 'Assigned', 'In Progress', 'High Priority'];

export function getAllowedActions(complaint, role) {
  if (!complaint) return [];
  const assigned = Boolean(complaint.assignedStaffId);

  if (role === 'admin') {
    switch (complaint.status) {
      case 'Pending':
        return ['verify', 'reject', 'assign', 'resolve', 'note'];
      case 'Verified':
        return ['assign', 'resolve', 'reject', 'note'];
      case 'Assigned':
      case 'In Progress':
        return ['assign', 'resolve', 'note'];
      case 'High Priority':
        return assigned
          ? ['assign', 'resolve', 'note']
          : ['verify', 'reject', 'assign', 'resolve', 'note'];
      default:
        return [];
    }
  }

  if (role === 'staff') {
    switch (complaint.status) {
      case 'Assigned':
      case 'High Priority':
        return ['start', 'resolve', 'note'];
      case 'In Progress':
        return ['resolve', 'note'];
      default:
        return [];
    }
  }

  return [];
}

// Actions whose note field must be filled in
export function isNoteRequired(action, role) {
  return action === 'reject' || action === 'note' || (action === 'resolve' && role === 'staff');
}

// Grouped filters used by dashboard cards and status dropdowns
export const STATUS_GROUPS = {
  'Under Review': ['Pending', 'Verified'],
  'With Staff': ['Assigned', 'In Progress']
};

export const STATUS_FILTER_OPTIONS = ['All', ...Object.keys(STATUS_GROUPS), ...COMPLAINT_STATUSES];

export function matchesStatusFilter(status, filter) {
  if (!filter || filter === 'All') return true;
  if (STATUS_GROUPS[filter]) return STATUS_GROUPS[filter].includes(status);
  return status === filter;
}

export function countByStatus(complaints, filter) {
  return complaints.filter(c => matchesStatusFilter(c.status, filter)).length;
}
