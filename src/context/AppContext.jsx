import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

const API_BASE = 'http://localhost:8000';

const INITIAL_COMPLAINTS = [
  {
    id: 'C-0041',
    title: 'Broken projector in Room 204',
    category: 'Facilities',
    urgency: 'High',
    status: 'In Progress',
    assignedTo: 'David Mensah',
    date: '2026-07-25',
    agingDays: 4,
    location: 'Science Block B, Room 204',
    description: 'The ceiling mounted Epson projector will not power on and HDMI connection is loose. Professors cannot project lecture slides.',
    student: 'Kwame Mensah',
    studentId: 'STU-2024-892',
    photo: null,
    timeline: [
      { step: 'Submitted', time: '2026-07-25 09:15', note: 'Complaint logged by Kwame Mensah' },
      { step: 'Triaged', time: '2026-07-25 10:30', note: 'Marked as High urgency by Administration' },
      { step: 'Assigned', time: '2026-07-25 11:00', note: 'Assigned to Facilities officer David Mensah' },
      { step: 'In Progress', time: '2026-07-26 14:20', note: 'Replacement bulb and cable ordered' }
    ]
  },
  {
    id: 'C-0040',
    title: 'Insufficient seating in the library',
    category: 'Library',
    urgency: 'Medium',
    status: 'Pending',
    assignedTo: 'Unassigned',
    date: '2026-07-27',
    agingDays: 2,
    location: 'Central Library 2nd Floor',
    description: 'During peak study hours between 2 PM and 6 PM, student count exceeds chairs. Several students have to sit on hallway carpet.',
    student: 'Kwame Mensah',
    studentId: 'STU-2024-892',
    photo: null,
    timeline: [
      { step: 'Submitted', time: '2026-07-27 15:40', note: 'Complaint logged by Kwame Mensah' },
      { step: 'Triaged', time: '2026-07-27 16:10', note: 'Classified under Library facilities' }
    ]
  },
  {
    id: 'C-0039',
    title: 'Cafeteria food quality complaints',
    category: 'Catering',
    urgency: 'Critical',
    status: 'High Priority',
    assignedTo: 'Grace Adjei',
    date: '2026-07-22',
    agingDays: 7,
    location: 'North Dining Hall',
    description: 'Repeated instances of cold meals, inadequate hygiene at the self-serve soup station, and lack of vegetarian options.',
    student: 'Kwame Mensah',
    studentId: 'STU-2024-892',
    photo: null,
    timeline: [
      { step: 'Submitted', time: '2026-07-22 12:30', note: 'Complaint logged by Kwame Mensah' },
      { step: 'Triaged', time: '2026-07-22 13:00', note: 'Escalated to Critical urgency' },
      { step: 'Assigned', time: '2026-07-23 08:30', note: 'Assigned to Catering Manager Grace Adjei' },
      { step: 'Escalated', time: '2026-07-26 09:00', note: 'Escalated to High Priority — unanswered for 3+ days' }
    ]
  },
  {
    id: 'C-0038',
    title: 'Wi-Fi dead zones in Hostel C',
    category: 'IT',
    urgency: 'High',
    status: 'Resolved',
    assignedTo: 'Samuel Tetteh',
    date: '2026-07-20',
    agingDays: 9,
    location: 'Hostel C Floors 2 & 3',
    description: 'Signal cuts off in the study lounges. Packet drop rate over 60% during evening coursework hours.',
    student: 'Kwame Mensah',
    studentId: 'STU-2024-892',
    photo: null,
    timeline: [
      { step: 'Submitted', time: '2026-07-20 18:00', note: 'Complaint logged by Kwame Mensah' },
      { step: 'Assigned', time: '2026-07-21 09:00', note: 'Assigned to IT Network Team (Samuel Tetteh)' },
      { step: 'Resolved', time: '2026-07-24 16:45', note: 'New Wi-Fi 6 access point installed on Floor 3' }
    ]
  },
  {
    id: 'C-0037',
    title: 'Leaking roof in Lecture Hall A',
    category: 'Facilities',
    urgency: 'Critical',
    status: 'High Priority',
    assignedTo: 'David Mensah',
    date: '2026-07-21',
    agingDays: 8,
    location: 'Lecture Hall A',
    description: 'Rain water dripping onto rows 4 and 5 near electrical wiring conduits, causing severe hazard during thunderstorms.',
    student: 'Ama Serwah',
    studentId: 'STU-2024-512',
    photo: null,
    timeline: [
      { step: 'Submitted', time: '2026-07-21 11:10', note: 'Complaint logged' },
      { step: 'Escalated', time: '2026-07-25 09:00', note: 'Escalated due to roof contractor delays' }
    ]
  },
  {
    id: 'C-0036',
    title: 'Sports court lighting failure',
    category: 'Facilities',
    urgency: 'Medium',
    status: 'Pending',
    assignedTo: 'Unassigned',
    date: '2026-07-28',
    agingDays: 1,
    location: 'Outdoor Basketball Court',
    description: 'Timer relay tripped; floodlights do not turn on for intramural sports after sunset.',
    student: 'John Doe',
    studentId: 'STU-2024-332',
    photo: null,
    timeline: [
      { step: 'Submitted', time: '2026-07-28 20:15', note: 'Complaint logged' }
    ]
  },
  {
    id: 'C-0035',
    title: 'Harassment by security personnel',
    category: 'Welfare',
    urgency: 'Critical',
    status: 'In Progress',
    assignedTo: 'Grace Adjei',
    date: '2026-07-24',
    agingDays: 5,
    location: 'Main Gate Checkpoint',
    description: 'Hostile screening and aggressive detention of students arriving after 10 PM library shifts.',
    student: 'Sarah Jenkins',
    studentId: 'STU-2024-118',
    photo: null,
    timeline: [
      { step: 'Submitted', time: '2026-07-24 23:45', note: 'Confidential complaint logged' },
      { step: 'In Progress', time: '2026-07-25 14:00', note: 'Security shift supervisor interviewed' }
    ]
  },
  {
    id: 'C-0034',
    title: 'Missing equipment from Science lab',
    category: 'Academic',
    urgency: 'High',
    status: 'Resolved',
    assignedTo: 'Samuel Tetteh',
    date: '2026-07-18',
    agingDays: 11,
    location: 'Chemistry Lab 3',
    description: 'Two precision digital analytical balances missing from student bench stations.',
    student: 'Michael Chen',
    studentId: 'STU-2024-741',
    photo: null,
    timeline: [
      { step: 'Submitted', time: '2026-07-18 10:00', note: 'Reported by lab assistant' },
      { step: 'Resolved', time: '2026-07-19 15:30', note: 'Found in calibration department' }
    ]
  }
];

const INITIAL_STAFF = [
  { id: 'STF-01', name: 'David Mensah', initials: 'DM', department: 'Facilities', email: 'd.mensah@camcare.edu', activeCount: 5, resolvedCount: 23 },
  { id: 'STF-02', name: 'Grace Adjei', initials: 'GA', department: 'Welfare & Catering', email: 'g.adjei@camcare.edu', activeCount: 3, resolvedCount: 18 },
  { id: 'STF-03', name: 'Samuel Tetteh', initials: 'ST', department: 'IT Services', email: 's.tetteh@camcare.edu', activeCount: 2, resolvedCount: 31 },
  { id: 'STF-04', name: 'Abena Quansah', initials: 'AQ', department: 'Library', email: 'a.quansah@camcare.edu', activeCount: 1, resolvedCount: 12 },
  { id: 'STF-05', name: 'Kofi Boateng', initials: 'KB', department: 'Academic Affairs', email: 'k.boateng@camcare.edu', activeCount: 0, resolvedCount: 9 }
];

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    title: 'Campus Wi-Fi upgrade scheduled for August 5',
    category: 'IT',
    date: '2026-07-28',
    image: '/images/wifi.jpg',
    snippet: 'The IT department will perform a campus-wide network upgrade starting August 5 from 11 PM to 3 AM. Intermittent outages are expected. Please plan accordingly.',
    body: 'The IT department will perform a comprehensive hardware overhaul across all student residential halls, research labs, and lecture complexes on August 5 from 11 PM to 3 AM. This upgrade introduces enterprise Wi-Fi 6 access points with four-fold concurrency handling and seamless roaming.'
  },
  {
    id: 'ann-2',
    title: 'New complaint resolution SLA policy effective August 1',
    category: 'Policy',
    date: '2026-07-26',
    image: '/images/policy.jpg',
    snippet: 'All complaints must be acknowledged within 24 hours and resolved within 5 working days. High Priority complaints require resolution within 48 hours.',
    body: 'The University Senate and Student Welfare Directorate have enacted the 2026 CamCare Resolution Guarantee Charter. Under this agreement, all student and faculty complaint submissions must be formally triaged within 24 hours of submission.'
  },
  {
    id: 'ann-3',
    title: 'Maintenance window: Cafeteria North closed Jul 30–31',
    category: 'Facilities',
    date: '2026-07-25',
    image: '/images/cafeteria.jpg',
    snippet: 'The North Cafeteria will be closed for deep cleaning and equipment maintenance. The South Cafeteria operates with extended hours during this period.',
    body: 'North Hall Dining facilities will pause operations for a scheduled 48-hour deep sanitation and range hood maintenance cycle.'
  },
  {
    id: 'ann-4',
    title: 'Student welfare survey now open',
    category: 'Welfare',
    date: '2026-07-23',
    image: '/images/students.jpg',
    snippet: 'The Welfare Office has launched its bi-annual student life survey. Share your feedback on campus safety, mental health services, and hostel living.',
    body: 'Direct student feedback shapes annual university capital allocations. The 2026 Welfare & Facilities Survey is now available in your student portal dashboard.'
  }
];

export function AppProvider({ children }) {
  // Theme: 'dark' or 'light'
  const [theme, setTheme] = useState(() => localStorage.getItem('camcare_theme') || 'dark');

  // Token & Auth State
  const [token, setToken] = useState(() => localStorage.getItem('camcare_token') || null);
  const [userRole, setUserRole] = useState(() => localStorage.getItem('camcare_role') || null);
  const [currentPage, setCurrentPage] = useState(() => {
    const role = localStorage.getItem('camcare_role');
    const tok = localStorage.getItem('camcare_token');
    if (tok && role) {
      return role === 'admin' ? 'admin-dashboard' : 'student-dashboard';
    }
    return 'marketing';
  });
  const [statusFilter, setStatusFilter] = useState('All');

  // Active user details
  const [studentUser, setStudentUser] = useState({
    name: 'Kwame Mensah',
    initials: 'KM',
    id: 'STU-2024-892',
    email: 'k.mensah@camcare.edu',
    phone: '+233 24 555 0192',
    department: 'Computer Science & Engineering',
    residence: 'Hostel B, Room 314'
  });

  const [adminUser, setAdminUser] = useState({
    name: 'Dr. Rita Asante',
    initials: 'DR',
    id: 'ADM-8801',
    email: 'r.asante@camcare.edu',
    phone: '+233 20 555 0881',
    department: 'Office of the Dean of Student Affairs'
  });

  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
  const [staff, setStaff] = useState(INITIAL_STAFF);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [toastMessage, setToastMessage] = useState('');

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.setAttribute('content', theme);
    localStorage.setItem('camcare_theme', theme);
  }, [theme]);

  const toggleTheme = (mode) => {
    if (mode) {
      setTheme(mode);
    } else {
      setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
  };

  // Helper fetch with auth
  const apiFetch = useCallback(async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      console.warn(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  }, [token]);

  // Load complaints and announcements from backend
  const refreshComplaints = useCallback(async (authToken) => {
    const activeTok = authToken || token;
    if (!activeTok) return;

    try {
      const res = await fetch(`${API_BASE}/api/complaints`, {
        headers: { Authorization: `Bearer ${activeTok}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (err) {
      console.warn('Could not fetch complaints from API:', err.message);
    }
  }, [token]);

  const refreshAnnouncements = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/announcements`);
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      }
    } catch (err) {
      console.warn('Could not fetch announcements from API:', err.message);
    }
  }, []);

  const refreshStaff = useCallback(async (authToken) => {
    const activeTok = authToken || token;
    if (!activeTok) return;

    try {
      const res = await fetch(`${API_BASE}/api/staff`, {
        headers: { Authorization: `Bearer ${activeTok}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStaff(data);
      }
    } catch (err) {
      console.warn('Could not fetch staff from API:', err.message);
    }
  }, [token]);

  const refreshProfile = useCallback(async (authToken) => {
    const activeTok = authToken || token;
    if (!activeTok) return;

    try {
      const res = await fetch(`${API_BASE}/api/profile/me`, {
        headers: { Authorization: `Bearer ${activeTok}` }
      });
      if (res.ok) {
        const profile = await res.json();
        if (profile.role === 'admin') {
          setAdminUser(profile);
        } else {
          setStudentUser(profile);
        }
      }
    } catch (err) {
      console.warn('Could not fetch profile from API:', err.message);
    }
  }, [token]);

  // On initial mount or token change, load remote data
  useEffect(() => {
    refreshAnnouncements();
    if (token) {
      refreshProfile(token);
      refreshComplaints(token);
      if (userRole === 'admin') {
        refreshStaff(token);
      }
    }
  }, [token, userRole, refreshAnnouncements, refreshProfile, refreshComplaints, refreshStaff]);

  // Login handler
  const login = async (role, credentials) => {
    try {
      const defaultLoginId = role === 'admin' ? 'ADM-8801' : 'STU-2024-892';
      const defaultPassword = 'password123';

      const loginId = credentials?.loginId || defaultLoginId;
      const password = credentials?.password || defaultPassword;

      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ role, loginId, password })
      });

      setToken(data.token);
      setUserRole(role);
      localStorage.setItem('camcare_token', data.token);
      localStorage.setItem('camcare_role', role);

      if (role === 'student') {
        setStudentUser(data.user);
        setCurrentPage('student-dashboard');
      } else {
        setAdminUser(data.user);
        setCurrentPage('admin-dashboard');
        refreshStaff(data.token);
      }

      refreshComplaints(data.token);
      showToast(`Signed in successfully as ${data.user.name}`);
    } catch (err) {
      // Graceful fallback to client-side login if API unavailable
      console.warn('Falling back to local session due to:', err.message);
      setUserRole(role);
      localStorage.setItem('camcare_role', role);
      if (role === 'student') {
        setCurrentPage('student-dashboard');
      } else {
        setCurrentPage('admin-dashboard');
      }
      showToast(`Signed in as ${role === 'student' ? studentUser.name : adminUser.name}`);
    }
  };

  const register = async (regData) => {
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(regData)
      });
      setToken(data.token);
      setUserRole('student');
      localStorage.setItem('camcare_token', data.token);
      localStorage.setItem('camcare_role', 'student');
      setStudentUser(data.user);
      setCurrentPage('student-dashboard');
      refreshComplaints(data.token);
      showToast(`Welcome, ${data.user.name}! Account created.`);
      return data.user;
    } catch (err) {
      showToast(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUserRole(null);
    localStorage.removeItem('camcare_token');
    localStorage.removeItem('camcare_role');
    setCurrentPage('auth');
    showToast('Signed out of CamCare');
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateWithFilter = (page, filter) => {
    setStatusFilter(filter || 'All');
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add new complaint
  const addComplaint = async (newComp) => {
    try {
      if (token) {
        const created = await apiFetch('/api/complaints', {
          method: 'POST',
          body: JSON.stringify(newComp)
        });
        setComplaints(prev => [created, ...prev.filter(c => c.id !== created.id)]);
        showToast(`Complaint ${created.id} submitted successfully`);
        return created;
      }
    } catch (err) {
      console.warn('API submission failed, recording locally:', err.message);
    }

    // Local fallback
    const idNumber = complaints.length + 42;
    const complaintObj = {
      id: `C-00${idNumber}`,
      title: newComp.title,
      category: newComp.category,
      urgency: newComp.urgency,
      status: 'Pending',
      assignedTo: 'Unassigned',
      date: new Date().toISOString().split('T')[0],
      agingDays: 0,
      location: newComp.location,
      description: newComp.description,
      photo: newComp.photo || null,
      student: studentUser.name,
      studentId: studentUser.id,
      timeline: [
        {
          step: 'Submitted',
          time: new Date().toISOString().replace('T', ' ').substring(0, 16),
          note: 'Complaint logged into CamCare portal'
        }
      ]
    };
    setComplaints([complaintObj, ...complaints]);
    showToast(`Complaint ${complaintObj.id} submitted successfully`);
    return complaintObj;
  };

  // Update complaint (Admin)
  const updateComplaint = async (id, updates) => {
    try {
      if (token) {
        const updated = await apiFetch(`/api/complaints/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updates)
        });
        setComplaints(prev => prev.map(c => c.id === id ? updated : c));
        refreshStaff(token);
        showToast(`Complaint ${id} updated successfully`);
        return updated;
      }
    } catch (err) {
      console.warn('API complaint update failed, applying locally:', err.message);
    }

    // Local fallback
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        const newTimeline = [...(c.timeline || [])];
        if (updates.status && updates.status !== c.status) {
          newTimeline.push({
            step: updates.status,
            time: new Date().toISOString().replace('T', ' ').substring(0, 16),
            note: updates.note || `Status updated to ${updates.status}`
          });
        } else if (updates.assignedTo && updates.assignedTo !== c.assignedTo) {
          newTimeline.push({
            step: 'Assigned',
            time: new Date().toISOString().replace('T', ' ').substring(0, 16),
            note: `Assigned to ${updates.assignedTo}`
          });
        }
        return { ...c, ...updates, timeline: newTimeline };
      }
      return c;
    }));
    showToast(`Complaint ${id} updated successfully`);
  };

  // Announcements CRUD (Admin)
  const addAnnouncement = async (item) => {
    try {
      if (token) {
        const created = await apiFetch('/api/announcements', {
          method: 'POST',
          body: JSON.stringify(item)
        });
        setAnnouncements(prev => [created, ...prev]);
        showToast('New announcement published');
        return created;
      }
    } catch (err) {
      console.warn('API add announcement failed, applying locally:', err.message);
    }

    const newAnn = {
      id: `ann-${Date.now()}`,
      ...item,
      date: new Date().toISOString().split('T')[0]
    };
    setAnnouncements([newAnn, ...announcements]);
    showToast('New announcement published');
    return newAnn;
  };

  const editAnnouncement = async (id, updatedFields) => {
    try {
      if (token) {
        const updated = await apiFetch(`/api/announcements/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(updatedFields)
        });
        setAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
        showToast('Announcement updated');
        return updated;
      }
    } catch (err) {
      console.warn('API edit announcement failed, applying locally:', err.message);
    }

    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));
    showToast('Announcement updated');
  };

  const deleteAnnouncement = async (id) => {
    try {
      if (token) {
        await apiFetch(`/api/announcements/${id}`, {
          method: 'DELETE'
        });
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        showToast('Announcement removed');
        return;
      }
    } catch (err) {
      console.warn('API delete announcement failed, applying locally:', err.message);
    }

    setAnnouncements(prev => prev.filter(a => a.id !== id));
    showToast('Announcement removed');
  };

  // Update student profile
  const updateProfile = async (data) => {
    try {
      if (token) {
        const updated = await apiFetch('/api/profile/me', {
          method: 'PATCH',
          body: JSON.stringify(data)
        });
        setStudentUser(prev => ({ ...prev, ...updated }));
        showToast('Profile information updated');
        return updated;
      }
    } catch (err) {
      console.warn('API profile update failed, applying locally:', err.message);
    }

    setStudentUser(prev => ({ ...prev, ...data }));
    showToast('Profile information updated');
  };

  // Update admin profile (New requirement parity)
  const updateAdminProfile = async (data) => {
    try {
      if (token) {
        const updated = await apiFetch('/api/profile/me', {
          method: 'PATCH',
          body: JSON.stringify(data)
        });
        setAdminUser(prev => ({ ...prev, ...updated }));
        showToast('Profile information updated');
        return updated;
      }
    } catch (err) {
      console.warn('API admin profile update failed, applying locally:', err.message);
    }

    setAdminUser(prev => ({ ...prev, ...data }));
    showToast('Profile information updated');
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        userRole,
        currentPage,
        statusFilter,
        setStatusFilter,
        navigateTo,
        navigateWithFilter,
        login,
        register,
        logout,
        studentUser,
        adminUser,
        complaints,
        staff,
        announcements,
        addComplaint,
        updateComplaint,
        refreshComplaints,
        refreshStaff,
        refreshAnnouncements,
        addAnnouncement,
        editAnnouncement,
        deleteAnnouncement,
        updateProfile,
        updateAdminProfile,
        toastMessage,
        showToast,
        apiFetch,
        token
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
