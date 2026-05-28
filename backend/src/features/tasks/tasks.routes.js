const { Router } = require("express")
const auth = require("../../middleware/auth")
const requireRole = require("../../middleware/rbac")
const validateBody = require("../../middleware/validate-body")

const {
  listTasksController,
  getTaskController,
  createTaskController,
  updateTaskController,
  deleteTaskController,
} = require("./tasks.controller")

const { createTaskSchema, updateTaskSchema } = require("../../utils/validation-schemas")

const router = Router()

// GET /api/v1/tasks - list tasks
router.get("/", auth, listTasksController)

// GET /api/v1/tasks/:id - get task
router.get("/:id", auth, getTaskController)

// POST /api/v1/tasks - create task (authenticated roles; controller enforces finer checks)
router.post("/", auth, requireRole(["admin", "hr", "pm", "employee"]), validateBody(createTaskSchema), createTaskController)

// PATCH /api/v1/tasks/:id - update task
router.patch("/:id", auth, requireRole(["admin", "hr", "pm", "employee"]), validateBody(updateTaskSchema), updateTaskController)

// DELETE /api/v1/tasks/:id - delete task
router.delete("/:id", auth, requireRole(["admin", "hr", "pm"]), deleteTaskController)

module.exports = router
