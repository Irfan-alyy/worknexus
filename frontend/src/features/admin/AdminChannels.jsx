import { CollapsibleListSection } from "@/components/shared/collapsible-list-section"

const dummyChannels = [
  {
    id: 1,
    name: "# general",
    members: 24,
    lastMessage: "Sprint planning moved to 10:30 AM.",
  },
  {
    id: 2,
    name: "# announcements",
    members: 31,
    lastMessage: "Office will be closed next Friday.",
  },
  {
    id: 3,
    name: "# admin-updates",
    members: 8,
    lastMessage: "Payroll approvals are ready for review.",
  },
]

export default function AdminChannels() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Channels</h2>
        <p className="mt-1 text-sm text-muted-foreground">Monitor shared channels used by the admin team.</p>
      </div>

      <CollapsibleListSection
        title="All Channels"
        description="Click to view all channel names and activity."
        items={dummyChannels}
        renderItem={(channel) => (
          <div key={channel.id} className="rounded-lg border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium">{channel.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Members: {channel.members}</p>
              </div>
              <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                Active
              </span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Last message: {channel.lastMessage}</p>
          </div>
        )}
      />
    </div>
  )
}
