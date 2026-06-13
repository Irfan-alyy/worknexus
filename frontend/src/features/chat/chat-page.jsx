import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import { Search } from "lucide-react"
import { Navigate, useParams } from "react-router-dom"

import { ChatInput } from "@/features/chat/components/chat-input"
import { MessageBubble } from "@/features/chat/components/message-bubble"
import { useQuery } from "@tanstack/react-query"
import { chatApi } from "@/features/chat/services/chat-api"
import { useGlobalStore } from "@/stores/use-global-store"
import {
	useChatSocket,
	useMessageListener,
	useChatRoomSubscription,
	useTypingIndicator,
	useTypingListener,
	useReactionListener,
	useMessageDeletedListener,
} from "@/features/chat/hooks/use-socket"
import {
	useCreateMessageMutation,
	useDeleteMessageMutation,
	useAddReactionMutation,
	useRemoveReactionMutation,
} from "@/features/chat/hooks/use-chat-mutation"
import { useMessagesQuery } from "@/features/chat/hooks/use-chat-query"

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Format date to readable time
 */
function formatTime(date) {
	if (!date) return "now"
	const d = new Date(date)
	const now = new Date()
	const diff = now - d

	// Less than a minute
	if (diff < 60000) return "now"

	// Less than an hour
	if (diff < 3600000) {
		const mins = Math.floor(diff / 60000)
		return `${mins}m ago`
	}

	// Same day
	if (d.toDateString() === now.toDateString()) {
		return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
	}

	// Yesterday
	const yesterday = new Date(now)
	yesterday.setDate(yesterday.getDate() - 1)
	if (d.toDateString() === yesterday.toDateString()) {
		return "Yesterday"
	}

	// This year
	if (d.getFullYear() === now.getFullYear()) {
		return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
	}

	// Other
	return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })
}

const EMPTY_ARRAY = []

/**
 * Transform API message to component format
 */
function transformMessage(apiMessage, currentUserId) {
	return {
		id: apiMessage.id,
		channelId: apiMessage.channelId,
		parentId: apiMessage.parentId ?? apiMessage.parent_id ?? null,
		author: (apiMessage.user?.employee?.firstName && apiMessage.user?.employee?.lastName) ? `${apiMessage.user.employee.firstName} ${apiMessage.user.employee.lastName}` : apiMessage.user.email || "Unknown",
		authorId: apiMessage.userId,
		time: formatTime(apiMessage.createdAt),
		createdAt: apiMessage.createdAt,
		tone: apiMessage.userId === currentUserId ? "neutral" : "neutral",
		text: apiMessage.content,
		reactions: (apiMessage.reactions || []).map((r) => ({
			emoji: r.emoji,
			count: 1,
			userId: r.userId,
		})),
		replies: [],
	}
}

function appendUniqueMessage(messages, message) {
	const exists = messages.some((item) => item.id === message.id)
	return exists ? messages : [...messages, message]
}

function ThreadPanel({
  message,
  replies,
  currentUserId,
  onOpenThread,
  onCloseThread,
  onReplySubmit,
  onReact,
  onEdit,
  onDelete,
  onForward,
  onAttach,
  editingMessageId,
  editingDraft,
  onEditChange,
  onEditSave,
  onEditCancel,
}) {
  const [draft, setDraft] = useState("")

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <section className="rounded-3xl border border-border bg-card p-3 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Thread</p>
            {/* <p className="mt-1 text-sm text-muted-foreground">Reply with the shared composer below.</p> */}
          </div>
          <button
            type="button"
            onClick={onCloseThread}
            className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Close
          </button>
        </div>
        <div className="mt-3 m-full">
          <MessageBubble
            author={message.author}
            time={message.time}
            tone={message.tone}
            text={message.text}
            isMine={message.authorId === currentUserId}
            reactions={message.reactions ?? []}
            replyCount={replies.length}
            isEditing={editingMessageId === message.id}
            editedText={editingDraft}
            onReply={() => onOpenThread(message.id)}
            onForward={() => onForward(message)}
            onEdit={() => onEdit(message.id)}
            onDelete={() => onDelete(message.id)}
            onReact={(emoji) => onReact(message.id, emoji)}
            onEditChange={onEditChange}
            onEditSave={onEditSave}
            onEditCancel={onEditCancel}
          />
        </div>
      </section>

      <section className="min-h-0 flex-1 space-y-3 overflow-y-auto">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Replies</p>
          <span className="text-xs text-muted-foreground">{replies.length} message{replies.length === 1 ? "" : "s"}</span>
        </div>
        {replies.length > 0 ? (
          replies.map((reply) => (
            <MessageBubble
              key={reply.id}
              author={reply.author}
            time={reply.time}
            tone={reply.tone}
            text={reply.text}
              isMine={reply.authorId === currentUserId}
              reactions={reply.reactions ?? []}
              replyCount={0}
              isEditing={editingMessageId === reply.id}
              editedText={editingDraft}
              onReply={() => onOpenThread(message.id)}
              onForward={() => onForward(reply)}
              onEdit={() => onEdit(reply.id)}
              onDelete={() => onDelete(reply.id)}
              onReact={(emoji) => onReact(reply.id, emoji)}
              onEditChange={onEditChange}
              onEditSave={onEditSave}
              onEditCancel={onEditCancel}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/30 px-4 py-6 text-sm text-muted-foreground">
            No thread replies yet. Start the conversation below.
          </div>
        )}
      </section>

      <section className="border-t border-border pt-4">
        <div className="rounded-3xl border border-border bg-background p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Reply in thread</p>
              {/* <p className="mt-1 text-sm text-muted-foreground">Uses the same composer pattern, just scoped to this thread.</p> */}
            </div>
          </div>
          <ChatInput
            value={draft}
            onChange={setDraft}
            onSend={async (text) => {
              const sent = await onReplySubmit(text)
              if (sent !== false) setDraft("")
            }}
            onAttach={onAttach}
            placeholder="Reply in thread"
            helperText="Enter sends, Shift+Enter adds a new line"
            attachLabel="Upload file"
            sendLabel="Reply"
          />
        </div>
      </section>
    </div>
  )
}

function ForwardPanel({ message }) {
  const [selectedDestination, setSelectedDestination] = useState("")

  const destinations = [
    { label: "#general", description: "Workspace-wide channel" },
    { label: "#product-dev", description: "Engineering coordination" },
    { label: "Aisha Khan", description: "Direct message" },
  ]

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Forward preview</p>
        <p className="mt-3 text-sm font-semibold text-foreground">{message.author}</p>
        <p className="mt-1 text-xs text-muted-foreground">{message.time}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{message.text}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Choose a destination</p>
        {destinations.map((destination) => (
          <button
            key={destination.label}
            type="button"
            onClick={() => setSelectedDestination(destination.label)}
            className="flex w-full items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-secondary"
          >
            <div>
              <p className="text-sm font-medium">{destination.label}</p>
              <p className="text-xs text-muted-foreground">{destination.description}</p>
            </div>
            <span className="text-xs font-semibold text-primary">Forward</span>
          </button>
        ))}
      </div>

      {selectedDestination ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground">
          Forwarded to {selectedDestination}
        </div>
      ) : null}
    </div>
  )
}

function ForwardModal({ message, onClose, onForward }) {
  if (!message) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-[2rem] border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Forward message</p>
            <h3 className="mt-1 text-lg font-semibold">Send this elsewhere</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Close forward popup"
          >
            ×
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-5">
          <ForwardPanel message={message} />
          <div className="mt-5 flex items-center justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border bg-secondary px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onForward?.()}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Forward message
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChatPage() {
  const { scope, chatId } = useParams()

  // ========================================================================
  // GLOBAL STATE
  // ========================================================================
  const { user, asideOpen, openAside, closeAside } = useGlobalStore()
  const currentUserId = user?.id
  const currentUser = user?.name || ""

  // ========================================================================
  // LOCAL STATE
  // ========================================================================
  const [messages, setMessages] = useState([])
  const [composerText, setComposerText] = useState("")
  const [activeThreadMessageId, setActiveThreadMessageId] = useState(null)
  const [editingMessageId, setEditingMessageId] = useState(null)
  const [editingDraft, setEditingDraft] = useState("")
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [forwardMessage, setForwardMessage] = useState(null)
  const [typingUsers, setTypingUsers] = useState({})
  const messagesEndRef = useRef(null)
  const lastMessageIdRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const closeAsideRef = useRef(closeAside)
  const wasThreadAsideOpenRef = useRef(false)

  // ========================================================================
  // HELPERS
  // ========================================================================
  const getMemberDisplayName = useCallback((member) => {
    const employee = member?.user?.employee
    const firstName = employee?.firstName
    const lastName = employee?.lastName

    if (firstName && lastName) return `${firstName} ${lastName}`
    if (firstName) return firstName
    if (lastName) return lastName

    const email = member?.user?.email
    if (email) return email

    const nameFallback = member?.user?.name
    return nameFallback || "Unknown"
  }, [])

  // ========================================================================
  // SOCKET MANAGEMENT
  // ========================================================================
  const { isConnected } = useChatSocket()

  // Subscribe to chat room
  useChatRoomSubscription(chatId)

  // Setup typing indicator hook
  const setTyping = useTypingIndicator(chatId)

  // ========================================================================
  // QUERIES & MUTATIONS
  // ========================================================================

  // Fetch available channels to redirect to first one if needed
  const { data: channelsResp } = useQuery({
    queryKey: ["chat", "channels", "list"],
    queryFn: () => chatApi.listChannels(),
  })

  const channels = channelsResp?.data || []
  const firstChannelId = channels.length > 0 ? channels[0].id : null

  // Load messages from API
  const messageQueryParams = useMemo(() => ({ limit: 10 }), [])
  const { data: messagesResp, isLoading: isMessagesLoading } = useMessagesQuery(chatId, messageQueryParams, { enabled: !!chatId })

  // Load channel/dm details from API
  const { data: channelResp, isLoading: isChannelLoading, isError: isChannelError } = useQuery({
    queryKey: chatId ? ["chat", "channel", chatId] : ["chat", "channel"],
    queryFn: () => chatApi.getChannel(chatId),
    enabled: !!chatId,
  })

  // Message mutations
  const createMessageMutation = useCreateMessageMutation(chatId)
  const deleteMessageMutation = useDeleteMessageMutation(chatId)
  const addReactionMutation = useAddReactionMutation(chatId)
  const removeReactionMutation = useRemoveReactionMutation(chatId)

  const selectedChat = useMemo(() => {
    if (!scope || !chatId) return null
    return channelResp?.data || channelResp || null
  }, [scope, chatId, channelResp])

  // ========================================================================
  // COMPUTED VALUES & MEMOS (typing display must be unconditional)
  // ========================================================================

  const memberLookup = useMemo(() => {
    const members = selectedChat?.members ?? []
    return new Map(members.map((m) => [String(m.userId), m]))
  }, [selectedChat])

  const typingUsersList = Object.keys(typingUsers)
    .filter((uid) => uid !== String(currentUserId))
    .slice(0, 2)
    .map((uid) => {
      const member = memberLookup.get(uid)
      return member ? getMemberDisplayName(member) : uid
    })

  // ========================================================================
  // EFFECTS
  // ========================================================================

  // Load initial messages from API
  useEffect(() => {
    if (messagesResp?.data?.messages) {
      const timer = window.setTimeout(() => {
        const msgs = messagesResp.data.messages.map((msg) => transformMessage(msg, currentUserId))
        setMessages(msgs)
        setHasMore(msgs.length >= 10)
      }, 0)
      return () => window.clearTimeout(timer)
    }
  }, [messagesResp, currentUserId])
  // console.log("Loaded messages:", messagesResp)
  // Setup message listener for real-time updates (create)
  useMessageListener(chatId, (newMessage) => {
    const transformed = transformMessage(newMessage, currentUserId)
    setMessages((prev) => appendUniqueMessage(prev, transformed))
  })

  // Setup updated-message listener (realtime update)
  useMessageDeletedListener((data) => {
    // Backward/forward compatible parsing:
    // - delete event payload: { messageId, channelId, ... }
    // - update event payload may also contain { type, updatedMessage, ... }
    // We only mutate when we can confidently detect an update.
    const type = data?.type ?? data?.eventType

    // If your backend emits a dedicated update event, prefer implementing a dedicated hook.
    // Here we handle only delete events; updates are handled via createMessage listener unless backend sends updates as full message objects.
    // console.log("[Socket] Message event received:", data) 
    const deletedMessageId = data?.messageId ?? data?.id ?? data?.message_id
    const deletedChannelId = data?.channelId ?? data?.channel_id

    if (type && String(type).toLowerCase() !== "delete") {
      // Ignore non-delete events for this listener.
      return
    }

    // Only apply if the deletion belongs to this chat
    if (deletedChannelId && String(deletedChannelId) !== String(chatId)) return
    if (!deletedMessageId) return

    setMessages((prev) => prev.filter((m) => m.id !== deletedMessageId))

    // If thread is open for the deleted message, close it
    if (activeThreadMessageId === deletedMessageId) {
      wasThreadAsideOpenRef.current = false
      setActiveThreadMessageId(null)
      closeAside()
    }
  })



  // Setup typing indicator listener
  useTypingListener(({ userId, isTyping }) => {
    setTypingUsers((prev) => {
      const next = { ...prev }
      if (isTyping) {
        next[userId] = true
        // Auto-clear after 3 seconds
        setTimeout(() => {
          setTypingUsers((p) => {
            const updated = { ...p }
            delete updated[userId]
            return updated
          })
        }, 3000)
      } else {
        delete next[userId]
      }
      return next
    })
  })

  // Setup reaction listener
  useReactionListener(({ type, data }) => {
    if (type === "add") {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            const reactions = msg.reactions || []
            const existingReaction = reactions.find((r) => r.emoji === data.emoji && r.userId === data.userId)

            // Backend enforces one reaction per (messageId, userId, emoji).
            // If we get the same socket event twice, don't duplicate UI entries.
            if (existingReaction) {
              return {
                ...msg,
                reactions: reactions.map((r) =>
                  r.emoji === data.emoji && r.userId === data.userId
                    ? { ...r, count: (r.count ?? 1) }
                    : r,
                ),
              }
            }

            // Add a brand new (emoji,user) reaction entry
            return {
              ...msg,
              reactions: [...reactions, { emoji: data.emoji, userId: data.userId, count: 1 }],
            }
          }
          return msg
        }),
      )
    } else if (type === "remove") {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === data.messageId) {
            return {
              ...msg,
              reactions: (msg.reactions || []).filter((r) => !(r.emoji === data.emoji && r.userId === data.userId)),
            }
          }
          return msg
        }),
      )
    }
  })

  // Auto-scroll to bottom when messages update
  // Only scroll if the last message in the array is new (not prepending old history)
  useEffect(() => {
    if (messages.length === 0) {
      lastMessageIdRef.current = null
      return
    }

    const lastMsg = messages[messages.length - 1]

    // If the last message is different from what we saw last, it's a new message at the bottom
    if (lastMsg.id !== lastMessageIdRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      lastMessageIdRef.current = lastMsg.id
    }
  }, [messages])

  useEffect(() => {
    closeAsideRef.current = closeAside
  }, [closeAside])

  // Reset thread when navigating to different chat
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveThreadMessageId(null)
      setEditingMessageId(null)
      setComposerText("")
      setTypingUsers({})
      wasThreadAsideOpenRef.current = false
      setHasMore(true)
      setIsLoadingMore(false)
      closeAsideRef.current()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [scope, chatId])

  useEffect(() => {
    if (!activeThreadMessageId) {
      if (wasThreadAsideOpenRef.current && asideOpen) {
        closeAside()
      }
      wasThreadAsideOpenRef.current = false
      return
    }

    if (asideOpen) {
      wasThreadAsideOpenRef.current = true
      return
    }

    // If ID is set but aside is closed, it means it was closed globally (Global 'X').
    // Clear the state immediately to prevent the opener effect from re-triggering.
    if (!wasThreadAsideOpenRef.current) return

    wasThreadAsideOpenRef.current = false
    setActiveThreadMessageId(null)
  }, [activeThreadMessageId, asideOpen, closeAside])

  // ========================================================================
  // COMPUTED VALUES & MEMOS
  // ========================================================================

  const activeThreadMessage = useMemo(
    () => messages.find((message) => message.id === activeThreadMessageId) ?? null,
    [messages, activeThreadMessageId],
  )

  const rootMessages = useMemo(
    () => messages.filter((message) => !message.parentId),
    [messages],
  )

  const repliesByParentId = useMemo(() => {
    return messages.reduce((groups, message) => {
      if (!message.parentId) return groups

      const replies = groups.get(message.parentId) ?? []
      replies.push(message)
      groups.set(message.parentId, replies)
      return groups
    }, new Map())
  }, [messages])

  const activeThreadReplies = useMemo(
    () => repliesByParentId.get(activeThreadMessageId) ?? EMPTY_ARRAY,
    [activeThreadMessageId, repliesByParentId],
  )

  const editingMessage = useMemo(() => {
    if (!editingMessageId) return null
    return messages.find((message) => message.id === editingMessageId) ?? null
  }, [editingMessageId, messages])

  // ========================================================================
  // EVENT HANDLERS
  // ========================================================================

  const handleLoadOlder = useCallback(async () => {
    if (messages.length === 0 || isLoadingMore || !chatId) return
    setIsLoadingMore(true)
    try {
      const scrollElement = messagesContainerRef.current
      let prevScrollHeight = 0
      let prevScrollTop = 0
      if (scrollElement) {
        prevScrollHeight = scrollElement.scrollHeight
        prevScrollTop = scrollElement.scrollTop
      }

      const oldestMessage = messages[0]
      const response = await chatApi.listMessages(chatId, {
        before: oldestMessage.createdAt,
        limit: 10,
      })

      const olderMessages = (response.data?.messages || []).map((msg) =>
        transformMessage(msg, currentUserId)
      )

      if (olderMessages.length < 10) {
        setHasMore(false)
      }

      setMessages((prev) => [...olderMessages, ...prev])

      // Adjust scroll position to prevent jumping (must wait for DOM update)
      if (scrollElement) {
        setTimeout(() => {
          const newScrollHeight = scrollElement.scrollHeight
          scrollElement.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop
        }, 0)
      }
    } catch (error) {
      console.error("Failed to load older messages:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [messages, isLoadingMore, chatId, currentUserId])

  const handleSendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim()
      if (!trimmed || !chatId) return
      const optimisticId = `temp-${Date.now()}`

      try {
        // Create optimistic message
        const optimisticMessage = {
          id: optimisticId,
          channelId: chatId,
          parentId: null,
          author: currentUser,
          authorId: currentUserId,
          time: "now",
          createdAt: new Date().toISOString(),
          tone: "neutral",
          text: trimmed,
          reactions: [],
          replies: [],
          pending: true,
        }

        setMessages((prev) => [...prev, optimisticMessage])
        setComposerText("")

        // Send to API
        const response = await createMessageMutation.mutateAsync({
          channel_id: chatId,
          content: trimmed,
        })
        console.log("Message sent, API response:", response)

        // Replace optimistic message with real one
        const realMessage = transformMessage(response.data, currentUserId)
        setMessages((prev) =>
          appendUniqueMessage(prev.filter((m) => m.id !== optimisticId), realMessage),
        )
      } catch (error) {
        console.error("Failed to send message:", error)
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        setComposerText(trimmed)
      }
    },
    [chatId, currentUser, currentUserId, createMessageMutation],
  )

  const handleReplySubmit = useCallback(
    async (parentId, text) => {
      const trimmed = text.trim()
      if (!trimmed || !chatId || !parentId) return false

      const optimisticId = `temp-reply-${Date.now()}`

      try {
        const optimisticReply = {
          id: optimisticId,
          channelId: chatId,
          parentId,
          author: currentUser,
          authorId: currentUserId,
          time: "now",
          createdAt: new Date().toISOString(),
          tone: "neutral",
          text: trimmed,
          reactions: [],
          replies: [],
          pending: true,
        }

        setMessages((prev) => [...prev, optimisticReply])

        const response = await createMessageMutation.mutateAsync({
          channel_id: chatId,
          content: trimmed,
          parent_id: parentId,
        })

        const realReply = transformMessage(response.data, currentUserId)
        setMessages((prev) =>
          appendUniqueMessage(prev.filter((m) => m.id !== optimisticId), realReply),
        )
        return true
      } catch (error) {
        console.error("Failed to send reply:", error)
        setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
        return false
      }
    },
    [chatId, currentUser, currentUserId, createMessageMutation],
  )

  const handleDelete = useCallback(
    async (messageId) => {
      const shouldDelete = window.confirm("Delete this message?")
      if (!shouldDelete) return

      if (activeThreadMessageId === messageId) {
        wasThreadAsideOpenRef.current = false
        setActiveThreadMessageId(null)
        closeAside()
      }

      try {
        // Optimistic delete
        setMessages((prev) => prev.filter((m) => m.id !== messageId && m.parentId !== messageId))

        // Delete from API
        await deleteMessageMutation.mutateAsync(messageId)
      } catch (error) {
        console.error("Failed to delete message:", error)
        // Restore on error (would need to re-fetch)
      }
    },
    [activeThreadMessageId, closeAside, deleteMessageMutation],
  )

  const handleReact = useCallback(
    async (messageId, emoji) => {
      try {
        // Enforce: one employee can react with only one emoji per message.
        // If the same emoji is clicked again => remove.
        // If a different emoji is clicked => remove old and add new.

        const currentUserReactions = messages
          .find((m) => m.id === messageId)
          ?.reactions?.filter((r) => r.userId === currentUserId) ?? []

        const hasSameEmoji = currentUserReactions.some((r) => r.emoji === emoji)

        // Optimistic update
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id !== messageId) return msg

            // Remove any existing reaction by current user
            const cleared = (msg.reactions || []).filter((r) => r.userId !== currentUserId)

            if (hasSameEmoji) {
              // Clicking same emoji again removes it
              return {
                ...msg,
                reactions: cleared,
              }
            }

            // Add new emoji
            return {
              ...msg,
              reactions: [...cleared, { emoji, userId: currentUserId, count: 1 }],
            }
          }),
        )

        // Sync with API
        if (hasSameEmoji) {
          await removeReactionMutation.mutateAsync({ messageId, emoji })
          // If backend returns no socket remove payload for other emojis, local state already updated.
          return
        }

        // Remove old emoji reactions (if any), then add the new one.
        // We must remove the old emoji(s) first because backend only allows one reaction per (messageId,userId,emoji)
        // but requirement is one emoji per user per message.
        const oldEmojis = currentUserReactions.map((r) => r.emoji)
        await Promise.all(
          oldEmojis.map((oldEmoji) =>
            removeReactionMutation.mutateAsync({ messageId, emoji: oldEmoji }).catch(() => null),
          ),
        )

        await addReactionMutation.mutateAsync({ message_id: messageId, emoji })
      } catch (error) {
        console.error("Failed to update reaction:", error)
      }
    },
    [currentUserId, messages, addReactionMutation, removeReactionMutation],
  )

  const handleAttachFiles = useCallback(
    (files) => {
      wasThreadAsideOpenRef.current = false
      setActiveThreadMessageId(null)
      openAside(
        "Attachment preview",
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground">Files ready to upload</p>
            <p className="mt-1 text-sm text-muted-foreground">File attachments are queued for upload.</p>
          </div>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={`${file.name}-${file.size}`} className="rounded-2xl border border-border bg-card px-4 py-3 text-sm">
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{Math.max(1, Math.round(file.size / 1024))} KB</p>
              </div>
            ))}
          </div>
        </div>,
      )
    },
    [openAside],
  )

  const handleStartEdit = useCallback(
    (messageId) => {
      const target = messages.find((m) => m.id === messageId)
      if (!target) return

      setEditingMessageId(messageId)
      setEditingDraft(target.text)
    },
    [messages],
  )

  const handleSaveEdit = useCallback(async () => {
    const trimmed = editingDraft.trim()
    if (!editingMessage || !trimmed) return

    try {
      // Optimistic update
      setMessages((prev) =>
        prev.map((msg) => (msg.id === editingMessageId ? { ...msg, text: trimmed } : msg)),
      )

      // Update API
      // Note: API endpoint for updating messages - adjust if needed
      // await updateMessageMutation.mutateAsync({ messageId: editingMessageId, payload: { content: trimmed } })

      setEditingMessageId(null)
      setEditingDraft("")
    } catch (error) {
      console.error("Failed to update message:", error)
    }
  }, [editingDraft, editingMessage, editingMessageId])

  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null)
    setEditingDraft("")
  }, [])

  const handleForward = useCallback((message) => {
    setForwardMessage(message)
  }, [])

  const handleOpenThread = useCallback((messageId) => {
    setActiveThreadMessageId(messageId)
  }, [])

  const handleCloseThread = useCallback(() => {
    // Explicitly clear both states and reset the tracking ref to avoid ambiguity
    wasThreadAsideOpenRef.current = false
    setActiveThreadMessageId(null)
    closeAside()
  }, [closeAside])

  const handleComposerChange = useCallback(
    (text) => {
      setComposerText(text)
      // Send typing indicator when user is typing
      if (text.trim()) {
        setTyping(true)
      }
    },
    [setTyping],
  )

  useEffect(() => {
    if (!activeThreadMessage || !activeThreadMessageId) return

    // If the aside was closed globally, don't force it back open.
    // The synchronization effect above handles clearing the message ID.
    if (!asideOpen && wasThreadAsideOpenRef.current) return

    openAside(
      "Thread",
      <ThreadPanel
        message={activeThreadMessage}
        replies={activeThreadReplies}
        currentUserId={currentUserId}
        onOpenThread={handleOpenThread}
        onCloseThread={handleCloseThread}
        onReplySubmit={(text) => handleReplySubmit(activeThreadMessage.id, text)}
        onReact={handleReact}
        onEdit={handleStartEdit}
        onDelete={handleDelete}
        onForward={handleForward}
        onAttach={handleAttachFiles}
        editingMessageId={editingMessageId}
        editingDraft={editingDraft}
        onEditChange={setEditingDraft}
        onEditSave={handleSaveEdit}
        onEditCancel={handleCancelEdit}
      />,
    )
  }, [
    activeThreadMessage,
    activeThreadMessageId,
    asideOpen,
    activeThreadReplies,
    currentUserId,
    editingDraft,
    editingMessageId,
    handleAttachFiles,
    handleCancelEdit,
    handleCloseThread,
    handleDelete,
    handleForward,
    handleOpenThread,
    handleReact,
    handleReplySubmit,
    handleSaveEdit,
    handleStartEdit,
    openAside,
  ])

  // ========================================================================
  // NAVIGATION & GUARDS
  // ========================================================================

  if (!scope || !chatId) {
    if (firstChannelId) {
      return <Navigate to={`/chat/channels/${firstChannelId}`} replace />
    }
    return <div className="p-6">No channels available</div>
  }

  const isChannel = scope === "channels"
  const isDm = scope === "dms"

  if (!isChannel && !isDm) {
    if (firstChannelId) {
      return <Navigate to={`/chat/channels/${firstChannelId}`} replace />
    }
    return <div className="p-6">No channels available</div>
  }

  if (isChannelLoading) {
    return <div className="p-6">Loading chat...</div>
  }

  if (!selectedChat || isChannelError) {
    if (firstChannelId && chatId !== firstChannelId) {
      return <Navigate to={`/chat/channels/${firstChannelId}`} replace />
    }
    return <div className="p-6">Channel not found or you don't have access to it</div>
  }
  const receiverName = (isDm && selectedChat?.members?.find((m) => m.userId !== user?.id)?.user?.employee?.firstName) || null; ;
  const lastName = isDm && selectedChat?.members?.find((m) => m.userId !== user?.id)?.user?.employee?.lastName ;;

  const email=  isDm && selectedChat?.members?.find((m) => m.userId !== user?.id)?.user?.email || null  
  // console.log(email)
  const conversationLabel = isChannel ? `#${selectedChat.name}` : (receiverName && lastName )? receiverName + " " + lastName :email  || selectedChat.name
  const conversationHint = isChannel ? selectedChat.description || "Channel" : `Direct message with ${receiverName +" "+ lastName  || selectedChat.name}`

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="h-full min-h-0 overflow-hidden pt-0">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-5 sm:py-4">
          <div>
            <h3 className="mt-1 text-lg font-semibold">{conversationLabel}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {isConnected ? "Connected" : "Connecting..."} • {conversationHint}
            </p>
          </div>
          {/* <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground"
          >
            <Search className="h-4 w-4" />
            Search
          </button> */}
        </div>

        {/* Messages Container */}
        <div ref={messagesContainerRef} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {isMessagesLoading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : rootMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">No messages yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Start the conversation below</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {hasMore && (
                <div className="flex justify-center pb-2">
                  <button
                    type="button"
                    onClick={handleLoadOlder}
                    disabled={isLoadingMore}
                    className="rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                  >
                    {isLoadingMore ? "Loading older messages..." : "Load older messages"}
                  </button>
                </div>
              )}
              {rootMessages.map((message) => (
                <MessageBubble
                  key={message.id}
                  author={message.author}
                  time={message.time}
                  tone={message.tone}
                  text={message.text}
                  isMine={message.authorId === currentUserId}
                  reactions={message.reactions ?? []}
                  replyCount={repliesByParentId.get(message.id)?.length ?? 0}
                  isEditing={editingMessageId === message.id}
                  editedText={editingDraft}
                  onEdit={() => handleStartEdit(message.id)}
                  onEditChange={setEditingDraft}
                  onEditSave={handleSaveEdit}
                  onEditCancel={handleCancelEdit}
                  onReply={() => handleOpenThread(message.id)}
                  onForward={() => handleForward(message)}
                  onDelete={() => handleDelete(message.id)}
                  onReact={(emoji) => handleReact(message.id, emoji)}
                  isPending={message.pending}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Typing Indicator */}
          {typingUsersList.length > 0 && (
            <div className="mt-4 text-xs text-muted-foreground">
              {typingUsersList.join(", ")} {typingUsersList.length === 1 ? "is" : "are"} typing...
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border/60 p-4 sm:p-5">
          <ChatInput
            value={composerText}
            onChange={handleComposerChange}
            onSend={handleSendMessage}
            onAttach={handleAttachFiles}
            placeholder={`Write a message to ${conversationLabel}`}
            helperText="Enter sends, Shift+Enter adds a new line"
            attachLabel="Upload file"
            sendLabel="Send"
          />
        </div>
      </div>

      {/* Forward Modal */}
      {forwardMessage ? (
        <ForwardModal
          message={forwardMessage}
          onClose={() => setForwardMessage(null)}
          onForward={() => setForwardMessage(null)}
        />
      ) : null}
    </div>
  )
}
