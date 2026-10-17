# HS ERP

A campus management ERP — Student, Teacher, HR and MD all in one app, with role-based
attendance, people records, payroll and a notice board. Express + MongoDB API, deployed to
**Vercel** on the free Hobby tier; frontend is dependency-free HTML/CSS/JS with Chart.js for
charts.

## What's in it

One unified app instead of four separate portals — everyone logs in at `/index.html` and lands
on the same set of pages, with content and permissions adapted to their role:

| Page | Student | Teacher | HR / MD |
|---|---|---|---|
| **Dashboard** | own attendance %, notices | class size, today's attendance | org-wide stats, payroll total |
| **Attendance** | read-only calendar of own record | mark their own class, see recent records | mark/view any class or staff group |
| **People** | — | view student roster | full CRUD on students and staff |
| **Salary** | — | view own payslips | generate payslips, mark as paid |
| **Reports** | — | attendance-by-group chart + needs-attention list (own class only) | same, school-wide |
| **Announcements** | read notices | post + read | post + read + delete |
| **Profile** | own record | own record | own record |

Backend: JWT-based auth (bcrypt-hashed passwords), role middleware on every route, and six
resources — `students`, `employees`, `attendance`, `salary`, `announcements`, `dashboard` — all
under `Backend/routes/`.

## Design

A deliberately institutional look rather than a generic SaaS template: deep teal structural
color with a brass accent, IBM Plex Serif for headings paired with IBM Plex Sans for UI/data,
flat hairline-bordered panels instead of shadowed cards, and a persistent sidebar shell shared
by every page (`assets/js/shell.js` renders it and the role-based nav from one place, so there's
no duplicated markup to keep in sync).

## Deploy

1. **MongoDB Atlas** (free M0 tier): create a cluster, a database user, allow network access from
   `0.0.0.0/0`, copy the connection string.
2. **Push to GitHub**, then **import into Vercel** (vercel.com/new) — zero config needed, it
   auto-detects `/api/index.js` as the serverless function and everything else as static files.
3. In **Settings → Environment Variables** on the Vercel project, add:
   - `MONGODB_URI` — your Atlas connection string (database name `hssmart` is assumed, but any
     name works as long as it's in the URI)
   - `JWT_SECRET` — any long random string (used to sign login tokens)
4. **Deploy.**
5. **Seed demo data** — run locally against your Atlas cluster:
   ```bash
   npm install
   cp .env.example .env   # fill in MONGODB_URI
   npm run seed
   ```
   This creates 4 demo students, 4 demo staff (two teachers, one HR, one MD), two weeks of
   attendance history, this month's payroll, and a welcome notice.

## Local development

```bash
npm install
cp .env.example .env
npm run seed
npm run dev   # starts Backend/server.js on http://localhost:4000
```
Then open `http://localhost:4000/index.html` — the API and static pages are served from the same
Express app locally, so no separate frontend server or CORS setup is needed. (`vercel dev` works
the same way and matches production more closely if you want to test the serverless path.)

## Demo logins

| Role | Username | Password |
|---|---|---|
| Student | `student123` | `password` |
| Teacher | `teacher01` | `teach@123` |
| HR | `hradmin` | `hr@123` |
| MD | `mdmaster` | `md@2024` |

## Staying within free-tier limits

- **Connection caching** (`Backend/config/db.js`) reuses the MongoDB connection across warm
  serverless invocations instead of opening a new one per request — this is what keeps you under
  Atlas's free-tier connection cap under real traffic.
- **Vercel Hobby** gives 100 GB-hours of function execution a month at no cost; a school-scale ERP
  with modest traffic won't come close.
- **MongoDB Atlas M0** is free forever with 512 MB storage — comfortably enough for this schema
  (a few thousand students/staff and a year of daily attendance rows is only a few MB).

## Known scope limits

- Passwords are set once at account creation (no self-service reset flow yet).
- Attendance is marked per class/department as a whole, not per-subject/period.
- No real-time chat — the old 1:1 chat was replaced with a notice board, which fits an ERP's
  announcement needs better, but if you want live messaging back, it's a reasonably small add-on
  on top of the existing `Announcement` model pattern.

Want any of these built out further — password reset, CSV export, attendance by period, a
different role's dashboard layout? Just ask.
