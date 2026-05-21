# Base image running on light alpine
FROM node:20-alpine

# Install system dependencies required for Prisma client engines on Alpine and for wait utilities
RUN apk add --no-cache openssl libc6-compat bash netcat-openbsd

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install packages (including devDeps so Prisma CLI is available at build/runtime)
RUN npm ci

# Copy full application code (including the prisma directory)
COPY . .

# Generate the Prisma Client specifically tailored for the target container architecture
RUN npx prisma generate --config prisma.config.cjs || npx prisma generate --config prisma.config.ts

# Copy and make entrypoint executable
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

# Entrypoint will run migrations then start the app
ENTRYPOINT ["sh", "/app/docker-entrypoint.sh"]
CMD ["npm", "run", "start:prod"]