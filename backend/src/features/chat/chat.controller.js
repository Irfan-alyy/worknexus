const { getChannelHistory, createMessage } = require("./chat.service")
const { validateMessagePayload } = require("./chat.schema")

function getHistoryController(req, res) {
  const history = getChannelHistory(req.params.channelId)
  return res.json({ success: true, data: history })
}

function createMessageController(req, res) {
  const validation = validateMessagePayload(req.body)

  if (!validation.valid) {
    return res.status(400).json({ success: false, message: validation.errors.join(", ") })
  }

  const message = createMessage(req.body)
  return res.status(201).json({ success: true, data: message })
}

module.exports = {
  getHistoryController,
  createMessageController,
}