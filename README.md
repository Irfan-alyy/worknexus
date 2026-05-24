# WorkNexus

This repository contains the WorkNexus backend and frontend applications.

## Backend

See [backend/README.md](backend/README.md) for the full API map, route payloads, backend structure, and integration notes.

Quick start:

```bash
cd backend
npm install
npx prisma migrate dev
npm start
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Integration notes

- Backend base path: `/api/v1`
- Use JWT authentication for protected endpoints
- Follow the response contract documented in the backend README
- Keep the frontend API layer aligned with the route list in the backend README
- HR employee onboarding is single-step: `POST /api/v1/employees` creates both user login credentials and employee profile

## Payroll scheduler

- The backend includes a simple cron-based payroll scheduler that creates payrolls for completed tasks in a period.
- Configuration and implementation live in [backend/src/jobs/payroll.scheduler.js](backend/src/jobs/payroll.scheduler.js#L1).
- Control the scheduler with environment variables documented in `backend/README.md`.