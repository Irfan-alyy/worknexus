const { socketEvents } = require("../../config/socket.config")
const { log } = require("../../utils/logger")

function registerChatSocketHandlers(socket, io) {
  socket.on(socketEvents.chatJoin, ({ channelId }) => {
    // Optionally: could verify channel membership here, but for now we join the room.
    // The strict authorization occurs during REST calls.
    log("info", `[SOCKET] User ${socket.user.id} joining channel room: ${channelId}`)
    socket.join(channelId)
  })

  socket.on(socketEvents.chatLeave, ({ channelId }) => {
    log("info", `[SOCKET] User ${socket.user.id} leaving channel room: ${channelId}`)
    socket.leave(channelId)
  })

  socket.on(socketEvents.chatMessage, (payload) => {
    // Deprecated for creating. Used if clients want to push messages directly 
    // but we suggest using REST to create, then REST emits it.
    log("info", `[SOCKET] User ${socket.user.id} pushed direct socket message to channel: ${payload.channelId} (Deprecated path)`)
    io.to(payload.channelId).emit(socketEvents.chatMessage, payload)
  })

  // Handle typing indicators
  socket.on("chat:typing", (payload) => {
    const { channelId, isTyping } = payload;
    if (channelId) {
      log("info", `[SOCKET] User ${socket.user.id} typing in ${channelId}: ${isTyping}`)
      socket.to(channelId).emit("chat:typing", {
        channelId,
        userId: socket.user.id,
        isTyping
      })
    }
  })
}

module.exports = {
  registerChatSocketHandlers,
}