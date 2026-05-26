const { Router } = require("express")
const channelRoutes = require("./channels/channels.routes")
const messageRoutes = require("./messages/messages.routes")

const router = Router()

router.use(channelRoutes)
router.use(messageRoutes)

module.exports = router