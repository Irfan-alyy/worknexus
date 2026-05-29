const { Router } = require("express")
const auth = require("../../middleware/auth")
const requireRole = require("../../middleware/rbac")
const validateBody = require("../../middleware/validate-body")

const {
  listProjectsController,
  getProjectController,
  listProjectTasksController,
  createProjectController,
  updateProjectController,
  listProjectTeamController,
  addTeamMemberController,
  removeTeamMemberController,
} = require("./projects.controller")

const { createProjectSchema, updateProjectSchema, addTeamMemberSchema } = require("./projects.schema")

const router = Router()

// GET /api/v1/projects - list projects (scoped by role)
router.get("/", auth, listProjectsController)

// GET /api/v1/projects/:id - get project (scoped by role)
router.get("/:id", auth, getProjectController)

// GET /api/v1/projects/:id/tasks - paginated tasks for a project
router.get("/:id/tasks", auth, listProjectTasksController)

// POST /api/v1/projects - create project (admin, hr)
router.post("/", auth, requireRole(["admin", "hr"]), validateBody(createProjectSchema), createProjectController)

// PATCH /api/v1/projects/:id - update project (admin, hr, pm (if manager))
router.patch("/:id", auth, requireRole(["admin", "hr", "pm"]), validateBody(updateProjectSchema), updateProjectController)

// Team endpoints
// GET team
router.get("/:id/team", auth, listProjectTeamController)

// POST add member (admin, hr, pm (if manager))
router.post("/:id/team", auth, requireRole(["admin", "hr", "pm"]), validateBody(addTeamMemberSchema), addTeamMemberController)

// DELETE remove member (admin, hr, pm (if manager))
router.delete("/:id/team/:employeeId", auth, requireRole(["admin", "hr", "pm"]), removeTeamMemberController)

module.exports = router
