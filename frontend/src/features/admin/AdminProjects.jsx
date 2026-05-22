import { useState } from "react"
import { Plus } from "lucide-react"
import ActionMenu from "@/components/ui/action-menu"

const dummyProjects = [
  { id: 1, title: "Website Redesign", description: "Frontend revamp for ACME" },
  { id: 2, title: "API Migration", description: "Migrate to new payments API" },
]

export default function AdminProjects({ onEdit }) {
  const [items, setItems] = useState(dummyProjects)

  function handleAdd() {
    const id = items.length + 1
    setItems([...items, { id, title: `New Project ${id}`, description: "Description..." }])
  }

  function handleDelete(id) {
    const project = items.find((it) => it.id === id)
    if (!project) return
    if (!window.confirm(`Delete project "${project.title}"? This action cannot be undone.`)) return
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <div className="flex gap-2">
          <button onClick={handleAdd} title="Add project" aria-label="Add project" className="inline-flex items-center justify-center rounded-md p-2 border">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((p) => (
          <div
            key={p.id}
            onClick={() => onEdit(`Details: ${p.title}`, <ProjectDetail project={p} />)}
            className="rounded-lg border border-border bg-background p-4 flex items-start justify-between cursor-pointer"
          >
            <div>
              <h3 className="font-medium">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
            </div>
            <div>
              <ActionMenu
                items={[
                  { label: "Edit", onClick: () => onEdit(`Edit project: ${p.title}`, <ProjectEditor project={p} />) },
                  { label: "Delete", onClick: () => handleDelete(p.id) },
                ]}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProjectEditor({ project }) {
  return (
    <div>
      <p className="text-sm">Edit fields for <strong>{project.title}</strong></p>
      <div className="mt-3 space-y-2">
        <input className="w-full rounded border p-2" defaultValue={project.title} />
        <textarea className="w-full rounded border p-2" defaultValue={project.description} />
        <div className="flex justify-end">
          <button className="px-3 py-2 rounded bg-primary text-white aside-save">Save</button>
        </div>
      </div>
    </div>
  )
}

function ProjectDetail({ project }) {
  return (
    <div>
      <p className="text-sm">Project details for <strong>{project.title}</strong></p>
      <p className="mt-3 text-sm text-muted-foreground">{project.description}</p>
    </div>
  )
}
