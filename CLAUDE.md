# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

CamCare is a campus complaint management system: a React 19 + Vite SPA (repo root) and an Express 5 + MySQL API (`server/`). Plain JavaScript (ES modules), no TypeScript.

## Commands

```bash
npm install                    # frontend deps
cd server && npm install       # backend deps — separate package, NOT installed by the root install
npm run seed                   # (re)create demo data in MySQL; idempotent
npm start                      # backend + frontend together via concurrently
npm run dev                    # frontend only (Vite, :5173)
cd server && npm run dev       # backend only (nodemon)
npm run build                  # production build of the frontend
npm run lint                   # oxlint (.oxlintrc.json: react rules-of-hooks, only-export-components)
```

There is no test suite. Verify changes by running the app and logging in with the demo accounts (all passwords `password123`): student `STU-2024-892`, admin `ADM-8801`, staff `STF-3001` to `STF-3005`. The auth page also has one-click demo login buttons.

MySQL must be running (XAMPP, port 3306, database `camcare`). Config lives in `server/.env` (see `server/.env.example`). `initDb()` in `server/db.js` creates tables with `CREATE TABLE IF NOT EXISTS` on server start — there are no migrations, so schema changes to existing tables need a manual `ALTER`, which belongs in `initDb()` via `addColumnIfMissing()`.

## Ports — watch out

`server/index.js` defaults to port 4000, but `server/.env` sets `PORT=8000`, and the frontend hardcodes `API_BASE = 'http://localhost:8000'` at the top of `src/context/AppContext.jsx`. README/AGENTS.md say 4000; the running config is 8000. If you change one, change both. There is no Vite proxy.

## Architecture

**Frontend state lives in one place.** `src/context/AppContext.jsx` is the entire client-side "app layer": auth (JWT in **`sessionStorage`** as `camcare_token`, role as `camcare_role`; that storage is per tab, so tabs can be signed in as different roles. Only the theme `camcare_theme` is in `localStorage`), the API client (`apiFetch`), all domain state (complaints, staff, announcements, student/admin/staff profile), mutation functions (`addComplaint`, `updateComplaint`, announcement CRUD, profile updates), toasts, and navigation. Pages consume it via `useApp()` and generally don't call `fetch` themselves — add new API interactions to the context.

**Offline fallback is intentional.** The context seeds state from hardcoded `INITIAL_*` constants, and every API-backed action catches failures and applies the change to local state instead (login included — it will "succeed" locally with no token). Login and complaint actions fall back only on network errors; an HTTP error (wrong password, forbidden transition) is shown as a toast instead. So the UI appearing to work does not prove the backend was hit; check the network/console (`Falling back...` warnings) when debugging persistence.

**No router.** `src/App.jsx` switches on the `currentPage` string from context (`marketing`, `auth`, `student-*`, `admin-*`, `staff-*`). Navigate with `navigateTo(page)` or `navigateWithFilter(page, statusFilter)`. Adding a page means adding a `case` in `App.jsx` and an entry in `components/layout/Sidebar.jsx`.

**Backend is a single file.** `server/index.js` holds all routes, with `authenticateToken` and `requireRole(...roles)` middleware (`requireAdmin` = `requireRole('admin')`). Role scoping happens in the handlers (e.g. students only see their own complaints). `server/db.js` exports the pool and a `query` helper plus `initDb()`.

**Complaint lifecycle (three roles).** Student submits (`Pending`) → admin verifies (`Verified`) or rejects (`Rejected`, note required) → admin resolves directly (`Resolved`) or assigns a staff member (`Assigned`) → that staff member starts (`In Progress`) and resolves (`Resolved`, note required). `PATCH /api/complaints/:id` takes `{ action: verify|reject|assign|start|resolve|note, staffId?, note? }`; the allowed actions per role and status live in `getAllowedActions()` in `server/index.js`, mirrored in `src/components/complaints/complaintWorkflow.js`, so change both together. The server enforces them; the client copy only decides which buttons show. Every action appends a `complaint_timeline` row with an `actor`. `runAutoEscalationCheck()` runs on every `GET /api/complaints` (not a cron) and moves open complaints with no activity for 3+ days (`last_activity_at`) to `High Priority`. High Priority keeps its `assigned_staff_id`, so available actions then depend on whether a staff member is assigned. Note the mixed date types: `complaints.date` is a `VARCHAR` (`YYYY-MM-DD`), `last_activity_at` is `DATETIME`, and timeline times are `YYYY-MM-DD HH:MM` strings.

**Staff model.** A staff member is a `users` row (`role = 'staff'`) linked from `staff.user_id`; `staff.id` (e.g. `STF-3001`) is also their login ID. Complaints point at `staff.id` through `complaints.assigned_staff_id`; `assigned_to` holds the display name only. Staff JWTs carry `staffId`, and `GET /api/complaints` is scoped by role (admin: all, staff: assigned to them, student: their own). Staff active and resolved counts are computed live in `GET /api/staff`; the stored `active_count`/`resolved_count` columns are unused. Schema changes to existing tables go through `addColumnIfMissing()` in `initDb()`, which also migrates databases where `assigned_staff_id` was a foreign key to `users.id`.

**Photos** are base64 strings stored in a `LONGTEXT` column; `express.json` is set to a `15mb` limit to allow this.

**Charts** (`src/components/charts/`) are hand-written SVG components — no chart library. Keep it that way.

## Design system (strict — enforced by convention)

- Only two colors: indigo `#4F46E5` and a monochrome gray scale. No red/green/orange/etc., including in charts.
- No gradients, no icons, no emojis, no SVG icon glyphs. Use text labels, dot indicators (`StatusDot`, `UrgencyDot`), and typographic characters (`›`, `→`, `✓`).
- Status/urgency color is carried only by the dot; text labels stay neutral gray. Resolved/Low = light gray, Pending/Medium = mid gray, In Progress/High = solid indigo, High Priority/Critical = indigo with outer ring. Hollow rings: Verified = gray ring, Assigned = indigo ring, Rejected = light gray ring.
- One typeface: Inter for everything (the `.heading-serif`/`.font-serif` class names are legacy and render Inter). Font sizes are whole pixels.
- Styling is plain CSS with theme tokens as CSS variables in `src/index.css`, switched by a `data-theme` attribute. Dark: page `#08080C`, cards `#0F0F14`, borders `#202026`. Light: page `#F8F8FA`, cards `#FFFFFF`, borders `#E4E4E7`. Use the variables rather than literal colors.
