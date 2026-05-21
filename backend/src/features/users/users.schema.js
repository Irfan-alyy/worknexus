const { z } = require("zod")
const { ROLES } = require("../../utils/validation-schemas")

const createUserSchema = z.object({
  email: z.string().email("Invalid email format").min(5).max(255),
  password: z.string().min(6).max(255),
  role: z.enum(ROLES).default("employee"),
})

const updateUserSchema = z.object({
  email: z.string().email("Invalid email format").min(5).max(255).optional(),
  password: z.string().min(6).max(255).optional(),
  role: z.enum(ROLES).optional(),
})

module.exports = {
  createUserSchema,
  updateUserSchema,
}
