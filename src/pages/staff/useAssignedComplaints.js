import { useApp } from '../../context/AppContext';

// Complaints assigned to the signed-in staff member. The API already scopes
// GET /api/complaints for staff; the filter covers the offline fallback data.
export function useAssignedComplaints() {
  const { complaints, staffUser, token, userRole } = useApp();

  if (token && userRole === 'staff') {
    return complaints;
  }
  return complaints.filter(c => c.assignedStaffId && c.assignedStaffId === staffUser.staffId);
}
