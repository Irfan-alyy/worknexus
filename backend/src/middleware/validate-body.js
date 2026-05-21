const { errorResponse } = require("../utils/response")
const AppError = require("../utils/app-error")

/**
 * Body validation middleware factory
 * Validates req.body against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */

const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body)
      req.validatedBody = validatedData
      next()
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const errors = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }))
        const { response, statusCode } = errorResponse(
          "Validation failed",
          400,
          errors
        )
        return res.status(statusCode).json(response)
      }

      const { response, statusCode } = errorResponse(error.message, 400)
      return res.status(statusCode).json(response)
    }
  }
}

module.exports = validateBody
