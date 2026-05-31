const express = require("express")
const helmet = require("helmet")
const corsMiddleware = require("./middleware/cors")
const requestLogger = require("./middleware/request-logger")
const rateLimiter = require("./middleware/rate-limiter")
const { notFound, errorHandler } = require("./middleware/error")

// Feature routes
const authRoutes = require("./features/auth/auth.routes")
const chatRoutes = require("./features/chat/chat.routes")
const payrollRoutes = require("./features/payroll/payroll.routes")
const employeeRoutes = require("./features/hr-management/employee.routes")
const departmentRoutes = require("./features/departments/departments.routes")
const clientRoutes = require("./features/clients/clients.routes")
const userRoutes = require("./features/users/users.routes")
const projectRoutes = require("./features/projects/projects.routes")
const tasksRoutes = require("./features/tasks/tasks.routes")
const timeLogsRoutes = require("./features/time-logs/time-logs.routes")
const pmRoutes = require("./features/pm/pm.routes")
const activitiesRoutes = require("./features/activities/activities.routes")
const { successResponse } = require("./utils/response")
const app = express()

/**
 * MIDDLEWARE SETUP
 * Order matters: body parsers -> CORS -> security -> logging -> rate limiting -> auth -> routes
 */

// 1. Body parser and URL encoder
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 2. Security headers
app.use(helmet())

// 3. CORS configuration
app.use(corsMiddleware)

// 4. Request logging
app.use(requestLogger)

// 5. Rate limiting (general)
app.use(rateLimiter({ limit: 200, windowMs: 60_000 }))

/**
 * HEALTH CHECK ENDPOINT
 * No authentication required
 */
app.get("/api/v1/health", (req, res) => {
  const { response, statusCode } = successResponse({ uptime: process.uptime() }, "Server is healthy")
  return res.status(statusCode).json(response)
})

/**
 * FEATURE ROUTES
 * Auth routes don't require authentication (handles their own)
 */
app.use("/api/v1/auth", authRoutes)

// Chat routes (authenticated)
app.use("/api/v1/chat", chatRoutes)

// Payroll routes (authenticated)
app.use("/api/v1/payroll", payrollRoutes)

// Employee routes (authenticated)
app.use("/api/v1/employees", employeeRoutes)

// Identity routes (authenticated)
app.use("/api/v1/departments", departmentRoutes)
app.use("/api/v1/clients", clientRoutes)
app.use("/api/v1/users", userRoutes)
// Projects routes
app.use("/api/v1/projects", projectRoutes)

// PM routes (project manager dashboard)
app.use("/api/v1/pm", pmRoutes)

// Tasks and TimeLogs routes
app.use("/api/v1/tasks", tasksRoutes)
app.use("/api/v1/time-logs", timeLogsRoutes)

// Activities routes (HR and Admin dashboards)
app.use("/api/v1", activitiesRoutes)

/**
 * ERROR HANDLING
 * 404 handler must come before general error handler
 */
app.use(notFound)

/**
 * Global error handler (must be last)
 * Must have 4 parameters (err, req, res, next) for Express to recognize it as error handler
 */
app.use(errorHandler)

module.exports = app