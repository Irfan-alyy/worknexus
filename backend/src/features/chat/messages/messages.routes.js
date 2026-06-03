const { Router } = require("express")
const auth = require("../../../middleware/auth")
const validateBody = require("../../../middleware/validate-body")
const { 
  listChannelMessagesController, 
  createMessageController,
  updateMessageController,
  deleteMessageController,
  addReactionController,
  removeReactionController 
} = require("./messages.controller")
const { createMessageSchema, updateMessageSchema } = require("./messages.schema")
const { createReactionSchema } = require("../../../utils/validation-schemas")

const router = Router()

router.get("/channels/:channelId/messages", auth, listChannelMessagesController)
router.post("/messages", auth, validateBody(createMessageSchema), createMessageController)

// Edit/Delete
router.patch("/messages/:messageId", auth, validateBody(updateMessageSchema), updateMessageController)
router.delete("/messages/:messageId", auth, deleteMessageController)

// Reactions
router.post("/reactions", auth, validateBody(createReactionSchema), addReactionController)
router.delete("/messages/:messageId/reactions/:emoji", auth, removeReactionController)

module.exports = router
