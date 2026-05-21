import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Use `env()` to enforce the variable exists, or `process.env` if optional
    url: env('DATABASE_URL'),
  },
})
