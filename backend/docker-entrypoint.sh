#!/bin/sh
set -e

# Wait for Postgres to become available
DB_HOST=${POSTGRES_HOST:-postgres_db}
DB_PORT=${POSTGRES_PORT:-5432}

echo "Waiting for database ${DB_HOST}:${DB_PORT}..."
until nc -z -v -w30 "$DB_HOST" "$DB_PORT"; do
  echo "Waiting for database..."
  sleep 1
done

echo "Database is available. Running Prisma migrations..."

# Run migrations (idempotent in production)
npx prisma migrate deploy --config prisma.config.cjs

echo "Migrations applied. Starting application..."

exec "$@"
