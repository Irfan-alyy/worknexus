import { useEffect, useState } from "react"

import { Menu, Search, Users, X } from "lucide-react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ChannelSidebar } from "@/features/chat/components/channel-sidebar"
import { ChatInput } from "@/features/chat/components/chat-input"
import { MessageBubble } from "@/features/chat/components/message-bubble"
import { useMediaQuery } from "@/hooks/use-media-query"

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
  const [isMobileChannelSidebarOpen, setIsMobileChannelSidebarOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 767px)")

  useEffect(() => {
    if (!isMobile) {
      setIsMobileChannelSidebarOpen(false)
    }
  }, [isMobile])

  const toggleMobileSidebar = () => {
    setIsMobileChannelSidebarOpen((value) => !value)
  }

  const closeMobileSidebar = () => {
    setIsMobileChannelSidebarOpen(false)
  }

  const ConversationPanel = () => (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Current room</p>
          <h3 className="mt-1 text-lg font-semibold">#general</h3>
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2 text-xs font-medium text-foreground">
          <Search className="h-4 w-4" />
          Search thread
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={`${message.author}-${message.time}`} {...message} />
          ))}
        </div>
      </div>

      <div className="border-t border-border/60 p-5">
        <ChatInput />
      </div>
    </div>
  )

  return (
    <div className="h-full min-h-0 overflow-hidden p-5">
      <div className="mb-5 flex items-center justify-between gap-4 rounded-3xl border border-border bg-card px-5 py-4 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Chat workspace</p>
          <h2 className="mt-1 text-xl font-semibold">Team conversation</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground lg:flex">
            <Users className="h-4 w-4" />
            12 members active
          </div>
          <button
            type="button"
            onClick={toggleMobileSidebar}
            aria-label={isMobileChannelSidebarOpen ? "Close channels menu" : "Open channels menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary transition-colors hover:bg-accent lg:hidden"
          >
            {isMobileChannelSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="relative h-[calc(100%-5.5rem)] min-h-0 overflow-hidden">
        {isMobile ? (
          <>
            {isMobileChannelSidebarOpen ? (
              <>
                <button
                  type="button"
                  aria-label="Close channels overlay"
                  onClick={closeMobileSidebar}
                  className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                />
                <div className="fixed inset-y-0 left-0 z-40 w-[min(86vw,20rem)] border-r border-border/60 bg-background shadow-2xl lg:hidden">
                  <ChannelSidebar onNavigate={closeMobileSidebar} />
                </div>
              </>
            ) : (
              <ConversationPanel />
            )}
          </>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="h-full min-h-0 overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
            <ResizablePanel defaultSize={24} minSize={20} maxSize={30} className="min-h-0 border-r border-border/60">
              <ChannelSidebar />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={76} minSize={45} className="min-h-0">
              <ConversationPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  )
}