const { socketEvents } = require("./config/socket.config")
const { registerChatSocketHandlers } = require("./features/chat/chat.socket")
const jwt = require("jsonwebtoken")
const { getEnvConfig } = require("./config/env.config")
const { log } = require("./utils/logger")

// In-memory presence tracker: Map<userId, Set<socketId>>
const userSockets = new Map()

function createSocketManager(io) {
  // Socket.IO authentication middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        log("warn", `[SOCKET] Connection rejected: No token provided (ID: ${socket.id})`);
        return next(new Error("Authentication error: No token provided"));
      }

      const { jwtSecret } = getEnvConfig();
      const decoded = jwt.verify(token, jwtSecret);
      
      socket.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      
      log("info", `[SOCKET] Authenticated user ${socket.user.id} (${socket.user.email}) successfully`);
      next();
    } catch (err) {
      log("error", `[SOCKET] Authentication error for socket ${socket.id}: ${err.message}`);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on(socketEvents.connection, (socket) => {
    const userId = Number(socket.user.id)
    log("info", `[SOCKET] User ${userId} fully connected. Socket ID: ${socket.id}`);
    
    // Add to presence tracker
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set())
      // Broadcast online status to all connected clients
      log("info", `[SOCKET] Broadcasting user:online for user ${userId}`);
      io.emit("user:online", { userId })
    }
    userSockets.get(userId).add(socket.id)

    // Send initial statuses to the newly connected user immediately (optional, or rely on active polling)
    // socket.emit("users:online", Array.from(userSockets.keys()))
    
    registerChatSocketHandlers(socket, io)

    socket.on("disconnect", () => {
      log("info", `[SOCKET] User ${userId} disconnected. Socket ID: ${socket.id}`);
      if (userSockets.has(userId)) {
        const userSet = userSockets.get(userId)
        userSet.delete(socket.id)
        
        if (userSet.size === 0) {
          log("info", `[SOCKET] Broadcasting user:offline for user ${userId}`);
          userSockets.delete(userId)
          io.emit("user:offline", { userId })
        }
      }
    })
  })

  return io
}

module.exports = {
  createSocketManager,
}