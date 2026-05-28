/**
 * Unified response utilities for consistent API responses
 */

/**
 * Success response wrapper
 * @param {*} data - Response data
 * @param {string} [message] - Optional message
 * @param {number} [statusCode=200] - HTTP status code
 * @returns {Object} Formatted success response
 */
const successResponse = (data, message = "Success", statusCode = 200) => {
  const response = {
    success: true,
    data,
  }

  if (message && message !== "Success") {
    response.message = message
  }

  return { response, statusCode }
}

/**
 * Error response wrapper
 * @param {string} message - Error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {Array} [errors] - Optional array of validation errors
 * @returns {Object} Formatted error response
 */
const errorResponse = (message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  }

  if (errors && Array.isArray(errors) && errors.length > 0) {
    response.errors = errors
  }

  return { response, statusCode }
}

module.exports = {
  successResponse,
  errorResponse,
}
