const { Router } = require("express")
const { listPayrollsController, getPayrollController, calculatePayrollController, updatePayrollController } = require("./payroll.controller")
const auth = require("../../middleware/auth")
const requireRole = require("../../middleware/rbac")
const validateBody = require("../../middleware/validate-body")
const { calculatePayrollSchema, updatePayrollStatusSchema } = require("../../utils/validation-schemas")

const router = Router()

// GET /api/v1/payroll - list payrolls (admin/hr full access, employee/pm self-only)
router.get("/", auth, requireRole(["admin", "hr", "pm", "employee"]), listPayrollsController)

// GET /api/v1/payroll/:id - get single payroll (admin/hr full access, employee/pm self-only)
router.get("/:id", auth, requireRole(["admin", "hr", "pm", "employee"]), getPayrollController)

// POST /api/v1/payroll/calculate - calculate (and optionally create) payroll
router.post("/calculate", auth, requireRole(["admin", "hr"]), validateBody(calculatePayrollSchema), calculatePayrollController)

// PATCH /api/v1/payroll/:id - update payroll status
router.patch("/:id", auth, requireRole(["admin", "hr"]), validateBody(updatePayrollStatusSchema), updatePayrollController)

module.exports = router