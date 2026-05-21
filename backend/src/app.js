const express = require("express")
const helmet = require("helmet")
const corsMiddleware = require("./middleware/cors")
const requestLogger = require("./middleware/request-logger")
const rateLimiter = require("./middleware/rate-limiter")
const auth = require("./middleware/auth")
const { notFound, errorHandler } = require("./middleware/error")

// Feature routes
const authRoutes = require("./features/auth/auth.routes")
const chatRoutes = require("./features/chat/chat.routes")
const payrollRoutes = require("./features/payroll/payroll.routes")
const employeeRoutes = require("./features/hr-management/employee.routes")
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
app.get("/health", (req, res) => {
  const response= successResponse("Server is healthy")
  res.json(response)
})

/**
 * FEATURE ROUTES
 * Auth routes don't require authentication (handles their own)
 */
app.use("/api/v1/auth", authRoutes)

/**
 * Protected routes (require authentication)
 * Apply auth middleware before protected route handlers
 */
app.use(auth)

// Chat routes (authenticated)
app.use("/api/v1/chat", chatRoutes)

// Payroll routes (authenticated)
app.use("/api/v1/payroll", payrollRoutes)

// Employee routes (authenticated)
app.use("/api/v1/employees", employeeRoutes)

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