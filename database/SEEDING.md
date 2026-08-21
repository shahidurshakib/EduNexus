# Seeding accounts

Password hashing (bcrypt) needs the actual `bcryptjs` library to produce a
hash that will verify correctly — a hash written by hand into a `.sql` file
can't be checked without running that library, so it isn't shipped here.

Instead, seed data is created by a small Node script that hashes passwords
for real at insert time:

```bash
cd backend
npm install
cp .env.example .env   # fill in your DB + Gmail credentials first
npm run seed
```

This creates:

| Role      | Email                          | Password       |
|-----------|----------------------------------|----------------|
| platform_founder | founder@edunexus.local     | ChangeMe123!   |
| admin     | admin@edunexus.local            | ChangeMe123!   |
| member    | nusrat@example.com               | ChangeMe123!   |
| mentor (approved, public) | kamal.mentor@example.com | ChangeMe123! |
| investor (approved, public) | rafiul.investor@example.com | ChangeMe123! |

**Change the Founder password immediately after your first login** — it's
the single highest-privilege account in the system.

The script is idempotent — re-running `npm run seed` skips any email that
already exists instead of duplicating it.
