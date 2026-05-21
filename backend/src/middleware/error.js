const logger = require("../config/logger.config")
const { errorResponse } = require("../utils/response")

const formatZodIssues = (error) =>
  error?.issues?.map((issue) => {
    const field = issue?.path?.length ? issue.path.join(".") : "payload"
    const message =
      issue?.code === "invalid_type" &&
      String(issue?.message || "").includes("received undefined")
        ? `${field} is required`
        : issue?.message || "Invalid value"

    return { field, message }
  })

/**
 * 404 Not Found middleware
 */
const notFound = (req, res) => {
  const message = `Route not found: ${req.originalUrl}`
  logger.warn(message, { method: req.method, path: req.path })

  const { response, statusCode } = errorResponse(message, 404)
  res.status(statusCode).json(response)
}

/**
 * Global error handler middleware
 * Should be the last middleware in the chain
 */
const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500
  const message = error.message || "Internal Server Error"
  const isOperational = error.isOperational || false

  // Log error
  const logMeta = {
    method: req.method,
    path: req.path,
    statusCode,
    isOperational,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  }

  if (statusCode >= 500) {
    logger.error(message, logMeta)
  } else if (statusCode >= 400) {
    logger.warn(message, logMeta)
  } else {
    logger.info(message, logMeta)
  }

  // Build response
  const response = {
    success: false,
    message,
  }

  const zodErrors = formatZodIssues(error)

  // Include error details in development
  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack
    if (zodErrors?.length) {
      response.errors = zodErrors
    }
  }

  // For operational errors, include errors array if it exists
  if (isOperational && zodErrors?.length) {
    response.errors = zodErrors
  }

  res.status(statusCode).json(response)
}

module.exports = {
  notFound,
  errorHandler,
}