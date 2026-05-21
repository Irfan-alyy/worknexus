const { Router } = require("express")
const { getHistoryController, createMessageController } = require("./chat.controller")
const auth = require("../../middleware/auth")

const router = Router()

router.get("/channels/:channelId/history", auth, getHistoryController)
router.post("/messages", auth, createMessageController)

module.exports = router