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