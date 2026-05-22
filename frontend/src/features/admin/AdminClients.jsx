import ActionMenu from "@/components/ui/action-menu"

const dummyClients = [
  { id: 1, name: "Acme Corp", projects: ["Website Redesign"] },
  { id: 2, name: "Beta Ltd.", projects: ["API Migration"] },
]

export default function AdminClients({ onEdit }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Clients</h2>
      </div>

      <div className="space-y-3">
        {dummyClients.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-background p-4 flex items-start justify-between">
            <div>
              <h3 className="font-medium">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Projects: {c.projects.join(", ")}</p>
            </div>
            <div>
              <ActionMenu
                items={[
                  { label: "Edit", onClick: () => onEdit(`Edit client: ${c.name}`, <ClientEditor client={c} />) },
                  { label: "Mail", onClick: () => onEdit(`Mail client: ${c.name}`, <MailClient client={c} />) },
                ]}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ClientEditor({ client }) {
  return (
    <div>
      <p className="text-sm">Edit client: <strong>{client.name}</strong></p>
      <div className="mt-3">
        <input className="w-full rounded border p-2" defaultValue={client.name} />
        <div className="mt-3 flex justify-end">
          <button className="px-3 py-2 rounded bg-primary text-white aside-save">Save</button>
        </div>
      </div>
    </div>
  )
}

function MailClient({ client }) {
  return (
    <div>
      <p className="text-sm">Send mail to <strong>{client.name}</strong></p>
        <div className="mt-3 space-y-2">
        	<input className="w-full rounded border p-2" placeholder="Subject" />
        	<textarea className="w-full rounded border p-2" placeholder="Message" />
        	<div className="flex justify-end">
       	  <button className="px-3 py-2 rounded bg-primary text-white aside-save">Send</button>
        	</div>
        </div>
    </div>
  )
}
