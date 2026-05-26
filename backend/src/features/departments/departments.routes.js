const { Router } = require("express")
const {
  listDepartmentsController,
  getDepartmentController,
  createDepartmentController,
  updateDepartmentController,
} = require("./departments.controller")
const auth = require("../../middleware/auth")
const requireRole = require("../../middleware/rbac")
const validateBody = require("../../middleware/validate-body")
const { createDepartmentSchema, updateDepartmentSchema } = require("../../utils/validation-schemas")

const router = Router()

// GET /api/v1/departments - list all departments (authenticated)
router.get("/", auth, listDepartmentsController)

// GET /api/v1/departments/:id - get department by id (authenticated)
router.get("/:id", auth, getDepartmentController)

// POST /api/v1/departments - create a department (admin, hr)
router.post("/", auth, requireRole(["admin", "hr"]), validateBody(createDepartmentSchema), createDepartmentController)

// PATCH /api/v1/departments/:id - update department (admin, hr)
router.patch("/:id", auth, requireRole(["admin", "hr"]), validateBody(updateDepartmentSchema), updateDepartmentController)

module.exports = router
