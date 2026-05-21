const { Router } = require("express")
const {
  listUsersController,
  getUserController,
  createUserController,
  updateUserController,
} = require("./users.controller")
const auth = require("../../middleware/auth")
const requireRole = require("../../middleware/rbac")
const validateBody = require("../../middleware/validate-body")
const { createUserSchema, updateUserSchema } = require("./users.schema")

const router = Router()

// GET /api/v1/users - list users (admin only)
router.get("/", auth, requireRole(["admin"]), listUsersController)

// GET /api/v1/users/:id - get user by id (admin or owner)
router.get("/:id", auth, getUserController)

// POST /api/v1/users - create user (admin only)
router.post("/", auth, requireRole(["admin"]), validateBody(createUserSchema), createUserController)

// PATCH /api/v1/users/:id - update user (admin or owner)
router.patch("/:id", auth, validateBody(updateUserSchema), updateUserController)

module.exports = router
