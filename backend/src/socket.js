const { socketEvents } = require("./config/socket.config")
const { registerChatSocketHandlers } = require("./features/chat/chat.socket")

function createSocketManager(io) {
  io.on(socketEvents.connection, (socket) => {
    registerChatSocketHandlers(socket, io)
  })

  return io
}

module.exports = {
  createSocketManager,
}