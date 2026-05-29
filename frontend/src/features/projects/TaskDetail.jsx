import { useState, useMemo } from "react"
import { CheckCircle2, PlayCircle, AlertTriangle, Clock3, Plus, X } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { useGlobalStore } from "@/stores/use-global-store"
import * as service from "./projects-service"

const statusBadgeStyles = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  in_progress: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  blocked: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
}

const priorityBadgeStyles = {
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  critical: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
}

function formatTaskStatus(status) {
  if (!status) return "Unknown"
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function formatTaskPriority(priority) {
  if (!priority) return "Medium"
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

function formatDateTime(value) {
  if (!value) return "N/A"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleString()
}

function getLocalDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  const hours = String(now.getHours()).padStart(2, "0")
  const minutes = String(now.getMinutes()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function TaskDetail({ project, taskId, task: initialTask }) {
  const queryClient = useQueryClient()
  const { user, role } = useGlobalStore()
  const [showTimeLogForm, setShowTimeLogForm] = useState(false)
  const [timeLogForm, setTimeLogForm] = useState({
    hours: "",
    description: "",
    logged_at: getLocalDateTime(),
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.projects.task(taskId),
    queryFn: async () => service.getTaskById(taskId),
    enabled: Boolean(taskId),
  })

  const task = data?.data || initialTask
  const timeLogs = useMemo(() => (Array.isArray(task?.timeLogs) ? task.timeLogs : []), [task?.timeLogs])
  const totalHours = timeLogs.reduce((sum, entry) => sum + Number(entry?.hours || 0), 0)
  const dueDate = task?.dueDate ? new Date(task.dueDate) : null
  const now = new Date()
  const isOverdue = Boolean(dueDate && !Number.isNaN(dueDate.getTime()) && dueDate < now && task?.status !== "completed")
  const isCompleted = task?.status === "completed"
  const isPending = task?.status === "pending"
  const isInProgress = task?.status === "in_progress"

  // Determine if current user can see action buttons
  // Visible to: admin, hr, pm, or the assigned employee
  const canViewActions = useMemo(() => {
    const isPrivilegedRole = ["admin", "hr", "pm"].includes(role)
    const isAssignedEmployee = user?.email && task?.employee?.user?.email && user.email === task.employee.user.email
    return isPrivilegedRole || isAssignedEmployee
  }, [role, user?.email, task?.employee?.user?.email])

  const quickState = useMemo(() => {
    if (isCompleted) {
      return {
        tone: "success",
        icon: CheckCircle2,
        title: "Task completed",
        message: "Nice work. This task is finished and no further action is required unless scope changes.",
      }
    }

    if (isOverdue && isInProgress) {
      return {
        tone: "danger",
        icon: AlertTriangle,
        title: "Overdue and still active",
        message: "This task is past its deadline but still in progress. It should be reviewed and completed or re-estimated soon.",
      }
    }

    if (isPending) {
      return {
        tone: "warning",
        icon: Clock3,
        title: "Ready to start",
        message: "This task is still pending. Start it now and keep an eye on the deadline so it does not slip.",
      }
    }

    if (isInProgress) {
      return {
        tone: "info",
        icon: PlayCircle,
        title: "Work in progress",
        message: isOverdue
          ? "This task is moving, but the deadline has passed. Focus on finishing it or update the plan."
          : "This task is actively moving. Keep momentum and mark it complete once the deliverable is done.",
      }
    }

    return {
      tone: "neutral",
      icon: Clock3,
      title: "Task status",
      message: "Review the task progress and update the status when work begins or finishes.",
    }
  }, [isCompleted, isInProgress, isOverdue, isPending])

  const updateTaskStatus = useMutation({
    mutationFn: async (status) => service.updateTask(project?.id, taskId, { status }),
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.task(taskId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.tasks(project?.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(project?.id) }),
      ])
      return response
    },
  })

  const createTimeLog = useMutation({
    mutationFn: async (payload) => service.addTimelog(project?.id, taskId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.projects.task(taskId) })
      setShowTimeLogForm(false)
      setTimeLogForm({ hours: "", description: "", logged_at: getLocalDateTime() })
    },
  })

  if (isLoading && !task) {
    return <div className="text-sm text-muted-foreground">Loading task details...</div>
  }

  if (isError && !task) {
    return <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">Unable to load task details.</div>
  }

  const assignee = task?.employee
    ? `${task.employee.firstName || ""} ${task.employee.lastName || ""}`.trim() || task.employee.user?.email || "Assigned"
    : "Unassigned"

  const QuickIcon = quickState.icon

  function handleStartTask() {
    updateTaskStatus.mutate("in_progress")
  }

  function handleCompleteTask() {
    updateTaskStatus.mutate("completed")
  }

  function handleAddTimeLog() {
    if (!timeLogForm.hours || Number(timeLogForm.hours) <= 0) {
      alert("Please enter valid hours")
      return
    }
    createTimeLog.mutate({
      employee_id: task?.employeeId,
      hours: Number(timeLogForm.hours),
      description: timeLogForm.description || undefined,
      logged_at: timeLogForm.logged_at ? new Date(timeLogForm.logged_at).toISOString() : undefined,
    })
  }

  function handleTimeLogFormChange(field, value) {
    setTimeLogForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Task detail</p>
        <h3 className="mt-1 text-xl font-semibold">{task?.title || "Task"}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Project: {project?.name || project?.title || "N/A"}</p>
      </div>

      <section className={`rounded-2xl border p-4 shadow-sm ${quickState.tone === "success" ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/40 dark:bg-emerald-950/30" : quickState.tone === "danger" ? "border-rose-200 bg-rose-50/70 dark:border-rose-900/40 dark:bg-rose-950/30" : quickState.tone === "warning" ? "border-amber-200 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/30" : "border-border bg-card"}`}>
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 rounded-full p-2 ${quickState.tone === "success" ? "bg-emerald-100 text-emerald-700" : quickState.tone === "danger" ? "bg-rose-100 text-rose-700" : quickState.tone === "warning" ? "bg-amber-100 text-amber-700" : "bg-sky-100 text-sky-700"}`}>
            <QuickIcon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{quickState.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{quickState.message}</p>
            {canViewActions && (
              <div className="mt-3 flex flex-wrap gap-2">
                {isPending && !isCompleted ? (
                  <button
                    type="button"
                    onClick={handleStartTask}
                    disabled={updateTaskStatus.isPending}
                    className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    Start task
                  </button>
                ) : null}

                {!isCompleted ? (
                  <button
                    type="button"
                    onClick={handleCompleteTask}
                    disabled={updateTaskStatus.isPending}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Mark complete
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-medium">Overview</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeStyles[String(task?.status || "").toLowerCase()] || "bg-zinc-200 text-zinc-700"}`}>
            {formatTaskStatus(task?.status)}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityBadgeStyles[String(task?.priority || "medium").toLowerCase()] || "bg-secondary text-foreground"}`}>
            {formatTaskPriority(task?.priority)}
          </span>
          {task?.dueDate ? (
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isOverdue && !isCompleted ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" : "bg-secondary text-foreground"}`}>
              Due {formatDateTime(task?.dueDate)}
            </span>
          ) : null}
        </div>
        <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <div>Assignee: {assignee}</div>
          <div>Hours logged: {totalHours.toFixed(1).replace(/\.0$/, "")}h</div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-medium">Description</p>
        <p className="mt-2 text-sm text-muted-foreground">{task?.description || "No description provided."}</p>
      </section>

      {canViewActions && (
        <>
          <section className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm font-medium">Time Logs Overview</p>
            <div className="mt-3">
              <div className="rounded-lg bg-secondary/50 px-4 py-3">
                <p className="text-2xl font-bold text-foreground">{totalHours.toFixed(1).replace(/\.0$/, "")}h</p>
                <p className="mt-1 text-xs text-muted-foreground">Total time logged</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Time Logs</p>
              <button
                type="button"
                onClick={() => setShowTimeLogForm(!showTimeLogForm)}
                className="inline-flex items-center gap-1 rounded-full bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-sky-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Log Hours
              </button>
            </div>

            {showTimeLogForm && (
              <div className="mt-4 space-y-3 rounded-lg border border-border bg-background p-4">
                <div>
                  <label className="text-xs font-medium text-foreground">Hours *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={timeLogForm.hours}
                    onChange={(e) => handleTimeLogFormChange("hours", e.target.value)}
                    placeholder="4.5"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Description</label>
                  <input
                    type="text"
                    value={timeLogForm.description}
                    onChange={(e) => handleTimeLogFormChange("description", e.target.value)}
                    placeholder="What did you work on?"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">Logged At</label>
                  <input
                    type="datetime-local"
                    value={timeLogForm.logged_at}
                    onChange={(e) => handleTimeLogFormChange("logged_at", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAddTimeLog}
                    disabled={createTimeLog.isPending}
                    className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {createTimeLog.isPending ? "Saving..." : "Save Time Log"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTimeLogForm(false)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3 space-y-2">
              {timeLogs.length === 0 && <div className="text-sm text-muted-foreground">No time logs yet.</div>}
              {timeLogs.map((log) => (
                <div key={log.id || `${log.loggedAt}-${log.hours}`} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
                  <div>
                    <div className="font-medium text-foreground">{log.description || "Time log entry"}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {Number(log.hours || 0)} hours • {formatDateTime(log.loggedAt)}
                    </div>
                    {log.employee?.user?.email ? (
                      <div className="mt-1 text-xs text-muted-foreground">By {log.employee.user.email}</div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
