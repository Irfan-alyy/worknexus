const { Router } = require("express")
const requireRole = require("../../../middleware/rbac")
const auth = require("../../../middleware/auth")
const validateBody = require("../../../middleware/validate-body")
const {
  findOrCreateDMController,
  listChannelsController,
  listProjectChannelsController,
  getChannelController,
  createChannelController,
  updateChannelController,
  deleteChannelController,
  listChannelMembersController,
  addChannelMemberController,
  removeChannelMemberController,
} = require("./channels.controller")
const { createChannelSchema, updateChannelSchema, addChannelMembersSchema } = require("./channels.schema")

const router = Router()

router.get("/channels", auth, listChannelsController)
router.get("/projects/:projectId/channels", auth, listProjectChannelsController)
router.post("/dms/:receiverId", auth, findOrCreateDMController)
router.get("/channels/:channelId", auth, getChannelController)
router.post(
  "/channels",
  auth,
  requireRole(["admin", "hr", "pm"]),
  validateBody(createChannelSchema),
  createChannelController
)
router.patch(
  "/channels/:channelId",
  auth,
  requireRole(["admin", "hr", "pm"]),
  validateBody(updateChannelSchema),
  updateChannelController
)
router.delete("/channels/:channelId", auth, requireRole(["admin", "hr", "pm"]), deleteChannelController)

router.get("/channels/:channelId/members", auth, listChannelMembersController)
router.post(
  "/channels/:channelId/members",
  auth,
  requireRole(["admin", "hr", "pm"]),
  validateBody(addChannelMembersSchema),
  addChannelMemberController
)
router.delete(
  "/channels/:channelId/members/:userId",
  auth,
  requireRole(["admin", "hr", "pm"]),
  removeChannelMemberController
)

module.exports = router