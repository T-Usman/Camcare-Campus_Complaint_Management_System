import React from 'react';
import { useApp } from '../../context/AppContext';

export function Sidebar() {
  const { userRole, currentPage, navigateTo, logout, studentUser, adminUser } = useApp();

  const isStudent = userRole === 'student';
  const currentUser = isStudent ? studentUser : adminUser;

  const studentNavItems = [
    { id: 'student-dashboard', label: 'Dashboard' },
    { id: 'student-complaints', label: 'My Complaints' },
    { id: 'student-submit', label: 'Submit Complaint' },
    { id: 'student-announcements', label: 'Announcements' },
    { id: 'student-profile', label: 'Profile' }
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Dashboard' },
    { id: 'admin-complaints', label: 'All Complaints' },
    { id: 'admin-staff', label: 'Staff' },
    { id: 'admin-reports', label: 'Reports' },
    { id: 'admin-announcements', label: 'Announcements' },
    { id: 'admin-profile', label: 'Profile' }
  ];

  const navItems = isStudent ? studentNavItems : adminNavItems;

  return (
    <aside className="sidebar" aria-label="Sidebar navigation">
      <div className="sidebar-header">
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => navigateTo('marketing')}
          title="Return to Homepage"
        >
          <div className="sidebar-logo">
            Cam<span className="logo-accent">Care</span>
          </div>
          <div className="sidebar-subtitle">Campus Complaint System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <div
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-link-item ${isActive ? 'active' : ''}`}
              onClick={() => navigateTo(item.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  navigateTo(item.id);
                }
              }}
            >
              <span className="nav-link-text">{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-footer-card">
          <div className="avatar-circle">
            {currentUser.initials}
          </div>
          <div className="user-footer-info">
            <div className="user-footer-name">{currentUser.name}</div>
            <div className="user-footer-sub">
              {isStudent ? currentUser.id : 'Administrator'}
            </div>
          </div>
          <button
            type="button"
            id="sidebar-signout-btn"
            className="sign-out-btn"
            onClick={logout}
            title="Sign out of CamCare"
          >
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
