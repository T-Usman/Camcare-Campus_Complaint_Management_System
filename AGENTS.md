# AGENTS.md — CamCare (Antigravity)

## Project Structure
Two-package repo: root (React/Vite frontend) + `server/` (Express/MySQL backend).

```
src/
  App.jsx           → SPA router via context (no react-router)
  context/AppContext.jsx → all state, auth, API client, navigation
  pages/{student,admin}/ → role-based page components
  components/{common,layout,charts,complaints}/
server/
  index.js          → Express API (port 4000)
  db.js             → MySQL connection pool + schema init (mysql2/promise)
  seed.js           → demo data seeder
```

## Commands
```bash
npm install                          # root deps
cd server && npm install             # server deps (separate install)
npm run seed                         # seed/reset MySQL database
npm start                            # frontend (:5173) + backend (:4000) via concurrently
npm run lint                         # oxlint (no ESLint/Prettier)
```

Run frontend only: `npm run dev`
Run backend only: `cd server && npm run dev`

## Critical Gotchas

**MySQL required**: `server/db.js` uses `mysql2/promise` with a connection pool. XAMPP must be running with MySQL on port 3306. Database name: `camcare`. Schema auto-created via `initDb()` on server start.

**No `node_modules` in server**: `server/package.json` has its own deps but root `npm install` does not install them. You must `cd server && npm install` separately.

**Frontend API fallback**: All API calls in `AppContext.jsx` have graceful fallback to local state if the backend is unreachable. Features work without the server, but data won't persist.

**No router**: Navigation is state-based (`currentPage` string in context), not URL-based. Page names are like `student-dashboard`, `admin-complaints`, etc.

**Auto-escalation**: `GET /api/complaints` triggers `runAutoEscalationCheck()` — complaints unanswered for 3+ days auto-transition to `High Priority`. This runs on every fetch, not as a cron.

**Base64 image uploads**: Complaint photos are stored as base64 strings in MySQL (LONGTEXT). `express.json({ limit: '15mb' })` to accommodate.

## Design System (Strict)
- **2 colors only**: `#4F46E5` (indigo) + monochrome grays. No red/green/orange/etc.
- **Zero gradients, zero icons/emojis**. Use text labels and dot indicators.
- Status/urgency dots carry color; text labels are always neutral gray.
- Headings: Playfair Display (serif). Body: Inter (sans-serif).
- Dark mode: `#08080C` page, `#0F0F14` cards, `#202026` borders. Light: `#F8F8FA` page, `#FFFFFF` cards.
- CSS variables in `src/index.css` manage theming via `data-theme` attribute.

## Auth & Demo Accounts
JWT stored in `localStorage` as `camcare_token`. Role stored as `camcare_role`.

| Role    | Login ID         | Password     |
|---------|------------------|--------------|
| Student | `STU-2024-892`   | `password123`|
| Admin   | `ADM-8801`       | `password123`|

Seed is idempotent — safe to re-run `npm run seed` at any time.

## Database
MySQL on port 3306 (XAMPP). Config in `server/.env`: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (default `camcare`). Schema auto-created via `initDb()` on server start. Tables: `users`, `complaints`, `complaint_timeline`, `staff`, `announcements`. Complaint photos stored as base64 in `LONGTEXT`.

## Linting
oxlint with React hooks plugin. Config at `.oxlintrc.json`. No TypeScript, no Prettier.
