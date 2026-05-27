import { useEffect, useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { Navigate, useParams } from "react-router-dom"

import { ChatInput } from "@/features/chat/components/chat-input"
import { MessageBubble } from "@/features/chat/components/message-bubble"
import { findChannelById, findDirectMessageById } from "@/features/chat/chat-data"
import { useGlobalStore } from "@/stores/use-global-store"

const initialMessages = [
  {
    id: "chat-msg-1",
    author: "Aisha Khan",
    time: "10:42 AM",
    tone: "neutral",
    text: "The workspace shell now keeps routing, layout, and context separated, which makes it much easier to maintain.",
    reactions: [{ emoji: "👍", count: 2 }],
    replies: [
      {
        id: "chat-msg-1-reply-1",
        author: "Muhammad Waqar",
        time: "10:43 AM",
        tone: "muted",
        text: "That keeps the shared shell simple and makes chat-specific state easier to isolate.",
        reactions: [],
      },
    ],
  },
  {
    id: "chat-msg-2",
    author: "Muhammad Waqar",
    time: "10:45 AM",
    tone: "highlight",
    text: "Routes are isolated, the shell is reusable, and each feature page can now own its own layout without extra folders.",
    reactions: [{ emoji: "🔥", count: 1 }, { emoji: "👏", count: 1 }],
    replies: [],
  },
  {
    id: "chat-msg-3",
    author: "Slackbot",
    time: "10:48 AM",
    tone: "muted",
    text: "Reminder: keep the route table clean and only add components in the existing structure.",
    reactions: [],
    replies: [],
  },
]

const currentTimeLabel = "Now"

function createInitialMessages(currentUser) {
  const author = currentUser || "You"

  return [
    ...initialMessages,
    {
      id: "chat-msg-self-test",
      author,
      time: currentTimeLabel,
      tone: "neutral",
      text: "This is my test message so I can verify chat actions in every chat.",
      reactions: [{ emoji: "👀", count: 1 }],
      replies: [],
    },
  ]
}

function ThreadPanel({
  message,
  replies,
  currentUser,
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
      <section className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Thread</p>
            <p className="mt-1 text-sm text-muted-foreground">Reply with the shared composer below.</p>
          </div>
        </div>
        <div className="mt-3">
          <MessageBubble
            author={message.author}
            time={message.time}
            tone={message.tone}
            text={message.text}
            isMine={message.author === currentUser}
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
              isMine={reply.author === currentUser}
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
              <p className="mt-1 text-sm text-muted-foreground">Uses the same composer pattern, just scoped to this thread.</p>
            </div>
          </div>
          <ChatInput
            value={draft}
            onChange={setDraft}
            onSend={(text) => {
              onReplySubmit(text)
              setDraft("")
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
        <div className="max-h-[70vh] overflow-y-auto p-5">
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

  const { user, openAside, closeAside, asideOpen } = useGlobalStore()
  const currentUser = user?.name || ""
  const [messages, setMessages] = useState(() => createInitialMessages(currentUser))
  const [composerText, setComposerText] = useState("")
  const [activeThreadMessageId, setActiveThreadMessageId] = useState(null)
  const [editingMessageId, setEditingMessageId] = useState(null)
  const [editingDraft, setEditingDraft] = useState("")
  const [forwardMessage, setForwardMessage] = useState(null)

  const activeThreadMessage = useMemo(
    () => messages.find((message) => message.id === activeThreadMessageId) ?? null,
    [messages, activeThreadMessageId],
  )

  const editingMessage = useMemo(() => {
    if (!editingMessageId) return null
    return (
      messages.find((message) => message.id === editingMessageId) ??
      messages.flatMap((message) => message.replies ?? []).find((reply) => reply.id === editingMessageId) ??
      null
    )
  }, [editingMessageId, messages])

  const selectedChat = useMemo(() => {
    if (!scope || !chatId) return null
    return scope === "channels" ? findChannelById(chatId) : findDirectMessageById(chatId)
  }, [scope, chatId])

  useEffect(() => {
    if (!activeThreadMessage) {
      closeAside()
      return
    }

    openAside(
      `Thread: ${activeThreadMessage.author}`,
      <ThreadPanel
        message={activeThreadMessage}
        replies={activeThreadMessage.replies ?? []}
        currentUser={currentUser}
        onOpenThread={(messageId) => setActiveThreadMessageId(messageId)}
        onCloseThread={() => {
			setActiveThreadMessageId(null)
		}}
        onReplySubmit={(text) => handleReply(activeThreadMessage.id, text)}
        onReact={handleReact}
        onEdit={handleStartEdit}
        onDelete={handleDelete}
        onForward={() => handleForward(activeThreadMessage)}
        onAttach={handleAttachFiles}
        editingMessageId={editingMessageId}
        editingDraft={editingDraft}
        onEditChange={setEditingDraft}
        onEditSave={handleSaveEdit}
        onEditCancel={handleCancelEdit}
      />,
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThreadMessage, currentUser])

  useEffect(() => {
    if (!editingMessage) return
    setEditingDraft(editingMessage.text)
  }, [editingMessage])

  // Reset thread when navigating to different chat
  useEffect(() => {
    setActiveThreadMessageId(null)
  }, [scope, chatId])

  if (!scope || !chatId) {
    return <Navigate to="/chat/channels/general" replace />
  }

  const isChannel = scope === "channels"
  const isDm = scope === "dms"

  if (!isChannel && !isDm) {
    return <Navigate to="/chat/channels/general" replace />
  }

  const conversationLabel = isChannel ? `#${selectedChat.name}` : selectedChat.name
  const conversationHint = isChannel ? selectedChat.topic : `Direct message with ${selectedChat.name}`
  function handleAttachFiles(files) {
    openAside(
      "Attachment preview",
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">Files ready to upload</p>
          <p className="mt-1 text-sm text-muted-foreground">Slack-style file attach is wired into the composer.</p>
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
  }

  function handleSendMessage(text) {
    const nextMessage = {
      id: `chat-msg-${Date.now()}`,
      author: currentUser || "You",
      time: currentTimeLabel,
      tone: "neutral",
      text,
      reactions: [],
      replies: [],
    }

    setMessages((existingMessages) => [...existingMessages, nextMessage])
    setComposerText("")
  }

  function handleReply(messageId, text) {
    setMessages((existingMessages) =>
      existingMessages.map((message) => {
        if (message.id !== messageId) return message

        const reply = {
          id: `reply-${messageId}-${Date.now()}`,
          author: currentUser || "You",
          time: currentTimeLabel,
          tone: "neutral",
          text,
          reactions: [],
        }

        return {
          ...message,
          replies: [...(message.replies ?? []), reply],
        }
      }),
    )
  }

  function openReplyThread(messageId) {
    // Toggle: if clicking the same thread, close it; otherwise open the new one
    setActiveThreadMessageId((currentId) => (currentId === messageId ? null : messageId))
  }

  function handleStartEdit(messageId) {
    const targetMessage = messages.find((message) => message.id === messageId)
    const targetReply = messages.flatMap((message) => message.replies ?? []).find((reply) => reply.id === messageId)
    const target = targetMessage ?? targetReply
    if (!target) return

    setEditingMessageId(messageId)
    setEditingDraft(target.text)
  }

  function handleSaveEdit() {
    const trimmed = editingDraft.trim()
    if (!editingMessage || !trimmed) return

    setMessages((existingMessages) =>
      existingMessages.map((message) => {
        if (message.id === editingMessageId) {
          return { ...message, text: trimmed }
        }

        return {
          ...message,
          replies: (message.replies ?? []).map((reply) =>
            reply.id === editingMessageId ? { ...reply, text: trimmed } : reply,
          ),
        }
      }),
    )

    setEditingMessageId(null)
    setEditingDraft("")
  }

  function handleCancelEdit() {
    setEditingMessageId(null)
    setEditingDraft("")
  }

  function handleReact(messageId, emoji) {
    setMessages((existingMessages) =>
      existingMessages.map((message) => {
        if (message.id === messageId) {
          const reactions = [...(message.reactions ?? [])]
          const reactionIndex = reactions.findIndex((reaction) => reaction.emoji === emoji)

          if (reactionIndex >= 0) {
            const nextCount = (reactions[reactionIndex].count ?? 1) - 1
            if (nextCount <= 0) {
              reactions.splice(reactionIndex, 1)
            } else {
              reactions[reactionIndex] = { ...reactions[reactionIndex], count: nextCount }
            }
          } else {
            reactions.push({ emoji, count: 1 })
          }

          return { ...message, reactions }
        }

        const replies = (message.replies ?? []).map((reply) => {
          if (reply.id !== messageId) return reply

          const reactionList = [...(reply.reactions ?? [])]
          const reactionIndex = reactionList.findIndex((reaction) => reaction.emoji === emoji)

          if (reactionIndex >= 0) {
            const nextCount = (reactionList[reactionIndex].count ?? 1) - 1
            if (nextCount <= 0) {
              reactionList.splice(reactionIndex, 1)
            } else {
              reactionList[reactionIndex] = { ...reactionList[reactionIndex], count: nextCount }
            }
          } else {
            reactionList.push({ emoji, count: 1 })
          }

          return { ...reply, reactions: reactionList }
        })

        return { ...message, replies }
      }),
    )
  }

  function handleDelete(messageId) {
    const shouldDelete = window.confirm("Delete this message?")
    if (!shouldDelete) return

    // If deleting the currently open thread, close it first
    if (activeThreadMessageId === messageId) {
      setActiveThreadMessageId(null)
    }

    setMessages((existingMessages) =>
      existingMessages.filter((message) => message.id !== messageId).map((message) => ({
        ...message,
        replies: (message.replies ?? []).filter((reply) => reply.id !== messageId),
      })),
    )
  }

  function handleForward(message) {
    setForwardMessage(message)
  }

  return (
    <div className="h-full min-h-0 overflow-hidden pt-0">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div>
            <h3 className="mt-1 text-lg font-semibold">{conversationLabel}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{conversationHint}</p>
          </div>
          <button type="button" className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground">
            <Search className="h-4 w-4" />
            Search thread
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                author={message.author}
                time={message.time}
                tone={message.tone}
                text={message.text}
                isMine={message.author === currentUser}
                reactions={message.reactions ?? []}
                replyCount={message.replies?.length ?? 0}
                isEditing={editingMessageId === message.id}
                editedText={editingDraft}
                onEdit={() => handleStartEdit(message.id)}
                onEditChange={setEditingDraft}
                onEditSave={handleSaveEdit}
                onEditCancel={handleCancelEdit}
                onReply={() => openReplyThread(message.id)}
                onForward={() => handleForward(message)}
                onDelete={() => handleDelete(message.id)}
                onReact={(emoji) => handleReact(message.id, emoji)}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-border/60 p-5">
          <ChatInput
            value={composerText}
            onChange={setComposerText}
            onSend={handleSendMessage}
            onAttach={handleAttachFiles}
            placeholder={`Write a message to ${conversationLabel}`}
            helperText="Enter sends, Shift+Enter adds a new line"
            attachLabel="Upload file"
            sendLabel="Send"
          />
        </div>
      </div>

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