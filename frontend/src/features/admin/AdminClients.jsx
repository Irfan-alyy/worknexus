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
          <div
            key={c.id}
            role="button"
            tabIndex={0}
            onClick={() => onEdit(`Client details: ${c.name}`, <ClientDetail client={c} />)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                onEdit(`Client details: ${c.name}`, <ClientDetail client={c} />)
              }
            }}
            className="flex cursor-pointer items-start justify-between rounded-lg border border-border bg-background p-4 transition-colors hover:bg-secondary/30"
          >
            <div>
              <h3 className="font-medium">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Projects: {c.projects.join(", ")}</p>
            </div>
            <div>
              <ActionMenu
                items={[
                  { label: "View", onClick: () => onEdit(`Client details: ${c.name}`, <ClientDetail client={c} />) },
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

function ClientDetail({ client }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Client profile</p>
        <h3 className="mt-1 text-xl font-semibold">{client.name}</h3>
      </div>
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Projects</p>
        <div className="mt-3 space-y-2">
          {client.projects.map((project) => (
            <div key={project} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {project}
            </div>
          ))}
        </div>
      </section>
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
