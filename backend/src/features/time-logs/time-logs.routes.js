const { Router } = require("express")
const auth = require("../../middleware/auth")
const requireRole = require("../../middleware/rbac")
const validateBody = require("../../middleware/validate-body")

const { createTimeLogController, listTimeLogsController } = require("./time-logs.controller")
const { createTimeLogSchema } = require("../../utils/validation-schemas")

const router = Router()

// POST /api/v1/time-logs - create time log
router.post("/", auth, requireRole(["admin", "hr", "pm", "employee"]), validateBody(createTimeLogSchema), createTimeLogController)

// GET /api/v1/time-logs - list time logs (optional query: taskId, employeeId)
router.get("/", auth, requireRole(["admin", "hr", "pm", "employee"]), listTimeLogsController)

module.exports = router
