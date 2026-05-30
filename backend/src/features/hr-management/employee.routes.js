const { Router } = require("express")
const {
	listEmployeesController,
	getEmployeeController,
	createEmployeeController,
	updateEmployeeController,
} = require("./employee.controller")
const { getActivities, getActivityMetrics } = require("../activities/activities.controller")
const auth = require("../../middleware/auth")
const requireRole = require("../../middleware/rbac")
const validateBody = require("../../middleware/validate-body")
const { createEmployeeSchema, updateEmployeeSchema } = require("../../utils/validation-schemas")

const router = Router()

// GET /api/v1/employees - list all employees (admin, hr, pm)
router.get("/", auth, requireRole(["admin", "hr", "pm"]), listEmployeesController)

// GET /api/v1/employees/:id - get single employee by id (admin, hr, pm, employee himself)
router.get("/:id", auth, requireRole(["admin", "hr", "pm", "employee"]), getEmployeeController)

// POST /api/v1/employees - create employee profile and login account (admin, hr)
router.post("/", auth, requireRole(["admin", "hr"]), validateBody(createEmployeeSchema), createEmployeeController)

// PATCH /api/v1/employees/:id - update employee (admin, hr, pm, employee himself)
router.patch("/:id", auth, requireRole(["admin", "hr", "pm", "employee"]), validateBody(updateEmployeeSchema), updateEmployeeController)

// GET /api/v1/employees/:id/activities - get employee activities
router.get("/:id/activities", auth, getActivities)

// GET /api/v1/employees/:id/activities/metrics - get employee activity metrics
router.get("/:id/activities/metrics", auth, getActivityMetrics)

module.exports = router