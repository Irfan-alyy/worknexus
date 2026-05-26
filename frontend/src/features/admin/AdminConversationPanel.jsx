import { Search, Users } from "lucide-react"

import { ChatInput } from "@/features/chat/components/chat-input"
import { MessageBubble } from "@/features/chat/components/message-bubble"
import { useGlobalStore } from "@/stores/use-global-store"

export function AdminConversationPanel({ title, subtitle, membersLabel, messages, emptyLabel = "Select a conversation from the sidebar." }) {
  const { user } = useGlobalStore()
  if (!messages) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center rounded-3xl border border-border bg-background p-8 text-center shadow-sm">
        <div className="max-w-md space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Admin communication</p>
          <h3 className="text-xl font-semibold">No conversation selected</h3>
          <p className="text-sm leading-6 text-muted-foreground">{emptyLabel}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div>
          <h3 className="mt-1 text-lg font-semibold">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {membersLabel ? (
            <div className="hidden items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground sm:flex">
              <Users className="h-4 w-4" />
              {membersLabel}
            </div>
          ) : null}
          <button type="button" className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground">
            <Search className="h-4 w-4" />
            Search thread
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={`${message.author}-${message.time}`} {...message} isMine={message.author === user.name} />
          ))}
        </div>
      </div>

      <div className="border-t border-border/60 p-5">
        <ChatInput />
      </div>
    </div>
  )
}
