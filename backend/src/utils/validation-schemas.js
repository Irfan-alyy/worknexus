const { z } = require("zod")

/**
 * Centralized Zod schema definitions for all entities
 */

// Enum values
const ROLES = ["admin", "hr", "pm", "employee"]
const PAYMENT_MODELS = ["fixed", "hourly", "revenue_share"]
const TASK_STATUSES = ["pending", "in_progress", "completed", "blocked"]
const PROJECT_STATUSES = ["pending", "active", "completed"]
const PAYMENT_STATUSES = ["pending", "processed", "paid"]

// User schemas
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

// Department schemas
const createDepartmentSchema = z.object({
  name: z.string().min(1).max(255),
})

const updateDepartmentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
})

// Employee schemas
const createEmployeeSchema = z.object({
  first_name: z.string().min(1).max(255),
  last_name: z.string().min(1).max(255),
  employee_code: z.string().min(1).max(255),
  department_id: z.number().int().positive(),
  hire_date: z.string().datetime().or(z.date()),
  payment_model: z.enum(PAYMENT_MODELS),
  base_salary: z.number().positive().optional(),
  hourly_rate: z.number().positive().optional(),
})

const updateEmployeeSchema = z.object({
  first_name: z.string().min(1).max(255).optional(),
  last_name: z.string().min(1).max(255).optional(),
  employee_code: z.string().min(1).max(255).optional(),
  department_id: z.number().int().positive().optional(),
  hire_date: z.string().datetime().or(z.date()).optional(),
  payment_model: z.enum(PAYMENT_MODELS).optional(),
  base_salary: z.number().positive().optional(),
  hourly_rate: z.number().positive().optional(),
})

// Client schemas
const createClientSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email("Invalid email format"),
  company: z.string().min(1).max(255),
})

const updateClientSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email("Invalid email format").optional(),
  company: z.string().min(1).max(255).optional(),
})

// Project schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(PROJECT_STATUSES).default("pending"),
  client_id: z.number().int().positive(),
})

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  client_id: z.number().int().positive().optional(),
})

// Task schemas
const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  status: z.enum(TASK_STATUSES).default("pending"),
  due_date: z.string().datetime().or(z.date()).optional(),
  project_id: z.number().int().positive(),
  employee_id: z.number().int().positive().optional(),
})

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  due_date: z.string().datetime().or(z.date()).optional(),
  employee_id: z.number().int().positive().optional(),
})

// TimeLog schemas
const createTimeLogSchema = z.object({
  task_id: z.number().int().positive(),
  employee_id: z.number().int().positive(),
  hours: z.number().positive().max(24),
  description: z.string().optional(),
  logged_at: z.string().datetime().or(z.date()).optional(),
})

// Payroll schemas
const createPayrollSchema = z.object({
  employee_id: z.number().int().positive(),
  amount: z.number().positive(),
  payment_status: z.enum(PAYMENT_STATUSES).default("pending"),
  pay_period_start: z.string().datetime().or(z.date()),
  pay_period_end: z.string().datetime().or(z.date()),
})

const updatePayrollSchema = z.object({
  payment_status: z.enum(PAYMENT_STATUSES).optional(),
})

// Channel schemas
const createChannelSchema = z.object({
  name: z.string().min(1).max(255),
  is_private: z.boolean().default(false),
})

const updateChannelSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  is_private: z.boolean().optional(),
})

// Message schemas
const createMessageSchema = z.object({
  content: z.string().min(1),
  channel_id: z.string().uuid(),
  parent_id: z.string().uuid().optional().nullable(),
})

// Reaction schemas
const createReactionSchema = z.object({
  message_id: z.string().uuid(),
  emoji: z.string().min(1).max(50),
})

// Auth schemas
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1),
})

/**
 * Validate data against a Zod schema
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {*} data - Data to validate
 * @returns {Object} { valid: boolean, data?: *, errors?: string[] }
 */
const validateSchema = (schema, data) => {
  try {
    const validatedData = schema.parse(data)
    return { valid: true, data: validatedData }
  } catch (error) {
    if (error.errors && Array.isArray(error.errors)) {
      const errors = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      )
      return { valid: false, errors }
    }
    return { valid: false, errors: [error.message] }
  }
}

module.exports = {
  // Schema definitions
  createUserSchema,
  updateUserSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  createClientSchema,
  updateClientSchema,
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  updateTaskSchema,
  createTimeLogSchema,
  createPayrollSchema,
  updatePayrollSchema,
  createChannelSchema,
  updateChannelSchema,
  createMessageSchema,
  createReactionSchema,
  loginSchema,

  // Enums
  ROLES,
  PAYMENT_MODELS,
  TASK_STATUSES,
  PROJECT_STATUSES,
  PAYMENT_STATUSES,

  // Validator
  validateSchema,
}
