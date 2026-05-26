const { Router } = require("express")
const auth = require("../../../middleware/auth")
const validateBody = require("../../../middleware/validate-body")
const { 
  listChannelMessagesController, 
  createMessageController,
  addReactionController,
  removeReactionController 
} = require("./messages.controller")
const { createMessageSchema } = require("./messages.schema")
const { createReactionSchema } = require("../../../utils/validation-schemas")

const router = Router()

router.get("/channels/:channelId/messages", auth, listChannelMessagesController)
router.post("/messages", auth, validateBody(createMessageSchema), createMessageController)

// Reactions
router.post("/reactions", auth, validateBody(createReactionSchema), addReactionController)
router.delete("/messages/:messageId/reactions/:emoji", auth, removeReactionController)

module.exports = router