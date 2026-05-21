/**
 * Application constants and enumerations
 */

const ROLES = {
  ADMIN: "admin",
  HR: "hr",
  PM: "pm",
  EMPLOYEE: "employee",
}

const PAYMENT_MODELS = {
  FIXED: "fixed",
  HOURLY: "hourly",
  REVENUE_SHARE: "revenue_share",
}

const TASK_STATUSES = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  BLOCKED: "blocked",
}

const PROJECT_STATUSES = {
  PENDING: "pending",
  ACTIVE: "active",
  COMPLETED: "completed",
}

const PAYMENT_STATUSES = {
  PENDING: "pending",
  PROCESSED: "processed",
  PAID: "paid",
}

const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
}

// Get environment configuration
function getAppConfig() {
  const nodeEnv = process.env.NODE_ENV || "development"
  const apiVersion = process.env.API_VERSION || "v1"
  const port = Number(process.env.PORT || 3000)

  return {
    nodeEnv,
    apiVersion,
    port,
    isProduction: nodeEnv === "production",
    isDevelopment: nodeEnv === "development",
  }
}

module.exports = {
  ROLES,
  PAYMENT_MODELS,
  TASK_STATUSES,
  PROJECT_STATUSES,
  PAYMENT_STATUSES,
  PRIORITY_LEVELS,
  getAppConfig,
}
