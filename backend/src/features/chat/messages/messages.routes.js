const { Router } = require("express")
const auth = require("../../../middleware/auth")
const validateBody = require("../../../middleware/validate-body")
const { listChannelMessagesController, createMessageController } = require("./messages.controller")
const { createMessageSchema } = require("./messages.schema")

const router = Router()

router.get("/channels/:channelId/messages", auth, listChannelMessagesController)
router.post("/messages", auth, validateBody(createMessageSchema), createMessageController)

module.exports = router