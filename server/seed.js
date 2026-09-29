import bcrypt from 'bcryptjs';
import { query, initDb, pool } from './db.js';

export async function seed() {
  await initDb();

  await query('SET FOREIGN_KEY_CHECKS = 0');
  await query('DELETE FROM complaint_timeline');
  await query('DELETE FROM complaints');
  await query('DELETE FROM staff');
  await query('DELETE FROM announcements');
  await query('DELETE FROM users');
  await query('SET FOREIGN_KEY_CHECKS = 1');

  const demoPassword = 'password123';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(demoPassword, salt);

  // 1. Seed Users
  await query(
    `INSERT INTO users (id, role, login_id, password_hash, name, initials, email, phone, department, residence)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['usr-stu-1', 'student', 'STU-2024-892', passwordHash, 'Kwame Mensah', 'KM', 'k.mensah@camcare.edu', '+233 24 555 0192', 'Computer Science & Engineering', 'Hostel B, Room 314']
  );

  await query(
    `INSERT INTO users (id, role, login_id, password_hash, name, initials, email, phone, department, residence)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['usr-adm-1', 'admin', 'ADM-8801', passwordHash, 'Dr. Rita Asante', 'DR', 'r.asante@camcare.edu', '+233 20 555 0881', 'Office of the Dean of Student Affairs', 'Faculty Quarters Block 4']
  );

  // 2. Seed Staff (each staff member has a login account with role 'staff')
  const staffList = [
    ['STF-3001', 'David Mensah', 'DM', 'Facilities', 'd.mensah@camcare.edu', '+233 24 555 3001'],
    ['STF-3002', 'Grace Adjei', 'GA', 'Welfare & Catering', 'g.adjei@camcare.edu', '+233 24 555 3002'],
    ['STF-3003', 'Samuel Tetteh', 'ST', 'IT Services', 's.tetteh@camcare.edu', '+233 24 555 3003'],
    ['STF-3004', 'Abena Quansah', 'AQ', 'Library', 'a.quansah@camcare.edu', '+233 24 555 3004'],
    ['STF-3005', 'Kofi Boateng', 'KB', 'Academic Affairs', 'k.boateng@camcare.edu', '+233 24 555 3005']
  ];

  for (const [id, name, initials, department, email, phone] of staffList) {
    const userId = `usr-stf-${id.slice(4)}`;
    await query(
      `INSERT INTO users (id, role, login_id, password_hash, name, initials, email, phone, department, residence)
       VALUES (?, 'staff', ?, ?, ?, ?, ?, ?, ?, '')`,
      [userId, id, passwordHash, name, initials, email, phone, department]
    );
    await query(
      `INSERT INTO staff (id, name, initials, department, email, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, name, initials, department, email, userId]
    );
  }

  // 3. Seed Announcements
  const announcementsList = [
    ['ann-1', 'Campus Wi-Fi upgrade scheduled for August 5', 'IT', '2026-07-28', '/images/wifi.jpg',
     'The IT department will perform a campus-wide network upgrade starting August 5 from 11 PM to 3 AM. Intermittent outages are expected. Please plan accordingly.',
     'The IT department will perform a comprehensive hardware overhaul across all student residential halls, research labs, and lecture complexes on August 5 from 11 PM to 3 AM. This upgrade introduces enterprise Wi-Fi 6 access points with four-fold concurrency handling and seamless roaming. During this maintenance window, primary network credentials will remain valid, but sporadic reconnects will occur. Emergency wired connections in the 24-hour library study rooms will remain operational throughout the maintenance window.'],
    ['ann-2', 'New complaint resolution SLA policy effective August 1', 'Policy', '2026-07-26', '/images/policy.jpg',
     'All complaints must be acknowledged within 24 hours and resolved within 5 working days. High Priority complaints require resolution within 48 hours.',
     'The University Senate and Student Welfare Directorate have enacted the 2026 CamCare Resolution Guarantee Charter. Under this agreement, all student and faculty complaint submissions must be formally triaged within 24 hours of submission. High Priority and safety-critical tickets escalate straight to department heads after 48 hours without progress. This protocol ensures full accountability across campus services.'],
    ['ann-3', 'Maintenance window: Cafeteria North closed Jul 30\u201331', 'Facilities', '2026-07-25', '/images/cafeteria.jpg',
     'The North Cafeteria will be closed for deep cleaning and equipment maintenance. The South Cafeteria operates with extended hours during this period.',
     'North Hall Dining facilities will pause operations for a scheduled 48-hour deep sanitation and range hood maintenance cycle. During this period, South Dining Hall will feature extended service windows: Lunch 11:30 AM \u2013 4:30 PM and Dinner 5:30 PM \u2013 10:00 PM. Mobile campus meal vouchers will be valid at all student union coffee bistros.'],
    ['ann-4', 'Student welfare survey now open', 'Welfare', '2026-07-23', '/images/students.jpg',
     'The Welfare Office has launched its bi-annual student life survey. Share your feedback on campus safety, mental health services, and hostel living.',
     'Direct student feedback shapes annual university capital allocations. The 2026 Welfare & Facilities Survey is now available in your student portal dashboard. Topics include residential hostel maintenance, late-night transit options, campus counseling availability, and athletic center amenities. Submissions take approximately 5 minutes.']
  ];

  for (const a of announcementsList) {
    await query(
      `INSERT INTO announcements (id, title, category, date, image, snippet, body)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      a
    );
  }

  // 4. Seed Complaints & Timeline
  // Dates are relative to today so open complaints are not all auto-escalated
  // (escalation triggers after 3 days without activity).
  const day = (daysAgo) => new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];
  const at = (daysAgo, time) => `${day(daysAgo)} ${time}`;
  const ADMIN = 'Dr. Rita Asante';
  const staffName = Object.fromEntries(staffList.map(([id, name]) => [id, name]));

  const complaintsList = [
    {
      id: 'C-0041', title: 'Broken projector in Room 204', category: 'Facilities', urgency: 'High',
      status: 'In Progress', staffId: 'STF-3001', daysAgo: 3,
      location: 'Science Block B, Room 204',
      description: 'The ceiling mounted Epson projector will not power on and HDMI connection is loose. Professors cannot project lecture slides.',
      studentName: 'Kwame Mensah', studentLoginId: 'STU-2024-892',
      timeline: [
        ['Submitted', at(3, '09:15'), 'Complaint logged into CamCare portal', 'Kwame Mensah'],
        ['Verified', at(3, '10:30'), 'Complaint verified by administration', ADMIN],
        ['Assigned', at(3, '11:00'), 'Assigned to David Mensah', ADMIN],
        ['In Progress', at(1, '14:20'), 'Replacement bulb and HDMI cable ordered', 'David Mensah']
      ]
    },
    {
      id: 'C-0040', title: 'Insufficient seating in the library', category: 'Library', urgency: 'Medium',
      status: 'Pending', staffId: null, daysAgo: 1,
      location: 'Central Library 2nd Floor',
      description: 'During peak study hours between 2 PM and 6 PM, student count exceeds chairs. Several students have to sit on hallway carpet.',
      studentName: 'Kwame Mensah', studentLoginId: 'STU-2024-892',
      timeline: [
        ['Submitted', at(1, '15:40'), 'Complaint logged into CamCare portal', 'Kwame Mensah']
      ]
    },
    {
      id: 'C-0039', title: 'Cafeteria food quality complaints', category: 'Catering', urgency: 'Critical',
      status: 'High Priority', staffId: 'STF-3002', daysAgo: 8,
      location: 'North Dining Hall',
      description: 'Repeated instances of cold meals, inadequate hygiene at the self-serve soup station, and lack of vegetarian options.',
      studentName: 'Kwame Mensah', studentLoginId: 'STU-2024-892',
      timeline: [
        ['Submitted', at(8, '12:30'), 'Complaint logged into CamCare portal', 'Kwame Mensah'],
        ['Verified', at(8, '13:00'), 'Verified and marked Critical', ADMIN],
        ['Assigned', at(7, '08:30'), 'Assigned to Grace Adjei', ADMIN],
        ['Escalated', at(4, '09:00'), 'Automatically escalated to High Priority — no activity for more than 3 days.', 'System']
      ]
    },
    {
      id: 'C-0038', title: 'Wi-Fi dead zones in Hostel C', category: 'IT', urgency: 'High',
      status: 'Resolved', staffId: 'STF-3003', daysAgo: 10,
      location: 'Hostel C Floors 2 & 3',
      description: 'Signal cuts off in the study lounges. Packet drop rate over 60% during evening coursework hours.',
      studentName: 'Kwame Mensah', studentLoginId: 'STU-2024-892',
      timeline: [
        ['Submitted', at(10, '18:00'), 'Complaint logged into CamCare portal', 'Kwame Mensah'],
        ['Verified', at(9, '08:45'), 'Complaint verified by administration', ADMIN],
        ['Assigned', at(9, '09:00'), 'Assigned to Samuel Tetteh', ADMIN],
        ['In Progress', at(8, '10:00'), 'Site survey completed on Floors 2 and 3', 'Samuel Tetteh'],
        ['Resolved', at(6, '16:45'), 'New Wi-Fi 6 access point installed on Floor 3', 'Samuel Tetteh']
      ]
    },
    {
      id: 'C-0037', title: 'Leaking roof in Lecture Hall A', category: 'Facilities', urgency: 'Critical',
      status: 'Verified', staffId: null, daysAgo: 2,
      location: 'Lecture Hall A',
      description: 'Rain water dripping onto rows 4 and 5 near electrical wiring conduits, causing severe hazard during thunderstorms.',
      studentName: 'Ama Serwah', studentLoginId: 'STU-2024-512',
      timeline: [
        ['Submitted', at(2, '11:10'), 'Complaint logged into CamCare portal', 'Ama Serwah'],
        ['Verified', at(1, '09:00'), 'Confirmed on site; awaiting contractor availability', ADMIN]
      ]
    },
    {
      id: 'C-0036', title: 'Sports court lighting failure', category: 'Facilities', urgency: 'Medium',
      status: 'Pending', staffId: null, daysAgo: 0,
      location: 'Outdoor Basketball Court',
      description: 'Timer relay tripped; floodlights do not turn on for intramural sports after sunset.',
      studentName: 'John Doe', studentLoginId: 'STU-2024-332',
      timeline: [
        ['Submitted', at(0, '00:15'), 'Complaint logged into CamCare portal', 'John Doe']
      ]
    },
    {
      id: 'C-0035', title: 'Harassment by security personnel', category: 'Welfare', urgency: 'Critical',
      status: 'Assigned', staffId: 'STF-3002', daysAgo: 2,
      location: 'Main Gate Checkpoint',
      description: 'Hostile screening and aggressive detention of students arriving after 10 PM library shifts.',
      studentName: 'Sarah Jenkins', studentLoginId: 'STU-2024-118',
      timeline: [
        ['Submitted', at(2, '23:45'), 'Confidential complaint logged', 'Sarah Jenkins'],
        ['Verified', at(1, '09:30'), 'Complaint verified by administration', ADMIN],
        ['Assigned', at(1, '09:35'), 'Assigned to Grace Adjei', ADMIN]
      ]
    },
    {
      id: 'C-0034', title: 'Missing equipment from Science lab', category: 'Academic', urgency: 'High',
      status: 'Resolved', staffId: null, daysAgo: 12,
      location: 'Chemistry Lab 3',
      description: 'Two precision digital analytical balances missing from student bench stations.',
      studentName: 'Michael Chen', studentLoginId: 'STU-2024-741',
      timeline: [
        ['Submitted', at(12, '10:00'), 'Complaint logged into CamCare portal', 'Michael Chen'],
        ['Verified', at(12, '11:00'), 'Complaint verified by administration', ADMIN],
        ['Resolved', at(11, '15:30'), 'Balances found in the calibration department and returned', ADMIN]
      ]
    },
    {
      id: 'C-0033', title: 'Projector not working in Science Block', category: 'Facilities', urgency: 'Low',
      status: 'Rejected', staffId: null, daysAgo: 3,
      location: 'Science Block B',
      description: 'Projector in one of the Science Block rooms is not turning on.',
      studentName: 'Kwame Mensah', studentLoginId: 'STU-2024-892',
      timeline: [
        ['Submitted', at(3, '09:20'), 'Complaint logged into CamCare portal', 'Kwame Mensah'],
        ['Rejected', at(3, '10:35'), 'Duplicate of C-0041, which is already being handled', ADMIN]
      ]
    },
    {
      id: 'C-0032', title: 'Library printer out of toner', category: 'Library', urgency: 'Low',
      status: 'Resolved', staffId: 'STF-3004', daysAgo: 5,
      location: 'Central Library Ground Floor',
      description: 'The self-service printer near the entrance prints blank pages.',
      studentName: 'Kwame Mensah', studentLoginId: 'STU-2024-892',
      timeline: [
        ['Submitted', at(5, '13:00'), 'Complaint logged into CamCare portal', 'Kwame Mensah'],
        ['Verified', at(5, '14:00'), 'Complaint verified by administration', ADMIN],
        ['Assigned', at(5, '14:05'), 'Assigned to Abena Quansah', ADMIN],
        ['Resolved', at(4, '10:10'), 'Toner cartridge replaced and test page printed', 'Abena Quansah']
      ]
    },
    {
      id: 'C-0031', title: 'Lab computers cannot sign in', category: 'IT', urgency: 'Medium',
      status: 'In Progress', staffId: 'STF-3003', daysAgo: 2,
      location: 'Computer Lab 2',
      description: 'About half of the lab PCs show a domain trust error at the login screen.',
      studentName: 'John Doe', studentLoginId: 'STU-2024-332',
      timeline: [
        ['Submitted', at(2, '09:00'), 'Complaint logged into CamCare portal', 'John Doe'],
        ['Verified', at(2, '09:55'), 'Complaint verified by administration', ADMIN],
        ['Assigned', at(2, '10:00'), 'Assigned to Samuel Tetteh', ADMIN],
        ['In Progress', at(1, '11:30'), 'Re-joining affected machines to the domain', 'Samuel Tetteh']
      ]
    },
    {
      id: 'C-0030', title: 'Broken window latch in Hostel B', category: 'Facilities', urgency: 'Medium',
      status: 'Assigned', staffId: 'STF-3001', daysAgo: 1,
      location: 'Hostel B, Room 314',
      description: 'The window latch is broken and the window cannot be closed securely.',
      studentName: 'Kwame Mensah', studentLoginId: 'STU-2024-892',
      timeline: [
        ['Submitted', at(1, '08:00'), 'Complaint logged into CamCare portal', 'Kwame Mensah'],
        ['Verified', at(1, '09:10'), 'Complaint verified by administration', ADMIN],
        ['Assigned', at(1, '09:15'), 'Assigned to David Mensah', ADMIN]
      ]
    }
  ];

  for (const c of complaintsList) {
    const createdAt = `${c.timeline[0][1]}:00`;
    const lastActivityAt = `${c.timeline[c.timeline.length - 1][1]}:00`;
    await query(
      `INSERT INTO complaints (id, title, category, urgency, status, assigned_to, assigned_staff_id, date, location, description, student_name, student_login_id, photo, created_at, last_activity_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
      [c.id, c.title, c.category, c.urgency, c.status, c.staffId ? staffName[c.staffId] : 'Unassigned', c.staffId, day(c.daysAgo), c.location, c.description, c.studentName, c.studentLoginId, createdAt, lastActivityAt]
    );

    for (const [step, time, note, actor] of c.timeline) {
      await query(
        `INSERT INTO complaint_timeline (complaint_id, step, time, note, actor) VALUES (?, ?, ?, ?, ?)`,
        [c.id, step, time, note, actor]
      );
    }
  }

  console.log('Database seeded successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seed().then(() => pool.end()).catch(err => { console.error(err); process.exit(1); });
}
