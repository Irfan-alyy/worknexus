import { CollapsibleListSection } from "@/components/shared/collapsible-list-section"

const dummyMessages = [
  {
    id: 1,
    name: "Aisha Khan",
    role: "Operations",
    preview: "Please review the latest project notes.",
    time: "2m ago",
  },
  {
    id: 2,
    name: "Bilal Ahmed",
    role: "Project Manager",
    preview: "Client approval is pending for the design draft.",
    time: "18m ago",
  },
  {
    id: 3,
    name: "Sara Malik",
    role: "HR",
    preview: "The onboarding checklist has been updated.",
    time: "1h ago",
  },
]

export default function AdminDirectMessages() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Direct Messages</h2>
        <p className="mt-1 text-sm text-muted-foreground">Track private conversations across admin-related teams.</p>
      </div>

      <CollapsibleListSection
        title="All Direct Messages"
        description="Click to view all private conversations and people names."
        items={dummyMessages}
        renderItem={(message) => (
          <div key={message.id} className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium">{message.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{message.role}</p>
              </div>
              <span className="text-xs text-muted-foreground">{message.time}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{message.preview}</p>
          </div>
        )}
      />
    </div>
  )
}
