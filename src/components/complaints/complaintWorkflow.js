// Complaint workflow rules. Mirrors getAllowedActions() in server/index.js —
// the server is the source of truth; this copy drives which buttons are shown
// and the offline fallback.
//
//   Student submits (Pending) -> Admin rejects (Rejected), resolves directly
//   (Resolved), or verifies and assigns staff in one step (Assigned)
//   -> Assigned staff starts work (In Progress) and resolves (Resolved).
// 'Verified' is only reached by complaints verified before that merge.
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
      // Verifying is not a separate step: assigning (or resolving) an
      // unverified complaint verifies it in the same action.
      case 'Pending':
      case 'Verified':
        return ['assign', 'resolve', 'reject', 'note'];
      case 'Assigned':
      case 'In Progress':
        return ['assign', 'resolve', 'note'];
      case 'High Priority':
        return assigned
          ? ['assign', 'resolve', 'note']
          : ['assign', 'resolve', 'reject', 'note'];
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

// Filters that look at more than the status (admin views only)
export const COMPLAINT_FILTERS = {
  Unassigned: c => OPEN_STATUSES.includes(c.status) && !c.assignedStaffId
};

export const ADMIN_FILTER_OPTIONS = [
  'All',
  ...Object.keys(STATUS_GROUPS),
  ...Object.keys(COMPLAINT_FILTERS),
  ...COMPLAINT_STATUSES
];

export function matchesStatusFilter(status, filter) {
  if (!filter || filter === 'All') return true;
  if (STATUS_GROUPS[filter]) return STATUS_GROUPS[filter].includes(status);
  return status === filter;
}

export function matchesComplaintFilter(complaint, filter) {
  if (COMPLAINT_FILTERS[filter]) return COMPLAINT_FILTERS[filter](complaint);
  return matchesStatusFilter(complaint.status, filter);
}

export function countByStatus(complaints, filter) {
  return complaints.filter(c => matchesComplaintFilter(c, filter)).length;
}

// True when acting on this complaint will also record it as verified. Mirrors
// recordVerificationIfNeeded() in server/index.js.
export function needsVerification(complaint) {
  if (!complaint || complaint.assignedStaffId) return false;
  if (!['Pending', 'High Priority'].includes(complaint.status)) return false;
  return !(complaint.timeline || []).some(t => t.step === 'Verified');
}
