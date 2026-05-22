const { z } = require("zod")
const { PROJECT_STATUSES } = require("../../utils/validation-schemas")

const normalizeProjectPayload = (payload = {}) => ({
  name: payload.name,
  description: payload.description,
  status: payload.status,
  client_id: payload.client_id ?? payload.clientId,
  manager_employee_id: payload.manager_employee_id ?? payload.managerEmployeeId,
})

const createProjectSchema = z.preprocess(
  normalizeProjectPayload,
  z.object({
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    status: z.enum(PROJECT_STATUSES).default("pending"),
    client_id: z.number().int().positive(),
    manager_employee_id: z.number().int().positive().optional(),
  })
)

const updateProjectSchema = z.preprocess(
  normalizeProjectPayload,
  z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    status: z.enum(PROJECT_STATUSES).optional(),
    client_id: z.number().int().positive().optional(),
    manager_employee_id: z.number().int().positive().optional(),
  })
)

const addTeamMemberSchema = z.object({
  employee_id: z.number().int().positive(),
})

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  addTeamMemberSchema,
}
