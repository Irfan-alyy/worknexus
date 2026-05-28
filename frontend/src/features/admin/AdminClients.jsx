import { Eye, Edit, Mail } from "lucide-react"

import { useGlobalStore } from "@/stores/use-global-store"

const dummyClients = [
  { id: 1, name: "Acme Corp", projects: ["Website Redesign"] },
  { id: 2, name: "Beta Ltd.", projects: ["API Migration"] },
]

export default function AdminClients({ onEdit }) {
  const { openAside } = useGlobalStore()

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Clients</h2>
      </div>

      <div className="space-y-3">
        {dummyClients.map((c) => (
          <div
            key={c.id}
            role="button"
            tabIndex={0}
            onClick={() => openAside(`Client details: ${c.name}`, <ClientDetail client={c} />)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                openAside(`Client details: ${c.name}`, <ClientDetail client={c} />)
              }
            }}
            className="group relative flex cursor-pointer items-start justify-between rounded-lg border border-border bg-background p-4 pr-16 transition-colors hover:bg-secondary/30"
          >
            <div>
              <h3 className="font-medium">{c.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Projects: {c.projects.join(", ")}</p>
            </div>
            <div className="absolute -right-1 -top-1 z-10 rounded-full border border-border bg-background p-1 opacity-0 shadow-sm transition-all duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    openAside(`Client details: ${c.name}`, <ClientDetail client={c} />)
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="View"
                  aria-label={`View ${c.name}`}
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onEdit?.(`Edit client: ${c.name}`, <ClientEditor client={c} />)
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="Edit"
                  aria-label={`Edit ${c.name}`}
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    openAside(`Mail client: ${c.name}`, <MailClient client={c} />)
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="Mail"
                  aria-label={`Mail ${c.name}`}
                >
                  <Mail className="h-3.5 w-3.5" />
                </button>
              </div>
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
