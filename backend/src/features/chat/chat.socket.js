const { socketEvents } = require("../../config/socket.config")

function registerChatSocketHandlers(socket, io) {
  socket.on(socketEvents.chatJoin, ({ channelId }) => {
    socket.join(channelId)
  })

  socket.on(socketEvents.chatLeave, ({ channelId }) => {
    socket.leave(channelId)
  })

  socket.on(socketEvents.chatMessage, (payload) => {
    io.to(payload.channelId).emit(socketEvents.chatMessage, payload)
  })
}

module.exports = {
  registerChatSocketHandlers,
}