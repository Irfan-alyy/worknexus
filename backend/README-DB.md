# WorkNexus Database Setup Guide

This document outlines the exact terminal commands needed to set up the PostgreSQL database and Prisma client for the WorkNexus project.

## Prerequisites

Ensure you have:
- **PostgreSQL** installed and running locally
- **Node.js** and npm installed
- **Database credentials** configured in `.env` file

## Step 1: Environment Configuration

The `.env` file is already created at the root of the `backend/` directory with the following structure:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://irfan:your_local_password@localhost:5432/worknexus_db?schema=public"
JWT_SECRET="development_secret_key_change_in_production"
```

**Update the connection string** with your local PostgreSQL credentials:
- Replace `your_local_password` with your PostgreSQL password
- Adjust `localhost` and port `5432` if your database is on a different host/port
- Ensure the database `worknexus_dev` exists, or Prisma will create it

## Prisma v7 notes (JS projects)

Prisma v7 moves the datasource connection URL out of `schema.prisma` and into a Prisma config file (for example `prisma.config.ts` or a JS/CJS equivalent). Since this repository is a JavaScript (CommonJS) project, you have two options:

- Keep the existing `prisma.config.ts` (works fine) and pass it to CLI commands using `--config prisma.config.ts`.
- Create a CommonJS config file `prisma.config.cjs` to avoid TypeScript in your tooling. Example `prisma.config.cjs` content:

```cjs
require('dotenv/config')
const { defineConfig } = require('prisma/config')

module.exports = defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL },
})
```

When running Prisma CLI commands, explicitly pass the config file if it's not `prisma.config.ts` at project root (or if you prefer explicitness):

```bash
# use the JS/CJS config
npx prisma generate --config prisma.config.cjs
npx prisma migrate dev --config prisma.config.cjs --name init
npx prisma db pull --config prisma.config.cjs
```

If you already have `prisma.config.ts`, use `--config prisma.config.ts` instead:

```bash
npx prisma generate --config prisma.config.ts
npx prisma migrate dev --config prisma.config.ts --name init
```

Note: `npx prisma generate` may fail if `DATABASE_URL` is not present when the config uses `env()`; in CI where the URL may not be set, use `process.env.DATABASE_URL ?? ''` in the config or avoid `env()` to prevent hard failures.

## Step 2: Install Dependencies

Install all required Node.js packages (including Prisma, @prisma/client, and dotenv):

```bash
cd backend
npm install
```

This installs:
- `@prisma/client` - Prisma database client
- `prisma` - Prisma CLI (devDependency)
- `dotenv` - Environment variable management

## Step 3: Create and Migrate the Database

### 3a. Format the Prisma Schema

Ensure your schema follows Prisma conventions:

```bash
npx prisma format
```

### 3b. Create Database and Apply Migrations

Initialize the database schema by running the Prisma migration:

```bash
npx prisma migrate dev --name init
```

**What this does:**
- Creates the PostgreSQL database if it doesn't exist
- Creates all tables defined in `prisma/schema.prisma`
- Generates the Prisma Client
- Creates a migration file in `prisma/migrations/`

If you've already created migrations and just want to apply them:

```bash
npx prisma migrate deploy
```

## Step 4: Verify Database Setup

View your database schema in an interactive UI:

```bash
npx prisma studio
```

This opens a browser-based interface at `http://localhost:5555` where you can:
- View all tables and their data
- Create, update, and delete records
- Test relationships between models

## Step 5: Seed the Database (Optional)

If you have a seed script in `prisma/seed.js`, populate the database with initial data:

```bash
npx prisma db seed
```

Or manually via:

```bash
node prisma/seed.js
```

---

## Common Commands Reference

| Command | Description |
|---------|-------------|
| `npx prisma migrate dev --name <migration_name>` | Create and apply a new migration |
| `npx prisma migrate deploy` | Apply pending migrations (production-safe) |
| `npx prisma migrate reset` | Reset database and reapply all migrations (dev only) |
| `npx prisma studio` | Open the interactive database UI |
| `npx prisma format` | Format the Prisma schema |
| `npx prisma generate` | Regenerate the Prisma Client |
| `npx prisma db pull` | Introspect existing database schema |

---

## Troubleshooting

### Database Connection Failed
- Verify PostgreSQL is running: `sudo systemctl status postgresql` (Linux)
- Check credentials in `.env` match your PostgreSQL setup
- Ensure the database exists or PostgreSQL has permission to create it

### Port Already in Use
- Change `DATABASE_URL` port in `.env`
- Or kill the existing process using the port

### Prisma Client Out of Sync
Regenerate the Prisma Client:
```bash
npx prisma generate
```

### Schema Drift Detected
If Prisma detects inconsistencies between local migrations and database:
```bash
npx prisma migrate resolve --rolled-back <migration_name>
```

Or reset entirely (dev only):
```bash
npx prisma migrate reset
```

---

## Using the Prisma Client in Your Application

Import the singleton client in your application files:

```javascript
import prisma from './src/config/db.config.js';

// Example query
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});
```

The singleton pattern ensures HMR doesn't exhaust database connections during development.

---

## Production Deployment

For Ubuntu/Linux production deployment:

1. Set `NODE_ENV=production` in your environment
2. Use a managed PostgreSQL service or Docker container
3. Run migrations before starting the app:
   ```bash
   npx prisma migrate deploy
   ```
4. Keep your `.env` file with production credentials secure (use secrets management)

---

**Questions?** Refer to [Prisma Documentation](https://www.prisma.io/docs/) for more advanced configurations.
