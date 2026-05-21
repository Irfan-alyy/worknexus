const { Router } = require("express")
const {
  listClientsController,
  getClientController,
  createClientController,
  updateClientController,
} = require("./clients.controller")
const auth = require("../../middleware/auth")
const requireRole = require("../../middleware/rbac")
const validateBody = require("../../middleware/validate-body")
const { createClientSchema, updateClientSchema } = require("../../utils/validation-schemas")

const router = Router()

// GET /api/v1/clients - list all clients (authenticated)
router.get("/", auth, listClientsController)

// GET /api/v1/clients/:id - get client by id (authenticated)
router.get("/:id", auth, getClientController)

// POST /api/v1/clients - create a client (admin, hr)
router.post("/", auth, requireRole(["admin", "hr"]), validateBody(createClientSchema), createClientController)

// PATCH /api/v1/clients/:id - update client (admin, hr)
router.patch("/:id", auth, requireRole(["admin", "hr"]), validateBody(updateClientSchema), updateClientController)

module.exports = router
