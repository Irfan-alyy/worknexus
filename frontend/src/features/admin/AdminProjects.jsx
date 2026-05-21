import { useState } from "react"

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Projects</h2>
        <div className="flex gap-2">
          <button onClick={handleAdd} className="px-3 py-2 rounded bg-primary text-white">Add project</button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((p) => (
          <div key={p.id} className="rounded-lg border border-border bg-background p-4 flex items-start justify-between">
            <div>
              <h3 className="font-medium">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(`Edit project: ${p.title}`, <ProjectEditor project={p} />)} className="px-3 py-1 rounded bg-secondary text-foreground">Edit</button>
              <button onClick={() => onEdit(`Details: ${p.title}`, <ProjectDetail project={p} />)} className="px-3 py-1 rounded border">View</button>
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
          <button className="px-3 py-2 rounded bg-primary text-white">Save</button>
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
