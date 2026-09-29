import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MarketingPage } from './pages/MarketingPage';
import { AuthPage } from './pages/AuthPage';
import { Sidebar } from './components/layout/Sidebar';
import { Toast } from './components/common/Toast';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyComplaints } from './pages/student/MyComplaints';
import { SubmitComplaint } from './pages/student/SubmitComplaint';
import { StudentAnnouncements } from './pages/student/StudentAnnouncements';
import { StudentProfile } from './pages/student/StudentProfile';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AllComplaints } from './pages/admin/AllComplaints';
import { StaffManagement } from './pages/admin/StaffManagement';
import { ReportsAnalytics } from './pages/admin/ReportsAnalytics';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminProfile } from './pages/admin/AdminProfile';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffComplaints } from './pages/staff/StaffComplaints';
import { StaffAnnouncements } from './pages/staff/StaffAnnouncements';
import { StaffProfile } from './pages/staff/StaffProfile';

function AppContent() {
  const { currentPage, userRole } = useApp();

  // Public / Unauthenticated Views
  if (currentPage === 'marketing') {
    return (
      <>
        <MarketingPage />
        <Toast />
      </>
    );
  }

  if (currentPage === 'auth') {
    return (
      <>
        <AuthPage />
        <Toast />
      </>
    );
  }

  // Authenticated Portal Views (Student or Admin Shell)
  const renderPortalPage = () => {
    switch (currentPage) {
      // Student routes
      case 'student-dashboard':
        return <StudentDashboard />;
      case 'student-complaints':
        return <MyComplaints />;
      case 'student-submit':
        return <SubmitComplaint />;
      case 'student-announcements':
        return <StudentAnnouncements />;
      case 'student-profile':
        return <StudentProfile />;

      // Admin routes
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-complaints':
        return <AllComplaints />;
      case 'admin-staff':
        return <StaffManagement />;
      case 'admin-reports':
        return <ReportsAnalytics />;
      case 'admin-announcements':
        return <AdminAnnouncements />;
      case 'admin-profile':
        return <AdminProfile />;

      // Staff routes
      case 'staff-dashboard':
        return <StaffDashboard />;
      case 'staff-complaints':
        return <StaffComplaints />;
      case 'staff-announcements':
        return <StaffAnnouncements />;
      case 'staff-profile':
        return <StaffProfile />;

      default:
        if (userRole === 'admin') return <AdminDashboard />;
        if (userRole === 'staff') return <StaffDashboard />;
        return <StudentDashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        {renderPortalPage()}
      </div>
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
