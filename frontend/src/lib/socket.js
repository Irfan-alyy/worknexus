import { io } from "socket.io-client"
import { API_URL } from "@/config/env.config"

const resolveSocketUrl = () => {
	const apiUrl = API_URL || "http://localhost:3000/api/v1"

	if (apiUrl.startsWith("/")) {
		return typeof window !== "undefined" ? window.location.origin : ""
	}

	return apiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "")
}

const SOCKET_URL = resolveSocketUrl()
const SOCKET_PATH = "/api/socket.io"

let socket = null
let socketToken = null

/**
 * Initialize socket connection with authentication token
 * @param {string} token - JWT authentication token
 * @returns {import("socket.io-client").Socket | null}
 */
export const initiateSocket = (token) => {
	if (!token) {
		console.warn("[Socket] No token provided, skipping socket initialization")
		return null
	}

	if (socket) {
		if (socketToken !== token) {
			socket.disconnect()
			socket = null
		} else {
			if (socket.connected) {
				console.log("[Socket] Socket already connected, reusing instance")
			}
			return socket
		}
	}

	try {
		socketToken = token
		socket = io(SOCKET_URL, {
			path: SOCKET_PATH,
			auth: { token },
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			reconnectionAttempts: 5,
		})

		socket.on("connect", () => {
			console.log("[Socket] Successfully connected to socket server")
		})

		socket.on("connect_error", (error) => {
			console.error("[Socket] Connection error:", error)
		})

		socket.on("disconnect", (reason) => {
			console.log("[Socket] Disconnected:", reason)
		})

		return socket
	} catch (error) {
		console.error("[Socket] Failed to initialize socket:", error)
		return null
	}
}

/**
 * Get the current socket instance, initializing if needed
 * @param {string} token - JWT token for authentication if socket needs to be created
 * @returns {import("socket.io-client").Socket | null}
 */
export const getSocket = (token) => {
	if (socket?.connected) {
		if (token && socketToken !== token) {
			return initiateSocket(token)
		}

		return socket
	}

	if (token && (!socket || socketToken !== token)) {
		return initiateSocket(token)
	}

	return socket
}

/**
 * Disconnect the socket
 */
export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect()
		socket = null
		socketToken = null
		console.log("[Socket] Socket disconnected and cleared")
	}
}

// ============================================================================
// CHAT ROOM MANAGEMENT
// ============================================================================

/**
 * Join a chat room (channel or DM)
 * @param {string} channelId - The channel ID to join
 */
export const joinChatRoom = (channelId) => {
	if (!socket?.connected) {
		console.warn("[Socket] Socket not connected, cannot join room")
		return
	}

socket.emit("chat:join", { channelId })
	console.log(`[Socket] Joining room: ${channelId}`)
}

/**
 * Leave a chat room
 * @param {string} channelId - The channel ID to leave
 */
export const leaveChatRoom = (channelId) => {
	if (!socket?.connected) {
		console.warn("[Socket] Socket not connected, cannot leave room")
		return
	}

	socket.emit("chat:leave", { channelId })
	console.log(`[Socket] Leaving room: ${channelId}`)
}

// ============================================================================
// MESSAGE EVENTS
// ============================================================================

/**
 * Listen for new messages in a room
 * @param {Function} callback - Called when a new message arrives
 * @returns {Function} Unsubscribe function
 */
export const onMessageReceived = (callback) => {
	if (!socket) {
		console.warn("[Socket] Socket not initialized")
		return () => {}
	}

	const handler = (message) => {
		console.log("[Socket] Message received:", message)
		callback(message)
	}

	socket.on("chat:message", handler)

	return () => {
		socket.off("chat:message", handler)
	}
}

/**
 * Listen for message deletions
 * @param {Function} callback - Called when a message is deleted
 * @returns {Function} Unsubscribe function
 */
export const onMessageDeleted = (callback) => {
	if (!socket) {
		console.warn("[Socket] Socket not initialized")
		return () => {}
	}

	const handler = (data) => {
		console.log("[Socket] Message deleted:", data)
		callback(data)
	}

	socket.on("chat:message:deleted", handler)

	return () => {
		socket.off("chat:message:deleted", handler)
	}

}

// Back-compat alias (some backends may emit the older event name)
export const onMessageDeletedLegacy = (callback) => {
	if (!socket) {
		console.warn("[Socket] Socket not initialized")
		return () => {}
	}

	const handler = (data) => {
		console.log("[Socket] Message deleted (legacy):", data)
		callback(data)
	}

	socket.on("chat:message:delete", handler)

	return () => {
		socket.off("chat:message:delete", handler)
	}
}


// ============================================================================
// TYPING INDICATORS
// ============================================================================

/**
 * Emit typing indicator for a channel
 * @param {string} channelId - Channel ID
 * @param {boolean} isTyping - Whether user is typing
 */
export const setTypingIndicator = (channelId, isTyping) => {
	if (!socket?.connected) {
		return
	}

	socket.emit("chat:typing", {
		channelId,
		isTyping,
	})
}

/**
 * Listen for typing indicators
 * @param {Function} callback - Called with {channelId, userId, isTyping}
 * @returns {Function} Unsubscribe function
 */
export const onTypingIndicator = (callback) => {
	if (!socket) {
		console.warn("[Socket] Socket not initialized")
		return () => {}
	}

	const handler = (data) => {
		callback(data)
	}

	socket.on("chat:typing", handler)

	return () => {
		socket.off("chat:typing", handler)
	}
}

// ============================================================================
// REACTIONS
// ============================================================================

/**
 * Listen for new reactions on messages
 * @param {Function} callback - Called with reaction data
 * @returns {Function} Unsubscribe function
 */
export const onReactionAdded = (callback) => {
	if (!socket) {
		console.warn("[Socket] Socket not initialized")
		return () => {}
	}

	const handler = (reaction) => {
		console.log("[Socket] Reaction added:", reaction)
		callback(reaction)
	}

	socket.on("chat:reaction:add", handler)

	return () => {
		socket.off("chat:reaction:add", handler)
	}
}

/**
 * Listen for reaction removals
 * @param {Function} callback - Called with {messageId, userId, emoji}
 * @returns {Function} Unsubscribe function
 */
export const onReactionRemoved = (callback) => {
	if (!socket) {
		console.warn("[Socket] Socket not initialized")
		return () => {}
	}

	const handler = (data) => {
		console.log("[Socket] Reaction removed:", data)
		callback(data)
	}

	socket.on("chat:reaction:remove", handler)

	return () => {
		socket.off("chat:reaction:remove", handler)
	}
}

// ============================================================================
// USER PRESENCE
// ============================================================================

/**
 * Listen for user online events
 * @param {Function} callback - Called with {userId}
 * @returns {Function} Unsubscribe function
 */
export const onUserOnline = (callback) => {
	if (!socket) {
		console.warn("[Socket] Socket not initialized")
		return () => {}
	}

	const handler = (data) => {
		callback(data)
	}

	socket.on("user:online", handler)

	return () => {
		socket.off("user:online", handler)
	}
}

/**
 * Listen for user offline events
 * @param {Function} callback - Called with {userId}
 * @returns {Function} Unsubscribe function
 */
export const onUserOffline = (callback) => {
	if (!socket) {
		console.warn("[Socket] Socket not initialized")
		return () => {}
	}

	const handler = (data) => {
		callback(data)
	}

	socket.on("user:offline", handler)

	return () => {
		socket.off("user:offline", handler)
	}
}

export default {
	initiateSocket,
	getSocket,
	disconnectSocket,
	joinChatRoom,
	leaveChatRoom,
	onMessageReceived,
	onMessageDeleted,
	setTypingIndicator,
	onTypingIndicator,
	onReactionAdded,
	onReactionRemoved,
	onUserOnline,
	onUserOffline,
}
