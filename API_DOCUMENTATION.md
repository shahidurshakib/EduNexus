# EduNexus API Documentation

Base URL: `http://localhost:5000/api`

All responses use the shape:
```json
{ "success": true|false, "message": "...", "data": { ... } }
```
Authenticated routes require `Authorization: Bearer <accessToken>`. Get one via `/auth/login`, refresh with `/auth/refresh-token` (reads the `refreshToken` httpOnly cookie).

Roles: `platform_founder` (one seeded account) → `admin` → `mentor` / `investor` / `member`.

---
## Auth (already implemented — unchanged)
`POST /auth/register` · `POST /auth/verify-otp` · `POST /auth/resend-otp` · `POST /auth/login` · `POST /auth/refresh-token` · `POST /auth/logout` · `GET /auth/me` · `POST /auth/forgot-password` · `POST /auth/reset-password`

---
## Users & Role Approvals

### `GET /users` — founder, admin
Query: `role`, `status(active|blocked)`, `search`, `page`, `limit`
```json
{ "success": true, "data": { "users": [ { "id": 3, "full_name": "Jane Doe", "role": "mentor", "is_active": 1 } ], "total": 42, "page": 1, "limit": 20 } }
```

### `GET /users/:id` — founder, admin
### `PATCH /users/:id/suspend` — founder, admin
### `PATCH /users/:id/activate` — founder, admin
### `DELETE /users/:id` — founder, admin
### `PATCH /users/:id/remove-admin` — founder only

### `POST /approvals/request` — any logged-in user
Body: `{ "requestedRole": "mentor" }`

### `GET /approvals` — founder, admin
Query: `status(pending|approved|rejected)`, `role`
Admins only see mentor/investor requests; only the founder sees admin requests.

### `PATCH /approvals/:id/approve` / `PATCH /approvals/:id/reject`
Body: `{ "reviewNote": "optional text" }`
Approving a mentor/investor request auto-creates their public directory profile row.

---
## Mentor & Investor Directory

`GET /mentors` (public, `search`, `page`, `limit`) · `GET /mentors/:id` (public)
`GET /investors` (public) · `GET /investors/:id` (public)
`PATCH /mentors/me` — mentor self-service: `{ "expertise": "...", "bio": "...", "linkedinUrl": "..." }`
`PATCH /investors/me` — investor self-service: `{ "investmentFocus": "...", "minTicketSize": 5000, "maxTicketSize": 50000, "bio": "..." }`

---
## Startups

### `POST /startups` — any logged-in user (becomes founder)
Body: `{ "name": "AgriSense", "description": "...", "industry": "AgriTech", "location": "Sylhet", "fundingNeeded": 20000 }`
```json
{ "success": true, "message": "Startup created successfully", "data": { "id": 12 } }
```

### `GET /startups` — public
Query: `search`, `industry`, `stage`, `status` (managers only), `page`, `limit`

### `GET /startups/:id` — public
Returns `startup`, `founders[]`, `mentors[]`, `investors[]`, `fundingHistory[]`.

### `PUT /startups/:id` — owner founder, admin, platform_founder
### `DELETE /startups/:id` — owner founder, admin, platform_founder
### `PATCH /startups/:id/logo` — multipart form-data, field `logo`
### `PATCH /startups/:id/status` — admin, founder. Body: `{ "status": "active|inactive|archived" }`
### `POST /startups/:id/founders` — Body: `{ "userId": 7, "roleTitle": "CTO" }`
### `POST /startups/:id/mentors` — Body: `{ "mentorId": 3 }`
### `POST /startups/:id/investors` — Body: `{ "investorId": 5 }`

---
## Research

`POST /research` — Body: `{ "title": "...", "abstract": "...", "department": "CSE", "supervisor": "Dr. X", "authors": [{ "authorName": "A. Rahman", "userId": 4 }], "publicationStatus": "draft", "patentStatus": "none" }`
`GET /research` — Query: `search`, `department`, `publicationStatus`, `patentStatus`, `page`, `limit`
`GET /research/:id` — includes `authors[]`, `patents[]`
`PUT /research/:id` / `DELETE /research/:id` — owner (created_by) or admin/founder
`PATCH /research/:id/pdf` — multipart form-data, field `pdf`

`POST /research/patents` — Body: `{ "researchId": 3, "title": "...", "patentNumber": "...", "filingDate": "2026-01-10", "status": "filed" }`
`GET /research/patents` · `PUT /research/patents/:id` (admin/founder) · `DELETE /research/patents/:id` (admin/founder)

---
## Funding

`POST /funding` — Body: `{ "startupId": 12, "investorId": 5, "amount": 15000, "roundType": "seed", "fundingDate": "2026-03-01", "notes": "..." }`
Allowed: founder/admin, the matching investor, or a founder of that startup. Recording a round auto-advances the startup's stage via the existing DB trigger.

`GET /funding` — Query: `startupId`, `investorId`, `roundType`, `from`, `to`, `page`, `limit`
`GET /funding/:id`
`PUT /funding/:id` / `DELETE /funding/:id` — admin, founder only
`GET /funding/analytics` — admin, founder. Returns totals by round type, 12-month trend, top 10 funded startups.

---
## Dashboards

`GET /dashboard` — protect only; response shape depends on `req.user.role`:
- **platform_founder**: user counts by role, pending approvals by type, startup/research counts, funding total, monthly signups, recent activity, recent funding
- **admin**: pending mentor/investor approvals, startup/research/member counts, recent funding, recent activity
- **mentor**: assigned startups, recent notifications
- **investor**: linked startups, total invested, funding history
- **member**: own startups, own research, unread notification count, own role requests

---
## Notifications

`GET /notifications` — Query: `unreadOnly=true`, `page`, `limit`
`PATCH /notifications/:id/read` · `PATCH /notifications/read-all` · `DELETE /notifications/:id`
`POST /notifications` — admin/founder. Body: `{ "userId": 7, "title": "...", "message": "..." }`
`POST /notifications/broadcast` — admin/founder. Body: `{ "role": "all|admin|mentor|investor|member", "title": "...", "message": "..." }`

---
## Global Search

`GET /search?q=agri&type=all` — `type` ∈ `all|startups|research|mentors|investors|users` (`users` only returned to founder/admin, and only when logged in).

---
## Reports & Exports

`GET /reports/:type` — founder, admin. `type` ∈ `startups|research|funding|mentors|investors`. Returns JSON rows for on-screen display.
`GET /reports/:type/export?format=csv|xlsx|pdf` — founder, admin. Streams a downloadable file.

---
## Activity & Login Logs

`GET /logs/activity` — founder, admin. Query: `entityType`, `userId`, `from`, `to`, `page`, `limit`
`GET /logs/login` — founder, admin. Query: `userId`, `from`, `to`, `page`, `limit`

---
## Error format
```json
{ "success": false, "message": "Human-readable reason", "errors": [ /* express-validator details, when applicable */ ] }
```
Common status codes: `400` validation, `401` not authenticated, `403` wrong role/not owner, `404` not found, `409` conflict (duplicate / FK-referenced).
