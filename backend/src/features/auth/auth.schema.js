const { z } = require("zod")

/**
 * Login validation schema
 * Email and password are required
 */
const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
})

/**
 * Register validation schema
 * Email, password, and role are required
 * Role must be one of: admin, hr, pm, employee
 */
const registerSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
  role: z
    .enum(["admin", "hr", "pm", "employee"], {
      required_error: "Role is required",
      invalid_enum_value: "Invalid role. Must be admin, hr, pm, or employee",
    })
    .default("employee"),
})

function formatZodErrors(error) {
  return (
    error?.issues?.map((issue) => {
      const path = issue?.path?.length ? issue.path.join(".") : "payload"
      const message =
        issue?.code === "invalid_type" &&
        String(issue?.message || "").includes("received undefined")
          ? `${path} is required`
          : issue?.message || "Invalid value"

      return `${path}: ${message}`
    }) || ["Invalid request payload"]
  )
}

/**
 * Validate login payload
 * @param {Object} payload - Login request payload
 * @returns {Object} { valid, errors, data }
 */
function validateLoginPayload(payload = {}) {
  const result = loginSchema.safeParse(payload ?? {})

  if (!result?.success) {
    return { valid: false, errors: formatZodErrors(result?.error), data: null }
  }

  return { valid: true, errors: [], data: result.data }
}

/**
 * Validate register payload
 * @param {Object} payload - Register request payload
 * @returns {Object} { valid, errors, data }
 */
function validateRegisterPayload(payload = {}) {
  const result = registerSchema.safeParse(payload ?? {})

  if (!result?.success) {
    return { valid: false, errors: formatZodErrors(result?.error), data: null }
  }

  return { valid: true, errors: [], data: result.data }
}

module.exports = {
  validateLoginPayload,
  validateRegisterPayload,
}