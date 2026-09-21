# HS Smart Attendance System

A multi-portal (Student / Teacher / HR / MD) attendance & chat demo: static HTML/CSS frontends
plus an Express + MongoDB API, restructured to deploy to **Vercel** on the free Hobby tier.

## What changed to make this deployable

The original project was a standalone Express server (`app.listen`) pointed at a hardcoded
`mongodb://localhost:27017`, with the frontend calling `http://localhost:4000` directly. None of
that works on Vercel, which runs your backend as short-lived serverless functions with no local
disk database. Specific fixes:

- **Serverless entrypoint** — `Backend/app.js` now just builds and exports the Express app;
  `Backend/server.js` only calls `.listen()` for local dev, and `api/index.js` wraps the same app
  with `serverless-http` for Vercel. `vercel.json` rewrites `/api/*` to that one function, and
  Vercel serves every other file (all the portal HTML/CSS) as static assets automatically.
- **MongoDB Atlas + connection caching** — `Backend/config/db.js` now reads `MONGODB_URI` from an
  environment variable and caches the connection on `global`, so a warm serverless invocation
  reuses it instead of opening a new connection on every request. That's the main thing that
  keeps you inside MongoDB Atlas's free-tier connection limit and Vercel's free execution minutes
  — without it, traffic could exhaust your connection quota fast.
- **Fixed real bugs**:
  - `models/user.js` vs. `require('../models/User')` — this only worked by accident on
    case-insensitive filesystems (Windows/Mac). Linux, and Vercel's build, is case-sensitive, so
    the API would have crashed on deploy. Renamed the file to `User.js`.
  - `Backend/routes/auth.js` had a leftover **client-side** `fetch(...)` snippet pasted directly
    into the server route file, referencing undefined browser variables. Removed it — the file
    now only exports the Express router.
  - `server.js` never mounted the `/api/auth` or `/api/users` routes, and there was a duplicate,
    unused `routes/config/db.js`. Cleaned up.
  - `routes/addusers.js` was an empty file. Implemented it as a guarded `POST /api/users` route
    for seeding/creating accounts.
  - Passwords were stored and compared in plain text. Now hashed with `bcryptjs`.
- **Relative API URLs** — every frontend page called `http://localhost:4000/api/...` directly.
  Since Vercel serves the frontend and the API from the same domain, all of those are now relative
  (`/api/chat`, `/api/auth/login`), so they work locally and in production without CORS issues.

### Known limitation (unchanged from the original)

Only the MD login page (`HR/md side/mdlogin.html`) actually calls `/api/auth/login`. The
Student, Teacher, and HR login pages check a hardcoded username/password in client-side
JavaScript and never touch the backend — that was true in the original project too. It's fine for
a demo, but anyone can read the credentials in the page source. Say the word if you'd like me to
wire those three pages to the real `/api/auth/login` route as well.

## Deploy it yourself

1. **Create a free MongoDB Atlas cluster** (M0 tier, $0/month): https://www.mongodb.com/cloud/atlas/register
   Add a database user, allow access from `0.0.0.0/0` (or Vercel's IPs) under Network Access, and
   copy the connection string.
2. **Push this folder to a GitHub repo.**
3. **Import the repo into Vercel** (https://vercel.com/new) — no build settings need changing,
   Vercel auto-detects the `/api` function and static files.
4. In the Vercel project's **Settings → Environment Variables**, add:
   - `MONGODB_URI` — your Atlas connection string, with `/hssmart` as the database name
   - `ADMIN_SEED_SECRET` — any long random string
5. **Deploy.**
6. **Seed the demo users** — either run `npm run seed` locally with `MONGODB_URI` set in a `.env`
   file (copy `.env.example`), or `POST` to `https://<your-app>.vercel.app/api/users` with header
   `x-seed-secret: <your ADMIN_SEED_SECRET>` and a JSON body like:
   ```json
   [{ "username": "mdmaster", "password": "md@2024", "role": "md" }]
   ```

## Local development

```bash
npm install
cp .env.example .env   # fill in MONGODB_URI (Atlas, or a local mongod)
npm run seed            # creates the demo accounts
npm run dev              # starts Backend/server.js on http://localhost:4000
```
Open any of the portal HTML files directly, or serve the whole folder with `npx serve .` so the
relative `/api/...` calls resolve to the same server (recommended: use `vercel dev` instead, which
runs the static files and the `/api` function together exactly like production).

## Staying within free-tier limits

- Vercel Hobby: 100 GB-hours of serverless execution/month, no charge — a small attendance app for
  a few classes won't come close.
- MongoDB Atlas M0: free forever, 512 MB storage, shared RAM — plenty for this schema.
- The connection caching in `config/db.js` is the important piece: without it, each cold-started
  function invocation opens a brand-new MongoDB connection, which can exhaust Atlas's connection
  limit under any real traffic and slow every request down.
