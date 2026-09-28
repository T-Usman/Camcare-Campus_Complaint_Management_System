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

  // 2. Seed Staff
  const staffList = [
    ['STF-01', 'David Mensah', 'DM', 'Facilities', 'd.mensah@camcare.edu', 5, 23],
    ['STF-02', 'Grace Adjei', 'GA', 'Welfare & Catering', 'g.adjei@camcare.edu', 3, 18],
    ['STF-03', 'Samuel Tetteh', 'ST', 'IT Services', 's.tetteh@camcare.edu', 2, 31],
    ['STF-04', 'Abena Quansah', 'AQ', 'Library', 'a.quansah@camcare.edu', 1, 12],
    ['STF-05', 'Kofi Boateng', 'KB', 'Academic Affairs', 'k.boateng@camcare.edu', 0, 9]
  ];

  for (const s of staffList) {
    await query(
      `INSERT INTO staff (id, name, initials, department, email, active_count, resolved_count)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      s
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
  const complaintsList = [
    {
      id: 'C-0041', title: 'Broken projector in Room 204', category: 'Facilities', urgency: 'High',
      status: 'In Progress', assignedTo: 'David Mensah', date: '2026-07-25',
      location: 'Science Block B, Room 204',
      description: 'The ceiling mounted Epson projector will not power on and HDMI connection is loose. Professors cannot project lecture slides.',
      studentName: 'Kwame Mensah', studentLoginId: 'STU-2024-892', photo: null,
      createdAt: '2026-07-25 09:15:00', lastActivityAt: '2026-07-26 14:20:00',
      timeline: [
        ['Submitted', '2026-07-25 09:15', 'Complaint logged by Kwame Mensah'],
        ['Triaged', '2026-07-25 10:30', 'Marked as High urgency by Administration'],
        ['Assigned', '2026-07-25 11:00', 'Assigned to Facilities officer David Mensah'],
        ['In Progress', '2026-07-26 14:20', 'Replacement bulb and cable ordered']
      ]
    },
    {
      id: 'C-0040', title: 'Insufficient seating in the library', category: 'Library', urgency: 'Medium',
      status: 'Pending', assignedTo: 'Unassigned', date: '2026-07-27',
      location: 'Central Library 2nd Floor',
      description: 'During peak study hours between 2 PM and 6 PM, student count exceeds chairs. Several students have to sit on hallway carpet.',
      studentName: 'Kwame Mensah', studentLoginId: 'STU-2024-892', photo: null,
      createdAt: '2026-07-27 15:40:00', lastActivityAt: '2026-07-27 16:10:00',
      timeline: [
        ['Submitted', '2026-07-27 15:40', 'Complaint logged by Kwame Mensah'],
        ['Triaged', '2026-07-27 16:10', 'Classified under Library facilities']
      ]
    },
    {
      id: 'C-0039', title: 'Cafeteria food quality complaints', category: 'Catering', urgency: 'Critical',
      status: 'High Priority', assignedTo: 'Grace Adjei', date: '2026-07-22',
      location: 'North Dining Hall',
      description: 'Repeated instances of cold meals, inadequate hygiene at the self-serve soup station, and lack of vegetarian options.',
      studentName: 'Kwame Mensah', studentLoginId: 'STU-2024-892', photo: null,
      createdAt: '2026-07-22 12:30:00', lastActivityAt: '2026-07-26 09:00:00',
      timeline: [
        ['Submitted', '2026-07-22 12:30', 'Complaint logged by Kwame Mensah'],
        ['Triaged', '2026-07-22 13:00', 'Escalated to Critical urgency'],
        ['Assigned', '2026-07-23 08:30', 'Assigned to Catering Manager Grace Adjei'],
        ['Escalated', '2026-07-26 09:00', 'Escalated to High Priority \u2014 unanswered for 3+ days']
      ]
    },
    {
      id: 'C-0038', title: 'Wi-Fi dead zones in Hostel C', category: 'IT', urgency: 'High',
      status: 'Resolved', assignedTo: 'Samuel Tetteh', date: '2026-07-20',
      location: 'Hostel C Floors 2 & 3',
      description: 'Signal cuts off in the study lounges. Packet drop rate over 60% during evening coursework hours.',
      studentName: 'Kwame Mensah', studentLoginId: 'STU-2024-892', photo: null,
      createdAt: '2026-07-20 18:00:00', lastActivityAt: '2026-07-24 16:45:00',
      timeline: [
        ['Submitted', '2026-07-20 18:00', 'Complaint logged by Kwame Mensah'],
        ['Assigned', '2026-07-21 09:00', 'Assigned to IT Network Team (Samuel Tetteh)'],
        ['Resolved', '2026-07-24 16:45', 'New Wi-Fi 6 access point installed on Floor 3']
      ]
    },
    {
      id: 'C-0037', title: 'Leaking roof in Lecture Hall A', category: 'Facilities', urgency: 'Critical',
      status: 'High Priority', assignedTo: 'David Mensah', date: '2026-07-21',
      location: 'Lecture Hall A',
      description: 'Rain water dripping onto rows 4 and 5 near electrical wiring conduits, causing severe hazard during thunderstorms.',
      studentName: 'Ama Serwah', studentLoginId: 'STU-2024-512', photo: null,
      createdAt: '2026-07-21 11:10:00', lastActivityAt: '2026-07-25 09:00:00',
      timeline: [
        ['Submitted', '2026-07-21 11:10', 'Complaint logged'],
        ['Escalated', '2026-07-25 09:00', 'Escalated due to roof contractor delays']
      ]
    },
    {
      id: 'C-0036', title: 'Sports court lighting failure', category: 'Facilities', urgency: 'Medium',
      status: 'Pending', assignedTo: 'Unassigned', date: '2026-07-28',
      location: 'Outdoor Basketball Court',
      description: 'Timer relay tripped; floodlights do not turn on for intramural sports after sunset.',
      studentName: 'John Doe', studentLoginId: 'STU-2024-332', photo: null,
      createdAt: '2026-07-28 20:15:00', lastActivityAt: '2026-07-28 20:15:00',
      timeline: [
        ['Submitted', '2026-07-28 20:15', 'Complaint logged']
      ]
    },
    {
      id: 'C-0035', title: 'Harassment by security personnel', category: 'Welfare', urgency: 'Critical',
      status: 'In Progress', assignedTo: 'Grace Adjei', date: '2026-07-24',
      location: 'Main Gate Checkpoint',
      description: 'Hostile screening and aggressive detention of students arriving after 10 PM library shifts.',
      studentName: 'Sarah Jenkins', studentLoginId: 'STU-2024-118', photo: null,
      createdAt: '2026-07-24 23:45:00', lastActivityAt: '2026-07-25 14:00:00',
      timeline: [
        ['Submitted', '2026-07-24 23:45', 'Confidential complaint logged'],
        ['In Progress', '2026-07-25 14:00', 'Security shift supervisor interviewed']
      ]
    },
    {
      id: 'C-0034', title: 'Missing equipment from Science lab', category: 'Academic', urgency: 'High',
      status: 'Resolved', assignedTo: 'Samuel Tetteh', date: '2026-07-18',
      location: 'Chemistry Lab 3',
      description: 'Two precision digital analytical balances missing from student bench stations.',
      studentName: 'Michael Chen', studentLoginId: 'STU-2024-741', photo: null,
      createdAt: '2026-07-18 10:00:00', lastActivityAt: '2026-07-19 15:30:00',
      timeline: [
        ['Submitted', '2026-07-18 10:00', 'Reported by lab assistant'],
        ['Resolved', '2026-07-19 15:30', 'Found in calibration department']
      ]
    }
  ];

  for (const c of complaintsList) {
    await query(
      `INSERT INTO complaints (id, title, category, urgency, status, assigned_to, date, location, description, student_name, student_login_id, photo, created_at, last_activity_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.title, c.category, c.urgency, c.status, c.assignedTo, c.date, c.location, c.description, c.studentName, c.studentLoginId, c.photo, c.createdAt, c.lastActivityAt]
    );

    for (const [step, time, note] of c.timeline) {
      await query(
        `INSERT INTO complaint_timeline (complaint_id, step, time, note) VALUES (?, ?, ?, ?)`,
        [c.id, step, time, note]
      );
    }
  }

  console.log('Database seeded successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seed().then(() => pool.end()).catch(err => { console.error(err); process.exit(1); });
}
