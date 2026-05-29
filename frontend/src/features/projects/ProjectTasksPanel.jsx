import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"

import { queryKeys } from "@/config/query-keys"
import { useGlobalStore } from "@/stores/use-global-store"
import * as service from "./projects-service"
import TaskCard from "./TaskCard"
import TaskEditor from "./TaskEditor"
import TaskDetail from "./TaskDetail"

const PAGE_SIZE = 5

function ProjectTaskSection({ project, onEdit, onOpenDetail }) {
  const { user, role } = useGlobalStore()

  const tasksQuery = useInfiniteQuery({
    queryKey: queryKeys.projects.tasks(project.id),
    queryFn: async ({ pageParam = 1 }) => service.getProjectTasks(project.id, { page: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const payload = lastPage?.data
      return payload?.hasMore ? payload.page + 1 : undefined
    },
  })

  const tasks = useMemo(() => tasksQuery.data?.pages.flatMap((page) => page?.data?.tasks || []) || [], [tasksQuery.data])
  const hasTasks = tasks.length > 0
  const canCreateTask = role === "admin" || role === "hr" || role === "pm" || role === "employee"

  function canEditTask(task) {
    if (role === "admin" || role === "hr" || role === "pm") return true
    if (role !== "employee") return false
    return task?.employee?.user?.email && task.employee.user.email === user?.email
  }

  return (
    <article className="rounded-3xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-foreground">{project.name || project.title || "Untitled project"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.client?.name || project.client?.company || "No client"}
            {project.manager?.firstName || project.manager?.lastName || project.manager?.user?.email
              ? ` • Manager: ${[project.manager?.firstName, project.manager?.lastName].filter(Boolean).join(" ") || project.manager?.user?.email}`
              : ""}
          </p>
        </div>

        {canCreateTask && (
          <button
            type="button"
            onClick={() => onEdit(project, null)}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/60"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {tasksQuery.isLoading && !hasTasks ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/60 p-4 text-sm text-muted-foreground">
            Loading tasks...
          </div>
        ) : null}

        {!tasksQuery.isLoading && !hasTasks ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/60 p-4 text-sm text-muted-foreground">
            No tasks have been added to this project yet.
          </div>
        ) : null}

        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            project={project}
            task={task}
            canEdit={canEditTask(task)}
            onEdit={onEdit}
            onOpen={onOpenDetail}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Showing {tasks.length} task{tasks.length === 1 ? "" : "s"}
        </p>

        {tasksQuery.hasNextPage ? (
          <button
            type="button"
            onClick={() => tasksQuery.fetchNextPage()}
            disabled={tasksQuery.isFetchingNextPage}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-secondary/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {tasksQuery.isFetchingNextPage ? "Loading..." : `View more (${PAGE_SIZE})`}
          </button>
        ) : null}
      </div>
    </article>
  )
}

export default function ProjectTasksPanel() {
  const { openAside } = useGlobalStore()
  const [searchParams] = useSearchParams()
  const projectIdParam = searchParams.get("projectId")
  const [editModal, setEditModal] = useState({ open: false, project: null, task: null })

  const { data: projectsResponse, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: async () => service.getProjects(),
  })

  const projects = useMemo(() => projectsResponse?.data || [], [projectsResponse])
  const visibleProjects = useMemo(() => {
    if (projectIdParam) {
      return projects.filter((project) => String(project.id) === String(projectIdParam))
    }
    return projects
  }, [projectIdParam, projects])

  function openEditor(project, task) {
    setEditModal({ open: true, project, task })
  }

  function closeEditModal() {
    setEditModal({ open: false, project: null, task: null })
  }

  function openDetail(project, task) {
    openAside(`Task: ${task.title}`, <TaskDetail project={project} taskId={task.id} task={task} />)
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 sm:p-6">
      <div className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Project Tasks</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Live project task boards with 5-item paging per project.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/60 p-4 text-sm text-muted-foreground">
            Loading projects...
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
            {error?.response?.data?.message || "Unable to load projects."}
          </div>
        ) : null}

        {!isLoading && !isError && visibleProjects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/60 p-4 text-sm text-muted-foreground">
            No projects are visible for this account.
          </div>
        ) : null}

        <section className="space-y-4">
          {visibleProjects.map((project) => (
            <ProjectTaskSection
              key={project.id}
              project={project}
              onEdit={openEditor}
              onOpenDetail={openDetail}
            />
          ))}
        </section>
      </div>

      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-foreground">
                {editModal.task ? `Edit task: ${editModal.task.title}` : `New task`}
              </h3>
              <button onClick={closeEditModal} className="rounded-full border border-border bg-secondary px-2 py-1 text-sm text-foreground">
                Close
              </button>
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
