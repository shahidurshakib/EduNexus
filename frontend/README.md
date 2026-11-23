# EduNexus Frontend

A React (Vite + Tailwind + React Router + Recharts) frontend built against the
EduNexus backend in your uploaded zips, matching `API_DOCUMENTATION.md` exactly.

## Stack
- React 18 + Vite
- React Router v6 (client-side routing)
- Tailwind CSS (custom design system — see `tailwind.config.js`)
- Axios (with access/refresh token handling)
- Recharts (dashboard & funding analytics charts)

## Setup

```bash
npm install
cp .env.example .env
# edit .env if your backend runs somewhere other than http://localhost:5000
npm run dev
```

The dev server runs on `http://localhost:5173` and proxies `/api` to your
backend (see `vite.config.js`) — or set `VITE_API_BASE_URL` in `.env` to call
it directly.

`npm run build` produces a static `dist/` folder you can deploy anywhere
(Netlify, Vercel, S3, nginx, etc.) — just point `VITE_API_BASE_URL` at your
deployed backend before building.

## What's implemented

**Public site** — Landing, About, Vision, Mission, Contact, startup & research
directories (public listing + detail pages), mentor & investor directories.

**Auth** — Register, OTP verification/resend, Login, Forgot/Reset password,
automatic access-token refresh via the `refreshToken` cookie.

**Dashboards** (one route, content swaps by role from `GET /dashboard`):
- Founder / Admin — platform stats, signups trend, users-by-role chart,
  recent activity, recent funding, quick links to management panels
- Mentor — assigned startups, notifications
- Investor — portfolio, total invested, funding history table
- Member — own startups/research, role-request shortcut

**Admin/Founder panel** — Users (suspend/activate/delete/remove-admin),
Role approvals (approve/reject with review note), Funding (list + analytics
charts + top-funded startups), Reports (preview + CSV/XLSX/PDF export links),
Activity & login logs.

**Startups & Research** — create/edit forms (member-owned), detail pages with
founders/mentors/investors/funding history (startups) and authors/patents
(research), delete with confirmation.

**Cross-cutting** — dark mode (persisted, class-based), fully responsive
layout (mobile nav + sidebar drawer), notifications inbox, global search
results page, role-gated routes.

## Notes / things to double check against your backend

- Response field names (snake_case like `full_name`, `funding_needed`) are
  read defensively (`r.field || r.camelField`) since a couple of controllers
  weren't in the API doc's exact JSON shape — adjust the `render` functions
  in the relevant page if your actual payloads differ.
- `/contact` submits client-side only — there's no public contact endpoint
  in the documented API; wire it to a real endpoint or an email service when
  you add one.
- File uploads (startup logo, research PDF) have API functions ready in
  `src/api/startups.js` / `src/api/research.js` but no UI hook yet — add an
  `<input type="file">` + call `uploadStartupLogo` / `uploadResearchPdf`
  wherever you want that control to live (e.g. the edit forms).
- This container has no network access, so the install/build could not be
  verified end-to-end here — run `npm install && npm run build` locally as
  a first step.
