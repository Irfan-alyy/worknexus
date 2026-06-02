import { useEffect, useRef, useState } from "react"

import {
	getSocket,
	initiateSocket,
	joinChatRoom,
	leaveChatRoom,
	onMessageReceived,
	onMessageDeleted,
	onReactionAdded,
	onReactionRemoved,
	onTypingIndicator,
	setTypingIndicator,
	onUserOnline,
	onUserOffline,
} from "@/lib/socket"
import { useGlobalStore } from "@/stores/use-global-store"

const useAuthToken = () => {
	const { session } = useGlobalStore()
	return session?.token
}

/**
 * Hook to manage socket connection for the entire chat feature.
 */
export const useChatSocket = () => {
	const token = useAuthToken()
	const [isConnected, setIsConnected] = useState(false)

	useEffect(() => {
		if (!token) {
			console.warn("[useChatSocket] No token available, skipping socket initialization")
			const timer = window.setTimeout(() => setIsConnected(false), 0)
			return () => window.clearTimeout(timer)
		}

		const socket = initiateSocket(token)

		if (!socket) {
			return
		}

		const handleConnect = () => {
			console.log("[useChatSocket] Socket connected")
			setIsConnected(true)
		}

		const handleDisconnect = () => {
			console.log("[useChatSocket] Socket disconnected")
			setIsConnected(false)
		}

		const handleConnectError = (error) => {
			console.error("[useChatSocket] Socket connection error:", error)
			setIsConnected(false)
		}

		const syncTimer = window.setTimeout(() => setIsConnected(socket.connected), 0)
		socket.on("connect", handleConnect)
		socket.on("disconnect", handleDisconnect)
		socket.on("connect_error", handleConnectError)

		return () => {
			window.clearTimeout(syncTimer)
			socket.off("connect", handleConnect)
			socket.off("disconnect", handleDisconnect)
			socket.off("connect_error", handleConnectError)
		}
	}, [token])

	return {
		isConnected,
	}
}

/**
 * Hook to listen for new messages in a channel.
 */
export const useMessageListener = (channelId, onNewMessage) => {
	const token = useAuthToken()
	const onNewMessageRef = useRef(onNewMessage)

	useEffect(() => {
		onNewMessageRef.current = onNewMessage
	}, [onNewMessage])

	useEffect(() => {
		if (!channelId || !token) return

		getSocket(token)

		const unsubscribe = onMessageReceived((message) => {
			if (message.channelId === channelId) {
				onNewMessageRef.current?.(message)
			}
		})

		return () => {
			unsubscribe?.()
		}
	}, [channelId, token])
}

/**
 * Hook to manage typing indicators in a channel.
 */
export const useTypingIndicator = (channelId) => {
	const typingTimeoutRef = useRef(null)

	const setTyping = (isTyping) => {
		if (!channelId) return

		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current)
		}

		setTypingIndicator(channelId, isTyping)

		if (isTyping) {
			typingTimeoutRef.current = setTimeout(() => {
				setTypingIndicator(channelId, false)
			}, 3000)
		}
	}

	useEffect(() => {
		return () => {
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current)
			}
		}
	}, [])

	return setTyping
}

/**
 * Hook to listen for typing indicators.
 */
export const useTypingListener = (onTyping) => {
	const token = useAuthToken()
	const onTypingRef = useRef(onTyping)

	useEffect(() => {
		onTypingRef.current = onTyping
	}, [onTyping])

	useEffect(() => {
		if (!token) return

		getSocket(token)

		const unsubscribe = onTypingIndicator((data) => {
			onTypingRef.current?.(data)
		})

		return () => {
			unsubscribe?.()
		}
	}, [token])
}

/**
 * Hook to manage channel room subscriptions.
 */
export const useChatRoomSubscription = (channelId) => {
	const token = useAuthToken()

	useEffect(() => {
		if (!channelId || !token) return

		const socket = getSocket(token)
		if (!socket) {
			console.warn("[useChatRoomSubscription] Socket not initialized")
			return
		}

		const join = () => joinChatRoom(channelId)

		if (socket.connected) {
			join()
		}

		socket.on("connect", join)

		return () => {
			socket.off("connect", join)
			leaveChatRoom(channelId)
		}
	}, [channelId, token])
}

/**
 * Hook to listen for reactions on messages.
 */
export const useReactionListener = (onReaction) => {
	const token = useAuthToken()
	const onReactionRef = useRef(onReaction)

	useEffect(() => {
		onReactionRef.current = onReaction
	}, [onReaction])

	useEffect(() => {
		if (!token) return

		getSocket(token)

		const unsubscribeAdd = onReactionAdded((reaction) => {
			onReactionRef.current?.({ type: "add", data: reaction })
		})

		const unsubscribeRemove = onReactionRemoved((data) => {
			onReactionRef.current?.({ type: "remove", data })
		})

		return () => {
			unsubscribeAdd?.()
			unsubscribeRemove?.()
		}
	}, [token])
}

/**
 * Hook to listen for user presence changes.
 */
export const usePresenceListener = (onPresence) => {
	const token = useAuthToken()
	const onPresenceRef = useRef(onPresence)

	useEffect(() => {
		onPresenceRef.current = onPresence
	}, [onPresence])

	useEffect(() => {
		if (!token) return

		getSocket(token)

		const unsubscribeOnline = onUserOnline(({ userId }) => {
			onPresenceRef.current?.({ type: "online", userId })
		})

		const unsubscribeOffline = onUserOffline(({ userId }) => {
			onPresenceRef.current?.({ type: "offline", userId })
		})

		return () => {
			unsubscribeOnline?.()
			unsubscribeOffline?.()
		}
	}, [token])
}

/**
 * Hook to listen for message deletions.
 */
export const useMessageDeletedListener = (onDelete) => {
	const token = useAuthToken()
	const onDeleteRef = useRef(onDelete)

	useEffect(() => {
		onDeleteRef.current = onDelete
	}, [onDelete])

	useEffect(() => {
		if (!token) return

		getSocket(token)

		const unsubscribe = onMessageDeleted((data) => {
			onDeleteRef.current?.(data)
		})

		return () => {
			unsubscribe?.()
		}
	}, [token])
}

export default {
	useChatSocket,
	useMessageListener,
	useTypingIndicator,
	useTypingListener,
	useChatRoomSubscription,
	useReactionListener,
	usePresenceListener,
	useMessageDeletedListener,
}
