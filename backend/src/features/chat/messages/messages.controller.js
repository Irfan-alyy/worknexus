const { listChannelMessages, createMessage } = require("./messages.service")
const { successResponse } = require("../../../utils/response")

async function listChannelMessagesController(req, res, next) {
  try {
    const data = await listChannelMessages(req.params.channelId, req.user, {
      before: req.query.before,
      limit: req.query.limit,
    })
    const { response, statusCode } = successResponse(data)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function createMessageController(req, res, next) {
  try {
    const payload = req.validatedBody || req.body
    const message = await createMessage(payload, req.user)
    const { response, statusCode } = successResponse(message, "Message created", 201)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  listChannelMessagesController,
  createMessageController,
}