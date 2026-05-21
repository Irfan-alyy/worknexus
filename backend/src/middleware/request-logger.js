const logger = require("../config/logger.config")

/**
 * Request logging middleware
 * Logs incoming requests and response details
 */

const requestLogger = (req, res, next) => {
  // Skip health check endpoint
  if (req.path === "/health") {
    return next()
  }

  const start = Date.now()

  // Hook into res.json and res.status to capture response details
  const originalSend = res.send

  res.send = function (data) {
    const duration = Date.now() - start

    const logMeta = {
      method: req.method,
      path: req.path,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      statusCode: res.statusCode,
      durationMs: duration,
      ip: req.ip,
    }

    // Log based on status code
    if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${req.path} - ${res.statusCode}`, logMeta)
    } else {
      logger.info(`${req.method} ${req.path} - ${res.statusCode}`, logMeta)
    }

    return originalSend.call(this, data)
  }

  next()
}

module.exports = requestLogger
