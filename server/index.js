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

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrative privileges required' });
  }
  next();
}

// --------------------------------------------------------------------------
// Business Logic: 3+ Days Unanswered Auto-Escalation Check
// --------------------------------------------------------------------------
async function runAutoEscalationCheck() {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const eligible = await query(`
    SELECT id, title, status, last_activity_at
    FROM complaints
    WHERE status IN ('Pending', 'In Progress')
      AND (last_activity_at <= ? OR date <= ?)
  `, [threeDaysAgo, threeDaysAgo.split('T')[0]]);

  const nowString = new Date().toISOString().replace('T', ' ').substring(0, 16);

  for (const item of eligible) {
    await query('UPDATE complaints SET status = ?, last_activity_at = ? WHERE id = ?', ['High Priority', nowString, item.id]);
    await query(
      'INSERT INTO complaint_timeline (complaint_id, step, time, note) VALUES (?, ?, ?, ?)',
      [item.id, 'Escalated', nowString, 'Automatically escalated to High Priority \u2014 unanswered for more than 3 days.']
    );
  }
}

async function getComplaintWithTimeline(complaintId) {
  const rows = await query('SELECT * FROM complaints WHERE id = ?', [complaintId]);
  const comp = rows[0];
  if (!comp) return null;

  const timeline = await query('SELECT step, time, note FROM complaint_timeline WHERE complaint_id = ? ORDER BY id ASC', [complaintId]);

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

  const token = jwt.sign(
    { id: user.id, role: user.role, loginId: user.login_id, name: user.name, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.login_id,
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

  const initials = name.split(' ').filter(Boolean).map(p => p[0].toUpperCase()).slice(0, 2).join('');
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
  } else {
    complaintIds = await query('SELECT id FROM complaints WHERE student_login_id = ? ORDER BY created_at DESC', [req.user.loginId]);
  }

  const results = await Promise.all(complaintIds.map(row => getComplaintWithTimeline(row.id)));
  res.json(results);
});

app.get('/api/complaints/:id', authenticateToken, async (req, res) => {
  const comp = await getComplaintWithTimeline(req.params.id);
  if (!comp) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  // If student, restrict to their own complaint
  if (req.user.role !== 'admin' && comp.studentId !== req.user.loginId) {
    return res.status(403).json({ error: 'Access denied to this complaint' });
  }

  res.json(comp);
});

app.post('/api/complaints', authenticateToken, async (req, res) => {
  const { title, category, urgency, location, description, photo } = req.body;

  if (!title || !category || !urgency || !location || !description) {
    return res.status(400).json({ error: 'Title, category, urgency, location, and description are required' });
  }

  const countRows = await query('SELECT COUNT(*) as count FROM complaints');
  const nextNumber = countRows[0].count + 42;
  const complaintId = `C-00${nextNumber}`;

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime = new Date().toISOString().replace('T', ' ').substring(0, 16);

  await query(
    `INSERT INTO complaints (id, title, category, urgency, status, assigned_to, date, location, description, student_name, student_login_id, photo, created_at, last_activity_at)
     VALUES (?, ?, ?, ?, 'Pending', 'Unassigned', ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [complaintId, title, category, urgency, todayStr, location, description, req.user.name, req.user.loginId, photo || null]
  );

  await query(
    'INSERT INTO complaint_timeline (complaint_id, step, time, note) VALUES (?, ?, ?, ?)',
    [complaintId, 'Submitted', nowTime, 'Complaint logged into CamCare portal']
  );

  const created = await getComplaintWithTimeline(complaintId);
  res.status(201).json(created);
});

app.patch('/api/complaints/:id', authenticateToken, requireAdmin, async (req, res) => {
  const complaintId = req.params.id;
  const { status, assignedTo, note } = req.body;

  const compRows = await query('SELECT * FROM complaints WHERE id = ?', [complaintId]);
  const comp = compRows[0];
  if (!comp) {
    return res.status(404).json({ error: 'Complaint not found' });
  }

  const updates = [];
  const params = [];
  const previousAssignee = comp.assigned_to;
  const previousStatus = comp.status;

  if (status && status !== comp.status) {
    updates.push('status = ?');
    params.push(status);
  }

  if (assignedTo && assignedTo !== comp.assigned_to) {
    updates.push('assigned_to = ?');
    params.push(assignedTo);
  }

  updates.push('last_activity_at = NOW()');

  if (updates.length > 0) {
    params.push(complaintId);
    await query(`UPDATE complaints SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  const nowTime = new Date().toISOString().replace('T', ' ').substring(0, 16);

  // Record timeline events
  const statusChanged = status && status !== previousStatus;
  const assignmentChanged = assignedTo && assignedTo !== previousAssignee;

  if (assignmentChanged) {
    await query(
      'INSERT INTO complaint_timeline (complaint_id, step, time, note) VALUES (?, ?, ?, ?)',
      [complaintId, 'Assigned', nowTime, `Assigned to ${assignedTo}`]
    );
  }

  if (statusChanged) {
    await query(
      'INSERT INTO complaint_timeline (complaint_id, step, time, note) VALUES (?, ?, ?, ?)',
      [complaintId, status, nowTime, note || `Status updated to ${status}`]
    );
  } else if (!assignmentChanged && note && note.trim()) {
    // Custom note without status or assignment change
    await query(
      'INSERT INTO complaint_timeline (complaint_id, step, time, note) VALUES (?, ?, ?, ?)',
      [complaintId, 'Update', nowTime, note.trim()]
    );
  }

  // Recalculate staff active and resolved counts for all affected staff members
  const affectedStaff = new Set(
    [previousAssignee, assignedTo].filter(name => name && name !== 'Unassigned')
  );

  for (const staffName of affectedStaff) {
    await query(
      "UPDATE staff SET active_count = (SELECT COUNT(*) FROM complaints WHERE assigned_to = ? AND status != 'Resolved') WHERE name = ?",
      [staffName, staffName]
    );
    await query(
      "UPDATE staff SET resolved_count = (SELECT COUNT(*) FROM complaints WHERE assigned_to = ? AND status = 'Resolved') WHERE name = ?",
      [staffName, staffName]
    );
  }

  const updated = await getComplaintWithTimeline(complaintId);
  res.json(updated);
});

// --------------------------------------------------------------------------
// Staff Routes
// --------------------------------------------------------------------------
app.get('/api/staff', authenticateToken, async (req, res) => {
  const rows = await query('SELECT * FROM staff ORDER BY name ASC');
  const staffList = rows.map(s => ({
    id: s.id,
    name: s.name,
    initials: s.initials,
    department: s.department,
    email: s.email,
    activeCount: s.active_count,
    resolvedCount: s.resolved_count
  }));
  res.json(staffList);
});

// --------------------------------------------------------------------------
// Announcements Routes
// --------------------------------------------------------------------------
app.get('/api/announcements', async (req, res) => {
  const rows = await query('SELECT * FROM announcements ORDER BY date DESC');
  res.json(rows);
});

app.post('/api/announcements', authenticateToken, requireAdmin, async (req, res) => {
  const { title, category, snippet, body, image } = req.body;

  if (!title || !category || !snippet || !body) {
    return res.status(400).json({ error: 'Title, category, snippet, and body are required' });
  }

  const id = `ann-${Date.now()}`;
  const dateStr = new Date().toISOString().split('T')[0];

  await query(
    'INSERT INTO announcements (id, title, category, date, image, snippet, body) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, title, category, dateStr, image || '/images/campus-hero.jpg', snippet, body]
  );

  const created = await query('SELECT * FROM announcements WHERE id = ?', [id]);
  res.status(201).json(created[0]);
});

app.patch('/api/announcements/:id', authenticateToken, requireAdmin, async (req, res) => {
  const annId = req.params.id;
  const { title, category, snippet, body, image } = req.body;

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

  const updated = await query('SELECT * FROM announcements WHERE id = ?', [annId]);
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
app.get('/api/profile/me', authenticateToken, async (req, res) => {
  const users = await query('SELECT * FROM users WHERE id = ? OR login_id = ?', [req.user.id, req.user.loginId]);
  const user = users[0];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.login_id,
    role: user.role,
    name: user.name,
    initials: user.initials,
    email: user.email,
    phone: user.phone || '',
    department: user.department || '',
    residence: user.residence || ''
  });
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
    initials = name.split(' ').filter(Boolean).map(p => p[0].toUpperCase()).slice(0, 2).join('');
  }

  await query(
    `UPDATE users
     SET name = COALESCE(?, name),
         initials = COALESCE(?, initials),
         email = COALESCE(?, email),
         phone = COALESCE(?, phone),
         department = COALESCE(?, department),
         residence = COALESCE(?, residence)
     WHERE id = ?`,
    [name, initials, email, phone, department, residence, user.id]
  );

  const updated = await query('SELECT * FROM users WHERE id = ?', [user.id]);
  res.json({
    id: updated[0].login_id,
    role: updated[0].role,
    name: updated[0].name,
    initials: updated[0].initials,
    email: updated[0].email,
    phone: updated[0].phone || '',
    department: updated[0].department || '',
    residence: updated[0].residence || ''
  });
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
