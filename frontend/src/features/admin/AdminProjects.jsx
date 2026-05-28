import { useState } from "react"
import { Edit, Plus, Trash2 } from "lucide-react"

import { useGlobalStore } from "@/stores/use-global-store"

const dummyProjects = [
  {
    id: 1,
    title: "Website Redesign",
    description: "Frontend revamp for ACME",
    client: "Acme Corp",
    status: "In Progress",
    completion: 46,
    manager: "Imran Shah",
    channel: "#acme-website",
    dueDate: "2026-08-01",
    members: ["Imran Shah", "Waqar Ahmed", "Areeba Noor"],
    tasks: [
      { id: "T-101", title: "Design header", status: "Completed", due: "2026-05-10", estimate: "2h", priority: "Low", blocker: "" },
      { id: "T-102", title: "Implement responsive nav", status: "In Progress", due: "2026-05-25", estimate: "8h", priority: "High", blocker: "API" },
    ],
  },
  {
    id: 2,
    title: "API Migration",
    description: "Migrate to new payments API",
    client: "Beta Ltd",
    status: "Planning",
    completion: 12,
    manager: "Aisha Khan",
    channel: "#payments",
    dueDate: "2026-09-15",
    members: ["Aisha Khan", "Mariam Ali"],
    tasks: [{ id: "T-201", title: "Inventory endpoints", status: "Pending", due: "2026-06-01", estimate: "5h", priority: "Medium", blocker: "" }],
  },
]

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  )
}

function MiniCount({ label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-background px-3 py-2">
      <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}

function projectTone(status) {
  if (!status) return "border-border"
  if (status.toLowerCase() === "in progress") return "border-amber-300/50"
  if (status.toLowerCase() === "at risk") return "border-rose-300/50"
  if (status.toLowerCase() === "planning") return "border-sky-300/50"
  return "border-border"
}

function summarizeTasks(tasks = []) {
  return tasks.reduce(
    (result, task) => {
      if (task.status === "Completed") result.completed += 1
      if (task.status === "In Progress") result.inProgress += 1
      if (task.status === "Pending") result.pending += 1
      return result
    },
    { completed: 0, inProgress: 0, pending: 0 },
  )
}

function statusBadgeClass(status) {
  if (!status) return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
  if (status === "Completed") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
  if (status === "In Progress") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
  return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
}

export default function AdminProjects({ onEdit, onOpenDetail }) {
  const { user, openAside } = useGlobalStore()
  const [items, setItems] = useState(dummyProjects)
  const openDetail = onOpenDetail ?? openAside
  const openEditor = onEdit ?? openAside

  function handleAdd() {
    const id = items.length + 1
    setItems((prev) => [...prev, { id, title: `New Project ${id}`, description: "Description...", client: "New Client", status: "Planning", completion: 0, members: ["Pending assignment"], tasks: [] }])
  }

  function handleDelete(id) {
    const project = items.find((it) => it.id === id)
    if (!project) return
    if (!window.confirm(`Delete project "${project.title}"? This action cannot be undone.`)) return
    setItems((prev) => prev.filter((it) => it.id !== id))
  }

  const totals = items.reduce(
    (acc, p) => {
      acc.total += 1
      acc.progress += p.completion || 0
      if (p.status && p.status.toLowerCase() === "at risk") acc.atRisk += 1
      return acc
    },
    { total: 0, progress: 0, atRisk: 0 },
  )

  const avg = items.length ? Math.round(totals.progress / items.length) : 0

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 sm:p-6">
      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="mt-1 text-sm text-muted-foreground">Signed in as {user?.email || user?.name || "Guest"}.</p>
          </div>

          <button type="button" onClick={handleAdd} title="Add project" aria-label="Add project" className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium">
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Projects" value={String(totals.total)} note="Total projects" />
          <StatCard label="Average progress" value={`${avg}%`} note="Across projects" />
          <StatCard label="At risk" value={String(totals.atRisk)} note="Needs attention" />
        </section>

        <section className="space-y-3">
          {items.map((p) => {
            const summary = summarizeTasks(p.tasks)
            return (
              <article
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => openDetail(`Details: ${p.title}`, <ProjectDetail project={p} />)}
                className={`group relative cursor-pointer rounded-3xl border bg-card p-5 shadow-sm ${projectTone(p.status)}`}
              >
                <div className="absolute -top-4 right-4 z-10 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
                  <div className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 shadow-sm">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditor(`Edit project: ${p.title}`, <ProjectEditor project={p} />)
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-sm"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(p.id)
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-sm"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="text-left">
                    <h3 className="mt-1 text-lg font-semibold">{p.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Client: {p.client || "N/A"}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Manager: {p.manager} • Channel: {p.channel} • Due: {p.dueDate}</p>
                  </div>

                  <div className="min-w-[11rem] rounded-2xl border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Project health</p>
                    <p className="mt-1 text-sm font-medium">{p.status}</p>
                    <div className="mt-2 h-2 rounded-full bg-secondary">
                      <div className="h-2 rounded-full bg-primary" style={{ width: `${p.completion ?? 0}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{p.completion ?? 0}% complete</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <MiniCount label="Completed" value={summary.completed} />
                  <MiniCount label="In Progress" value={summary.inProgress} />
                  <MiniCount label="Pending" value={summary.pending} />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div />
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </div>
  )
}

function ProjectEditor({ project }) {
  return (
    <div>
      <p className="text-sm">
        Edit fields for <strong>{project.title}</strong>
      </p>
      <div className="mt-3 space-y-2">
        <input className="w-full rounded border p-2" defaultValue={project.title} />
        <textarea className="w-full rounded border p-2" defaultValue={project.description} />
        <div className="flex justify-end">
          <button className="aside-save rounded bg-primary px-3 py-2 text-white">Save</button>
        </div>
      </div>
    </div>
  )
}

function ProjectDetail({ project }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Project overview</p>
        <h3 className="mt-1 text-xl font-semibold">{project.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Client: {project.client || "N/A"} • {project.manager} • {project.channel} • Due: {project.dueDate}
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Members</p>
        <div className="mt-3 space-y-2">
          {(project.members || []).map((member) => (
            <div key={member} className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
              {member}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Recent tasks</p>
        <div className="mt-3 space-y-2">
          {(project.tasks || []).slice(0, 6).map((task) => (
            <div key={task.id} className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm">
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {task.id} • Due {task.due} • Est {task.estimate}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">{task.priority}</span>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClass(task.status)}`}>{task.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
