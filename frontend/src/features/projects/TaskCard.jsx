import { Edit } from "lucide-react"

const statusChipStyles = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  in_progress: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  blocked: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
}

const priorityChipStyles = {
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  high: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  critical: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
}

function taskStatusBadgeClass(status) {
  const normalized = String(status || "").toLowerCase()

  return statusChipStyles[normalized] || "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
}

function formatTaskStatus(status) {
  if (!status) return "Unknown"
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function formatDate(value) {
  if (!value) return "N/A"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString()
}

export default function TaskCard({ project, task, onEdit, onOpen, canEdit = false }) {
  const assignee = task.employee
    ? `${task.employee.firstName || ""} ${task.employee.lastName || ""}`.trim() || task.employee.user?.email || "Assigned"
    : "Unassigned"
  const totalHours = Number(task.totalHours || 0)
  const hoursLabel = totalHours > 0 ? `${totalHours.toFixed(1).replace(/\.0$/, "")}h logged` : "No time logged yet"

  function handleEdit(e) {
    e.stopPropagation()
    if (onEdit) return onEdit(project, task)
  }

  function handleOpen() {
    if (onOpen) return onOpen(project, task)
  }

  return (
    <div className="group relative flex items-start justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-3 text-sm shadow-sm transition-colors hover:bg-secondary/40">
      <button type="button" onClick={handleOpen} className="flex min-w-0 flex-1 flex-col items-start text-left">
        <p className="truncate font-medium text-foreground">{task.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {assignee} • Due {formatDate(task.dueDate)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{hoursLabel}</p>
        {task.description ? <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{task.description}</p> : null}
      </button>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${taskStatusBadgeClass(task.status)}`}>
          {formatTaskStatus(task.status)}
        </span>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityChipStyles[String(task.priority || "medium").toLowerCase()] || "bg-secondary text-foreground"}`}>
          {String(task.priority || "medium").charAt(0).toUpperCase() + String(task.priority || "medium").slice(1)}
        </span>
      </div>

      {canEdit && (
        <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
          <button type="button" onClick={handleEdit} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium shadow-sm" title="Edit task">
            <Edit className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
