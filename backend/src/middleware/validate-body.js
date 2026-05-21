const { errorResponse } = require("../utils/response")

const formatZodIssue = (issue) => {
  const field = issue?.path?.length ? issue.path.join(".") : "payload"
  const message =
    issue?.code === "invalid_type" &&
    String(issue?.message || "").includes("received undefined")
      ? `${field} is required`
      : issue?.message || "Invalid value"

  return { field, message }
}

/**
 * Body validation middleware factory
 * Validates req.body against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */

const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body ?? {})

      if (!result?.success) {
        const errors = result?.error?.issues?.map(formatZodIssue)

        const { response, statusCode } = errorResponse(
          "Validation failed",
          400,
          errors?.length ? errors : [{ field: "payload", message: "Invalid request payload" }]
        )
        return res.status(statusCode).json(response)
      }

      const validatedData = result.data
      req.validatedBody = validatedData
      next()
    } catch (error) {
      const { response, statusCode } = errorResponse(
        error?.message || "Validation failed",
        400
      )
      return res.status(statusCode).json(response)
    }
  }
}

module.exports = validateBody
