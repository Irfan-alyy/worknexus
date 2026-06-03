const { listChannelMessages, createMessage, toggleReaction, updateMessage, deleteMessage } = require("./messages.service")
const { successResponse } = require("../../../utils/response")
const { socketEvents } = require("../../../config/socket.config")
const { log } = require("../../../utils/logger")

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

    // Broadcast via socket
    const io = req.app.get("io")
    if (io) {
      console.log("IO EXISTS:", !!io)
      console.log("SOCKET COUNT:", io.engine.clientsCount)
      log("info", `[SOCKET BROADCAST] Emitting chat:message to room ${message.channelId} for message ${message.id}`)
      io.to(message.channelId).emit(socketEvents.chatMessage, message)
    } else {
      log("warn", `[SOCKET ERROR] Socket instance (io) not found on req.app during createMessageController`)
    }

    const { response, statusCode } = successResponse(message, "Message created", 201)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function addReactionController(req, res, next) {
  try {
    const payload = req.validatedBody || req.body
    const messageId = payload.message_id
    const emoji = payload.emoji

    const reactionData = await toggleReaction(messageId, emoji, req.user, "add")

    const io = req.app.get("io")
    if (io) {
      log("info", `[SOCKET BROADCAST] Emitting chat:reaction:add to room ${reactionData.channelId} for message ${messageId}`)
      io.to(reactionData.channelId).emit("chat:reaction:add", reactionData.reaction)
    }

    const { response, statusCode } = successResponse(reactionData.reaction, "Reaction added", 201)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function removeReactionController(req, res, next) {
  try {
    const { messageId, emoji } = req.params;
    const reactionData = await toggleReaction(messageId, emoji, req.user, "remove")

    const io = req.app.get("io")
    if (io) {
      log("info", `[SOCKET BROADCAST] Emitting chat:reaction:remove to room ${reactionData.channelId} for message ${messageId}`)
      io.to(reactionData.channelId).emit("chat:reaction:remove", {
        messageId,
        userId: Number(req.user.id),
        emoji
      })
    }

    const { response, statusCode } = successResponse(null, "Reaction removed", 200)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function updateMessageController(req, res, next) {
  try {
    const { messageId } = req.params
    const payload = req.validatedBody || req.body

    const updated = await updateMessage(messageId, payload, req.user)

    const io = req.app.get("io")
    if (io) {
      log("info", `[SOCKET BROADCAST] Emitting chat:message:updated to room ${updated.channelId} for message ${updated.id}`)
      io.to(updated.channelId).emit("chat:message:updated", updated)
    }

    const { response, statusCode } = successResponse(updated, "Message updated", 200)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function deleteMessageController(req, res, next) {
  try {
    const { messageId } = req.params
    const deleted = await deleteMessage(messageId, req.user)

    const io = req.app.get("io")
    log(
      "info",
      `[SOCKET BROADCAST] Emitting chat:message:deleted to room ${deleted.channelId} for message ${messageId}`,
    )
    io.to(deleted.channelId).emit("chat:message:deleted", { messageId: messageId })

    const { response, statusCode } = successResponse(null, "Message deleted", 200)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  listChannelMessagesController,
  createMessageController,
  updateMessageController,
  deleteMessageController,
  addReactionController,
  removeReactionController,
}

