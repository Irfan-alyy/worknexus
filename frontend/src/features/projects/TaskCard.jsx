import { Edit } from "lucide-react"
import { useGlobalStore } from "@/stores/use-global-store"

function statusBadgeClass(status) {
  if (!status) return "bg-zinc-200 text-zinc-700"
  if (status === "Completed") return "bg-emerald-100 text-emerald-700"
  if (status === "In Progress") return "bg-amber-100 text-amber-700"
  return "bg-zinc-200 text-zinc-700"
}

export default function TaskCard({ project, task, onEdit, onOpen }) {
  const { user, role, openAside } = useGlobalStore()

  const totalMinutes = (task.timelogs || []).reduce((s, t) => s + (t.minutes || 0), 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  function handleEdit(e) {
    e.stopPropagation()
    if (onEdit) return onEdit(project, task)
  }

  function handleOpen() {
    if (onOpen) return onOpen(project, task)
    // fallback: open basic aside
    openAside(`Task: ${task.title}`, null)
  }

  const canEdit = role === "pm" || (project.members || []).includes(user.name)

  return (
    <div className="group relative rounded-xl border border-border bg-background px-3 py-2 text-sm">
      <button type="button" onClick={handleOpen} className="min-w-0 text-left">
          <p className="break-words font-medium leading-5">{task.title}</p>
          <p className="mt-1 break-words text-xs text-muted-foreground">{task.id} • Due {task.due} • Est {task.estimate}</p>
          <p className="break-words text-xs text-muted-foreground">Time: {hours}h {minutes}m</p>
      </button>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClass(task.status)}`}>{task.status}</span>
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold">{task.priority}</span>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={handleEdit}
            className="inline-flex shrink-0 items-center gap-1 rounded-md border bg-card px-2 py-1 text-sm shadow-sm"
            title="Edit"
            aria-label={`Edit ${task.title}`}
          >
            <Edit className="h-4 w-4" />
            <span className="sm:hidden">Edit</span>
          </button>
        )}
      </div>
    </div>
  )
}
