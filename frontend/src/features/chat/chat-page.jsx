import { Search } from "lucide-react"
import { Navigate, useParams } from "react-router-dom"

import { ChatInput } from "@/features/chat/components/chat-input"
import { MessageBubble } from "@/features/chat/components/message-bubble"
import { findChannelById, findDirectMessageById } from "@/features/chat/chat-data"
import { useGlobalStore } from "@/stores/use-global-store"

const messages = [
  {
    author: "Aisha Khan",
    time: "10:42 AM",
    tone: "neutral",
    text: "The workspace shell now keeps routing, layout, and context separated, which makes it much easier to maintain.",
  },
  {
    author: "Muhammad Waqar",
    time: "10:45 AM",
    tone: "highlight",
    text: "Routes are isolated, the shell is reusable, and each feature page can now own its own layout without extra folders.",
  },
  {
    author: "Slackbot",
    time: "10:48 AM",
    tone: "muted",
    text: "Reminder: keep the route table clean and only add components in the existing structure.",
  },
]

export function ChatPage() {
  const { scope, chatId } = useParams()

  const { user } = useGlobalStore()
  const currentUser = user?.name || ""

  if (!scope || !chatId) {
    return <Navigate to="/chat/channels/general" replace />
  }

  const isChannel = scope === "channels"
  const isDm = scope === "dms"

  if (!isChannel && !isDm) {
    return <Navigate to="/chat/channels/general" replace />
  }

  const selectedChat = isChannel ? findChannelById(chatId) : findDirectMessageById(chatId)
  const conversationLabel = isChannel ? `#${selectedChat.name}` : selectedChat.name
  const conversationHint = isChannel
    ? selectedChat.topic
    : `Direct message with ${selectedChat.name}`

  return (
    <div className="h-full min-h-0 overflow-hidden pt-0">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div>
            <h3 className="mt-1 text-lg font-semibold">{conversationLabel}</h3>
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
                key={`${message.author}-${message.time}`}
                {...message}
                isMine={message.author === currentUser}
              />
            ))}
            {currentUser ? (
              <MessageBubble
                key={`me-now`}
                author={currentUser}
                time="Now"
                tone="neutral"
                text="This is a message from me."
                isMine={true}
              />
            ) : null}
          </div>
        </div>

        <div className="border-t border-border/60 p-5">
          <ChatInput />
        </div>
      </div>
    </div>
  )
}