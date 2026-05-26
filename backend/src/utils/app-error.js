/**
 * Custom application error class for operational and programming errors
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message)

    this.statusCode = statusCode
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"
    this.isOperational = isOperational
    this.timestamp = new Date().toISOString()

    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Create a validation error
   * @param {string} message
   * @param {Array} errors - Array of validation errors
   * @returns {AppError}
   */
  static validationError(message, errors) {
    const error = new AppError(message, 400, true)
    error.errors = errors
    return error
  }

  /**
   * Create an unauthorized error
   * @param {string} message
   * @returns {AppError}
   */
  static unauthorized(message = "Unauthorized") {
    return new AppError(message, 401, true)
  }

  /**
   * Create a forbidden error
   * @param {string} message
   * @returns {AppError}
   */
  static forbidden(message = "Forbidden") {
    return new AppError(message, 403, true)
  }

  /**
   * Create a not found error
   * @param {string} message
   * @returns {AppError}
   */
  static notFound(message = "Resource not found") {
    return new AppError(message, 404, true)
  }

  /**
   * Create a conflict error (duplicate, constraint violation)
   * @param {string} message
   * @returns {AppError}
   */
  static conflict(message = "Conflict") {
    return new AppError(message, 409, true)
  }
}

module.exports = AppError