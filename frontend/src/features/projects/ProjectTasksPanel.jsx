import { useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { useGlobalStore } from "@/stores/use-global-store"
import * as service from "./projects-service"
import TaskCard from "./TaskCard"
import TaskEditor from "./TaskEditor"
import TaskDetail from "./TaskDetail"

export default function ProjectTasksPanel() {
  const { user, role, openAside, authenticate } = useGlobalStore()
  const [projects, setProjects] = useState([])
  const [searchParams] = useSearchParams()
  const projectIdParam = searchParams.get("projectId")

  function load() {
    setProjects(service.getProjects())
  }

  useEffect(() => {
    load()
  }, [])

  const visible = projects.filter((p) => {
    if (projectIdParam) return String(p.id) === projectIdParam
    if (role === "pm") return true
    return (p.members || []).includes(user.name)
  })

  const [editModal, setEditModal] = useState({ open: false, project: null, task: null })

  function openEditor(project, task) {
    // open editor in a centered modal (popup)
    setEditModal({ open: true, project, task })
  }

  function closeEditModal() {
    setEditModal({ open: false, project: null, task: null })
    load()
  }

  function openDetail(project, task) {
    openAside(`Task: ${task.title}`, <TaskDetail project={project} task={task} />)
  }

  // pagination state for projects
  const [page, setPage] = useState(1)
  const pageSize = 5
  const totalPages = Math.max(1, Math.ceil(visible.length / pageSize))
  const paged = visible.slice((page - 1) * pageSize, page * pageSize)

  useEffect(() => {
    setPage(1)
  }, [projectIdParam])

  const [expanded, setExpanded] = useState({})
  function toggleExpanded(projectId) {
    setExpanded((s) => ({ ...s, [projectId]: !s[projectId] }))
  }

  function loadDemoEmployee() {
    // set a demo employee session so they can test assigned tasks
    authenticate({ name: "Waqar Ahmed", email: "waqar@example.com", role: "employee" })
    // reload projects from service
    load()
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 sm:p-6">
      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Project Tasks</h1>
            <p className="mt-1 text-sm text-muted-foreground">Tasks and timelogs visible to PMs and assigned employees.</p>
          </div>
        </div>

        <section className="space-y-4">
          {visible.length === 0 && (
            <div className="text-sm text-muted-foreground">
              <p>No projects available for your account.</p>
              {role === 'employee' && (
                <div className="mt-2">
                  <p>If you're testing locally, try the demo employee session to view assigned tasks.</p>
                  <div className="mt-2">
                    <button onClick={loadDemoEmployee} className="rounded bg-primary px-3 py-2 text-white">Load demo employee (Waqar Ahmed)</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {paged.map((p) => (
            <article key={p.id} className="rounded-3xl border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Client: {p.client} • Manager: {p.manager}</p>
                </div>
                <div className="flex items-center gap-2">
                  {role === "pm" && (
                    <button type="button" onClick={() => openEditor(p)} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium">
                      <Plus className="h-4 w-4" />
                      Add Task
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {((role === 'employee') ? (p.tasks || []).filter(t => t.assignee === user.name) : (p.tasks || [])).slice(0, expanded[p.id] ? undefined : 5).map((t) => (
                  <TaskCard key={t.id} project={p} task={t} onEdit={openEditor} onOpen={openDetail} />
                ))}

                {(p.tasks || []).length > 5 && (
                  <div className="mt-2">
                    <button type="button" onClick={() => toggleExpanded(p.id)} className="text-sm text-primary">
                      {expanded[p.id] ? 'Show less' : `View more (${(p.tasks || []).length - 5} more)`}
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`px-2 py-1 rounded ${page === i + 1 ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{editModal.task ? `Edit task: ${editModal.task.title}` : `New task`}</h3>
              <button onClick={closeEditModal} className="rounded-full border border-border bg-secondary px-2 py-1 text-sm">Close</button>
            </div>
            <div className="mt-4">
              <TaskEditor project={editModal.project} task={editModal.task} onSaved={closeEditModal} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
