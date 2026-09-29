# CamCare — Campus Complaint Management System

**CamCare** is an enterprise campus complaint management platform built with React, Node.js, Express, and MySQL. It provides a public marketing site, a dedicated student portal, and an administrative oversight portal.

---

## 🎨 Design System (Strict Specification)

- **Color Palette (Two Colors Only)**:
  - **Primary / Accent**: `rgb(79, 70, 229)` (`#4F46E5` indigo) — used for links, primary buttons, active navigation, focus rings, selected tabs, progress steps, and primary chart series.
  - **Monochrome Neutral Scale**: White, near-black, and grays only.
  - **Zero extra hues**: No red, green, orange, yellow, cyan, or purple anywhere in the UI or charts.
- **Zero Gradients**: All surfaces, buttons, cards, and banners use flat, solid colors.
- **Zero Icons**: No icon glyphs, SVG icons, or emojis. Replaced with text labels, dot indicators, and typographic characters (`›`, `→`, `✓`).
- **Dot-Based Status & Urgency**:
  - *Resolved / Low*: Light gray dot
  - *Pending / Medium*: Medium gray dot
  - *Verified*: Medium gray ring  |  *Assigned*: Indigo ring  |  *Rejected*: Light gray ring
  - *In Progress / High*: Solid indigo dot (`rgb(79, 70, 229)`)
  - *High Priority / Critical*: Solid indigo dot with a thin outer indigo ring
  - **Text labels are strictly neutral** — only the dot carries color.
- **Typography**:
  - One typeface throughout: `Inter` (sans-serif), with hierarchy from size and weight.
- **Surfaces & Light/Dark Mode**:
  - Dark mode: Near-black cards (`#0F0F14`) on black page background (`#08080C`) with subtle `1px` borders (`#202026`).
  - Light mode: Clean white cards (`#FFFFFF`) on light gray background (`#F8F8FA`) with light gray borders (`#E4E4E7`).
  - Persistent theme stored in `localStorage`; the login session is stored per tab in `sessionStorage`.

---

## 🚀 Demo Accounts & Credentials

Both student and admin demo accounts are pre-seeded in the database:

| Role | Login ID / Email | Password | Name |
| :--- | :--- | :--- | :--- |
| **Student** | `STU-2024-892` | `password123` | Kwame Mensah |
| **Admin** | `ADM-8801` (or `r.asante@camcare.edu`) | `password123` | Dr. Rita Asante |
| **Staff** | `STF-3001` to `STF-3005` | `password123` | David Mensah (Facilities), Grace Adjei, Samuel Tetteh, Abena Quansah, Kofi Boateng |

**Complaint workflow:** Student submits → Admin verifies (or rejects) → Admin resolves directly or assigns a staff member → the assigned staff member starts work and resolves it.

> **Tip**: The Sign In screen on the Auth page includes **1-Click Demo Login buttons** to sign in instantly without typing.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**:
  - React 19 + Vite
  - Pure Vanilla CSS (`src/index.css`)
  - Context API (`src/context/AppContext.jsx`) with JWT authentication and persistent state
  - Custom SVG Charts (`GroupedBarChart.jsx`, `DonutChart.jsx`, `TrendLineChart.jsx`) adhering strictly to the indigo and monochrome palette
- **Backend (`/server`)**:
  - Node.js + Express
  - MySQL with `mysql2` (XAMPP on port 3306)
  - Password hashing with `bcryptjs`
  - Stateless authentication with `jsonwebtoken` (JWT)
  - Auto-escalation business logic (open complaints with no activity for 3+ days automatically transition to `High Priority`)

---

## 🏃 Running Locally

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Quick Start (Both Frontend & Backend)
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Seed database with initial demo data
npm run seed

# Run both backend (port 8000) and frontend (port 5173) together
npm start
```

### Running Separately

**1. Backend API (`http://localhost:8000`)**
```bash
cd server
npm install
npm run seed    # Populates MySQL database
npm run dev     # Starts Express server on port 8000
```

**2. Frontend Client (`http://localhost:5173`)**
```bash
npm install
npm run dev     # Starts Vite dev server on port 5173
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login`: `{ role, loginId, password }` → Returns JWT + user profile.
- `POST /api/auth/register`: Student self-registration → Returns JWT + user profile.

### Complaints
- `GET /api/complaints`: Scoped by role (students see their own, staff see complaints assigned to them, administrators see all). Automatically triggers the 3+ day escalation check.
- `POST /api/complaints`: Creates new complaint with optional photo attachment (base64).
- `PATCH /api/complaints/:id`: Workflow action `{ action, staffId?, note? }` where action is `verify`, `reject`, `assign` (admin), `start` (assigned staff), `resolve` (admin or assigned staff) or `note`. Invalid transitions are rejected; each action appends a timeline record.

### Staff Management
- `GET /api/staff`: (Admin) Returns staff list with live active and resolved complaint counts.
- `POST /api/staff`: (Admin) Creates a staff member and their login account (Staff ID generated as `STF-xxxx`).

### Announcements
- `GET /api/announcements`: Public / authenticated list of campus updates.
- `POST /api/announcements`: (Admin) Publish a new announcement.
- `PATCH /api/announcements/:id`: (Admin) Edit an announcement.
- `DELETE /api/announcements/:id`: (Admin) Delete an announcement.

### Reports & Analytics
- `GET /api/reports/summary`: (Admin) Generates monthly submissions vs resolutions, category distribution, and resolution-rate trend.

### Profile
- `GET /api/profile/me`: Returns current user credentials.
- `PATCH /api/profile/me`: Updates profile details (Full Name, Email, Phone, Department, Residence) for students and administrators.

---

## 📁 Key Files & Directories

```
f:/Antigravity/
├── server/
│   ├── db.js                 # MySQL connection pool & schema setup
│   ├── seed.js               # Database demo seeder
│   └── .env                  # PORT, JWT_SECRET, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
├── src/
│   ├── index.css             # Strict design system & light/dark tokens
│   ├── context/
│   │   └── AppContext.jsx    # API client, JWT storage, state provider
│   ├── components/
│   │   ├── common/           # StatusDot, UrgencyDot, ThemeToggle, NotificationControl, Modal, Toast
│   │   ├── layout/           # MarketingNav, Sidebar, Topbar, AlertBanner
│   │   ├── charts/           # GroupedBarChart, DonutChart, TrendLineChart
│   │   └── complaints/       # StepWizard (with photo upload), ComplaintDetailModal
│   └── pages/
│       ├── MarketingPage.jsx # Public homepage
│       ├── AuthPage.jsx      # Sign In / Register with 1-click demo logins
│       ├── student/          # Student Dashboard, My Complaints, Submit Complaint, Announcements, Profile
│       └── admin/            # Admin Dashboard, All Complaints, Staff Management, Reports, Announcements, Profile
```
