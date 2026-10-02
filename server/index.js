import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query, initDb } from './db.js';

dotenv.config();

await initDb();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'camcare_jwt_super_secret_key_2026';

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// --------------------------------------------------------------------------
// Auth Middleware
// --------------------------------------------------------------------------
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' });
    }
    next();
  };
}

const requireAdmin = requireRole('admin');

function nowStamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 16);
}

function toInitials(name) {
  return name.split(' ').filter(Boolean).map(p => p[0].toUpperCase()).slice(0, 2).join('');
}

async function addTimelineEntry(complaintId, step, note, actor) {
  await query(
    'INSERT INTO complaint_timeline (complaint_id, step, time, note, actor) VALUES (?, ?, ?, ?, ?)',
    [complaintId, step, nowStamp(), note, actor || null]
  );
}

async function getStaffIdForUser(userId) {
  const rows = await query('SELECT id FROM staff WHERE user_id = ?', [userId]);
  return rows[0] ? rows[0].id : null;
}

// --------------------------------------------------------------------------
// Complaint Workflow
//   Student submits (Pending) -> Admin verifies (Verified) or rejects (Rejected)
//   -> Admin resolves directly (Resolved) or assigns staff (Assigned)
//   -> Assigned staff starts work (In Progress) and resolves (Resolved).
// High Priority is set by auto-escalation; the available actions then depend
// on whether a staff member is already assigned.
// Mirrored on the frontend in src/components/complaints/complaintWorkflow.js.
// --------------------------------------------------------------------------
function getAllowedActions(comp, role) {
  const assigned = Boolean(comp.assigned_staff_id);

  if (role === 'admin') {
    switch (comp.status) {
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
    switch (comp.status) {
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

// --------------------------------------------------------------------------
// Business Logic: 3+ Days Unanswered Auto-Escalation Check
// --------------------------------------------------------------------------
const ESCALATION_CONDITION = `status IN ('Pending', 'Verified', 'Assigned', 'In Progress')
      AND last_activity_at <= NOW() - INTERVAL 3 DAY`;

async function runAutoEscalationCheck() {
  const eligible = await query(`SELECT id FROM complaints WHERE ${ESCALATION_CONDITION}`);

  for (const item of eligible) {
    // Re-check the condition in the UPDATE so concurrent requests (e.g. the
    // two complaint fetches fired on login) escalate each complaint only once.
    const result = await query(
      `UPDATE complaints SET status = 'High Priority', last_activity_at = NOW() WHERE id = ? AND ${ESCALATION_CONDITION}`,
      [item.id]
    );
    if (result.affectedRows === 1) {
      await addTimelineEntry(item.id, 'Escalated', 'Automatically escalated to High Priority \u2014 no activity for more than 3 days.', 'System');
    }
  }
}

async function getComplaintWithTimeline(complaintId) {
  const rows = await query('SELECT * FROM complaints WHERE id = ?', [complaintId]);
  const comp = rows[0];
  if (!comp) return null;

  const timeline = await query('SELECT step, time, note, actor FROM complaint_timeline WHERE complaint_id = ? ORDER BY id ASC', [complaintId]);

  const createdDate = new Date(comp.date);
  const today = new Date();
  const diffTime = Math.abs(today - createdDate);
  const agingDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return {
    id: comp.id,
    title: comp.title,
    category: comp.category,
    urgency: comp.urgency,
    status: comp.status,
    assignedTo: comp.assigned_to,
    assignedStaffId: comp.assigned_staff_id,
    date: comp.date,
    agingDays,
    location: comp.location,
    description: comp.description,
    student: comp.student_name,
    studentId: comp.student_login_id,
    photo: comp.photo,
    timeline
  };
}

// --------------------------------------------------------------------------
// Auth Routes
// --------------------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  const { role, loginId, password } = req.body;

  if (!loginId || !password) {
    return res.status(400).json({ error: 'Login ID and password are required' });
  }

  const users = await query('SELECT * FROM users WHERE LOWER(login_id) = LOWER(?) OR LOWER(email) = LOWER(?)', [loginId, loginId]);
  const user = users[0];

  if (!user) {
    return res.status(401).json({ error: 'User account not found' });
  }

  if (role && user.role !== role) {
    return res.status(403).json({ error: `Account exists but is not registered as a ${role}` });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const staffId = user.role === 'staff' ? await getStaffIdForUser(user.id) : null;
  if (user.role === 'staff' && !staffId) {
    return res.status(403).json({ error: 'Staff account is not linked to a staff record' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, loginId: user.login_id, name: user.name, email: user.email, staffId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.login_id,
      staffId,
      role: user.role,
      name: user.name,
      initials: user.initials,
      email: user.email,
      phone: user.phone,
      department: user.department,
      residence: user.residence
    }
  });
});

app.post('/api/auth/register', async (req, res) => {
  const { loginId, password, name, email, phone, department, residence } = req.body;

  if (!loginId || !password || !name || !email) {
    return res.status(400).json({ error: 'Student ID, password, full name, and email are required' });
  }

  const existing = await query('SELECT id FROM users WHERE LOWER(login_id) = LOWER(?) OR LOWER(email) = LOWER(?)', [loginId, email]);
  if (existing.length > 0) {
    return res.status(400).json({ error: 'An account with this ID or email already exists' });
  }

  const initials = toInitials(name);
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const userId = `usr-stu-${Date.now()}`;

  await query(
    `INSERT INTO users (id, role, login_id, password_hash, name, initials, email, phone, department, residence)
     VALUES (?, 'student', ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, loginId, passwordHash, name, initials, email, phone || '', department || 'General Undergraduate', residence || '']
  );

  const token = jwt.sign(
    { id: userId, role: 'student', loginId, name, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: {
      id: loginId,
      role: 'student',
      name,
      initials,
      email,
      phone: phone || '',
      department: department || 'General Undergraduate',
      residence: residence || ''
    }
  });
});

// --------------------------------------------------------------------------
// Complaints Routes
// --------------------------------------------------------------------------
app.get('/api/complaints', authenticateToken, async (req, res) => {
  await runAutoEscalationCheck();

  let complaintIds;
  if (req.user.role === 'admin') {
    complaintIds = await query('SELECT id FROM complaints ORDER BY created_at DESC');
  } else if (req.user.role === 'staff') {
    complaintIds = await query('SELECT id FROM complaints WHERE assigned_staff_id = ? ORDER BY created_at DESC', [req.user.staffId]);
  } else {
    complaintIds = await query('SELECT id FROM complaints WHERE student_login_id = ? ORDER BY created_at DESC', [req.user.loginId]);
  }

  const results = await Promise.all(complaintIds.map(row => getComplaintWithTimeline(row.id)));
  res.json(results);
});

app.get('/api/complaints/:id', authenticateToken, async (req, res) => {
  await runAutoEscalationCheck();

  const comp = await getComplaintWithTimeline(req.params.id);
  if (!comp) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  // Students see only their own complaints; staff only those assigned to them
  const canView =
    req.user.role === 'admin' ||
    (req.user.role === 'staff' && comp.assignedStaffId === req.user.staffId) ||
    (req.user.role === 'student' && comp.studentId === req.user.loginId);
  if (!canView) {
    return res.status(403).json({ error: 'Access denied to this complaint' });
  }

  res.json(comp);
});

app.post('/api/complaints', authenticateToken, requireRole('student'), async (req, res) => {
  const { title, category, urgency, location, description, photo } = req.body;

  if (!title || !category || !urgency || !location || !description) {
    return res.status(400).json({ error: 'Title, category, urgency, location, and description are required' });
  }

  const countRows = await query('SELECT COUNT(*) as count FROM complaints');
  const nextNumber = countRows[0].count + 42;
  const complaintId = `C-00${nextNumber}`;

  const todayStr = new Date().toISOString().split('T')[0];

  await query(
    `INSERT INTO complaints (id, title, category, urgency, status, assigned_to, date, location, description, student_name, student_login_id, photo, created_at, last_activity_at)
     VALUES (?, ?, ?, ?, 'Pending', 'Unassigned', ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [complaintId, title, category, urgency, todayStr, location, description, req.user.name, req.user.loginId, photo || null]
  );

  await addTimelineEntry(complaintId, 'Submitted', 'Complaint logged into CamCare portal', req.user.name);

  const created = await getComplaintWithTimeline(complaintId);
  res.status(201).json(created);
});

// Adds the 'Verified' timeline step when an admin acts on a complaint nobody
// has verified yet: a new Pending one, or one auto-escalated to High Priority
// before it was ever verified or assigned.
async function recordVerificationIfNeeded(comp, actor) {
  if (comp.assigned_staff_id || !['Pending', 'High Priority'].includes(comp.status)) return;
  const rows = await query(
    "SELECT 1 FROM complaint_timeline WHERE complaint_id = ? AND step = 'Verified' LIMIT 1",
    [comp.id]
  );
  if (rows.length === 0) {
    await addTimelineEntry(comp.id, 'Verified', 'Complaint verified by administration', actor);
  }
}

// Workflow actions: reject | assign (verifies if needed) | start | resolve | note
// Body: { action, staffId?, note? }
app.patch('/api/complaints/:id', authenticateToken, requireRole('admin', 'staff'), async (req, res) => {
  const complaintId = req.params.id;
  const { action, staffId } = req.body;
  const note = (req.body.note || '').trim();
  const { role, name: actor } = req.user;

  const compRows = await query('SELECT * FROM complaints WHERE id = ?', [complaintId]);
  const comp = compRows[0];
  if (!comp) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  if (role === 'staff' && comp.assigned_staff_id !== req.user.staffId) {
    return res.status(403).json({ error: 'This complaint is not assigned to you' });
  }

  if (!getAllowedActions(comp, role).includes(action)) {
    return res.status(400).json({ error: `Action "${action}" is not allowed on a complaint that is ${comp.status}` });
  }

  const setStatus = (status) =>
    query('UPDATE complaints SET status = ?, last_activity_at = NOW() WHERE id = ?', [status, complaintId]);

  switch (action) {
    case 'reject': {
      if (!note) {
        return res.status(400).json({ error: 'A reason is required to reject a complaint' });
      }
      await setStatus('Rejected');
      await addTimelineEntry(complaintId, 'Rejected', note, actor);
      break;
    }

    case 'assign': {
      const staffRows = await query('SELECT id, name FROM staff WHERE id = ?', [staffId || '']);
      const member = staffRows[0];
      if (!member) {
        return res.status(400).json({ error: 'Select a valid staff member to assign' });
      }
      if (member.id === comp.assigned_staff_id) {
        return res.status(400).json({ error: `Complaint is already assigned to ${member.name}` });
      }
      await recordVerificationIfNeeded(comp, actor);
      await query(
        "UPDATE complaints SET status = 'Assigned', assigned_staff_id = ?, assigned_to = ?, last_activity_at = NOW() WHERE id = ?",
        [member.id, member.name, complaintId]
      );
      const step = comp.assigned_staff_id ? 'Reassigned' : 'Assigned';
      await addTimelineEntry(complaintId, step, `Assigned to ${member.name}${note ? ` — ${note}` : ''}`, actor);
      break;
    }

    case 'start': {
      await setStatus('In Progress');
      await addTimelineEntry(complaintId, 'In Progress', note || `Work started by ${actor}`, actor);
      break;
    }

    case 'resolve': {
      if (role === 'staff' && !note) {
        return res.status(400).json({ error: 'Describe how the issue was resolved' });
      }
      if (role === 'admin') {
        await recordVerificationIfNeeded(comp, actor);
      }
      await setStatus('Resolved');
      await addTimelineEntry(complaintId, 'Resolved', note || `Resolved by ${actor}`, actor);
      break;
    }

    case 'note': {
      if (!note) {
        return res.status(400).json({ error: 'Note cannot be empty' });
      }
      await query('UPDATE complaints SET last_activity_at = NOW() WHERE id = ?', [complaintId]);
      await addTimelineEntry(complaintId, 'Update', note, actor);
      break;
    }
  }

  const updated = await getComplaintWithTimeline(complaintId);
  res.json(updated);
});

// --------------------------------------------------------------------------
// Staff Routes
// --------------------------------------------------------------------------
async function listStaff() {
  const rows = await query(`
    SELECT s.id, s.name, s.initials, s.department, s.email, u.login_id,
      (SELECT COUNT(*) FROM complaints c WHERE c.assigned_staff_id = s.id AND c.status NOT IN ('Resolved', 'Rejected')) AS active_count,
      (SELECT COUNT(*) FROM complaints c WHERE c.assigned_staff_id = s.id AND c.status = 'Resolved') AS resolved_count
    FROM staff s
    LEFT JOIN users u ON u.id = s.user_id
    ORDER BY s.name ASC
  `);
  return rows.map(s => ({
    id: s.id,
    name: s.name,
    initials: s.initials,
    department: s.department,
    email: s.email,
    loginId: s.login_id,
    activeCount: Number(s.active_count),
    resolvedCount: Number(s.resolved_count)
  }));
}

app.get('/api/staff', authenticateToken, requireAdmin, async (req, res) => {
  res.json(await listStaff());
});

// Admin creates a staff member together with their login account
app.post('/api/staff', authenticateToken, requireAdmin, async (req, res) => {
  const { name, email, department, phone, password } = req.body;

  if (!name || !email || !department || !password) {
    return res.status(400).json({ error: 'Name, email, department, and password are required' });
  }

  const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email]);
  if (existing.length > 0) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const maxRows = await query("SELECT MAX(CAST(SUBSTRING(login_id, 5) AS UNSIGNED)) AS n FROM users WHERE login_id LIKE 'STF-%'");
  const loginId = `STF-${Math.max(Number(maxRows[0].n) || 3000, 3000) + 1}`;
  const userId = `usr-stf-${Date.now()}`;
  const initials = toInitials(name);
  const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

  await query(
    `INSERT INTO users (id, role, login_id, password_hash, name, initials, email, phone, department, residence)
     VALUES (?, 'staff', ?, ?, ?, ?, ?, ?, ?, '')`,
    [userId, loginId, passwordHash, name, initials, email, phone || '', department]
  );
  await query(
    'INSERT INTO staff (id, name, initials, department, email, user_id) VALUES (?, ?, ?, ?, ?, ?)',
    [loginId, name, initials, department, email, userId]
  );

  const created = (await listStaff()).find(s => s.id === loginId);
  res.status(201).json(created);
});

// --------------------------------------------------------------------------
// Announcements Routes
// --------------------------------------------------------------------------
const ANNOUNCEMENT_FIELDS = {
  title: { label: 'Title', max: 255 },
  category: { label: 'Category', max: 100 },
  snippet: { label: 'Summary', max: 1000 },
  body: { label: 'Full text', max: 10000 },
  image: { label: 'Image', max: 255 }
};

// Trims the announcement fields present in `input`. With `requireAll`, every
// field except image must be present; either way a present field may not be
// blank or over its length limit. Returns { values } or { error }.
function readAnnouncementFields(input, requireAll) {
  const values = {};
  for (const [key, { label, max }] of Object.entries(ANNOUNCEMENT_FIELDS)) {
    const raw = input?.[key];
    if (raw === undefined || raw === null) {
      if (requireAll && key !== 'image') return { error: `${label} is required` };
      values[key] = null;
      continue;
    }
    const value = String(raw).trim();
    if (!value) return { error: `${label} cannot be empty` };
    if (value.length > max) return { error: `${label} must be at most ${max} characters` };
    values[key] = value;
  }
  return { values };
}

app.get('/api/announcements', async (req, res) => {
  const rows = await query(
    'SELECT id, title, category, date, image, snippet, body FROM announcements ORDER BY date DESC, created_at DESC, id DESC'
  );
  res.json(rows);
});

app.post('/api/announcements', authenticateToken, requireAdmin, async (req, res) => {
  const { values, error } = readAnnouncementFields(req.body, true);
  if (error) {
    return res.status(400).json({ error });
  }
  const { title, category, snippet, body, image } = values;

  const id = `ann-${Date.now()}`;
  const dateStr = new Date().toISOString().split('T')[0];

  await query(
    'INSERT INTO announcements (id, title, category, date, image, snippet, body) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, title, category, dateStr, image || '/images/campus-hero.jpg', snippet, body]
  );

  const created = await query('SELECT id, title, category, date, image, snippet, body FROM announcements WHERE id = ?', [id]);
  res.status(201).json(created[0]);
});

app.patch('/api/announcements/:id', authenticateToken, requireAdmin, async (req, res) => {
  const annId = req.params.id;
  const { values, error } = readAnnouncementFields(req.body, false);
  if (error) {
    return res.status(400).json({ error });
  }
  const { title, category, snippet, body, image } = values;

  const existing = await query('SELECT id FROM announcements WHERE id = ?', [annId]);
  if (existing.length === 0) {
    return res.status(404).json({ error: 'Announcement not found' });
  }

  await query(
    `UPDATE announcements
     SET title = COALESCE(?, title),
         category = COALESCE(?, category),
         snippet = COALESCE(?, snippet),
         body = COALESCE(?, body),
         image = COALESCE(?, image)
     WHERE id = ?`,
    [title, category, snippet, body, image, annId]
  );

  const updated = await query('SELECT id, title, category, date, image, snippet, body FROM announcements WHERE id = ?', [annId]);
  res.json(updated[0]);
});

app.delete('/api/announcements/:id', authenticateToken, requireAdmin, async (req, res) => {
  const annId = req.params.id;
  const result = await query('DELETE FROM announcements WHERE id = ?', [annId]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Announcement not found' });
  }
  res.json({ message: 'Announcement deleted successfully' });
});

// --------------------------------------------------------------------------
// Reports & Analytics Route
// --------------------------------------------------------------------------
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

app.get('/api/reports/summary', authenticateToken, requireAdmin, async (req, res) => {
  const monthlyRows = await query(`
    SELECT
      SUBSTRING(date, 1, 7) as ym,
      COUNT(*) as submitted,
      SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
    FROM complaints
    GROUP BY ym
    ORDER BY ym ASC
  `);

  const monthly = monthlyRows.map(row => {
    const monthIndex = parseInt(row.ym.split('-')[1], 10) - 1;
    return { month: MONTH_LABELS[monthIndex] || row.ym, submitted: row.submitted, resolved: row.resolved };
  });

  const resolutionTrend = monthlyRows.map(row => {
    const monthIndex = parseInt(row.ym.split('-')[1], 10) - 1;
    return { month: MONTH_LABELS[monthIndex] || row.ym, rate: row.submitted > 0 ? Math.round((row.resolved / row.submitted) * 100) : 0 };
  });

  const categoryCounts = await query(`
    SELECT category, COUNT(*) as count
    FROM complaints
    GROUP BY category
    ORDER BY count DESC
  `);

  const totalRows = await query('SELECT COUNT(*) as total FROM complaints');
  const totalCount = totalRows[0].total;
  const resolvedRows = await query("SELECT COUNT(*) as resolved FROM complaints WHERE status = 'Resolved'");
  const resolvedCount = resolvedRows[0].resolved;

  const resolvedDurations = await query(`
    SELECT
      c.id,
      MIN(CASE WHEN t.step = 'Submitted' THEN t.time END) as submitted_time,
      MAX(CASE WHEN t.step = 'Resolved' THEN t.time END) as resolved_time
    FROM complaints c
    JOIN complaint_timeline t ON t.complaint_id = c.id
    WHERE c.status = 'Resolved'
    GROUP BY c.id
    HAVING submitted_time IS NOT NULL AND resolved_time IS NOT NULL
  `);

  let avgResolutionTime = 'N/A';
  if (resolvedDurations.length > 0) {
    const totalDays = resolvedDurations.reduce((sum, row) => {
      const start = new Date(row.submitted_time.replace(' ', 'T'));
      const end = new Date(row.resolved_time.replace(' ', 'T'));
      const days = (end - start) / (1000 * 60 * 60 * 24);
      return sum + Math.max(days, 0);
    }, 0);
    avgResolutionTime = `${(totalDays / resolvedDurations.length).toFixed(1)}d`;
  }

  const ackRows = await query(`
    SELECT COUNT(DISTINCT complaint_id) as n
    FROM complaint_timeline
    WHERE step != 'Submitted'
  `);
  const acknowledgedCount = ackRows[0].n;

  res.json({
    monthly,
    categories: categoryCounts,
    resolutionTrend,
    metrics: {
      avgResolutionTime,
      resolutionRate: `${totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0}%`,
      totalVolume: totalCount,
      escalationSla: `${totalCount > 0 ? Math.round((acknowledgedCount / totalCount) * 100) : 0}%`
    }
  });
});

// --------------------------------------------------------------------------
// Profile Routes
// --------------------------------------------------------------------------
function toProfile(user, staffId) {
  return {
    id: user.login_id,
    staffId: staffId || null,
    role: user.role,
    name: user.name,
    initials: user.initials,
    email: user.email,
    phone: user.phone || '',
    department: user.department || '',
    residence: user.residence || ''
  };
}

app.get('/api/profile/me', authenticateToken, async (req, res) => {
  const users = await query('SELECT * FROM users WHERE id = ? OR login_id = ?', [req.user.id, req.user.loginId]);
  const user = users[0];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const staffId = user.role === 'staff' ? await getStaffIdForUser(user.id) : null;
  res.json(toProfile(user, staffId));
});

app.patch('/api/profile/me', authenticateToken, async (req, res) => {
  const { name, email, phone, department, residence } = req.body;

  const users = await query('SELECT * FROM users WHERE id = ? OR login_id = ?', [req.user.id, req.user.loginId]);
  const user = users[0];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let initials = user.initials;
  if (name && name !== user.name) {
    initials = toInitials(name);
  }

  // mysql2 rejects undefined bind values; missing fields keep their current value via COALESCE
  await query(
    `UPDATE users
     SET name = COALESCE(?, name),
         initials = COALESCE(?, initials),
         email = COALESCE(?, email),
         phone = COALESCE(?, phone),
         department = COALESCE(?, department),
         residence = COALESCE(?, residence)
     WHERE id = ?`,
    [name ?? null, initials, email ?? null, phone ?? null, department ?? null, residence ?? null, user.id]
  );

  const updated = (await query('SELECT * FROM users WHERE id = ?', [user.id]))[0];

  // Keep the staff directory entry (and complaint assignee names) in sync
  let staffId = null;
  if (updated.role === 'staff') {
    staffId = await getStaffIdForUser(updated.id);
    if (staffId) {
      await query(
        'UPDATE staff SET name = ?, initials = ?, email = ?, department = ? WHERE id = ?',
        [updated.name, updated.initials, updated.email, updated.department || '', staffId]
      );
      await query('UPDATE complaints SET assigned_to = ? WHERE assigned_staff_id = ?', [updated.name, staffId]);
    }
  }

  res.json(toProfile(updated, staffId));
});

// --------------------------------------------------------------------------
// Start Server
// --------------------------------------------------------------------------

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to camcare API' });
});

app.listen(PORT, () => {
  console.log(`CamCare API server running on http://localhost:${PORT}`);
});
