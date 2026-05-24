import { Edit } from "lucide-react"
import { useGlobalStore } from "@/stores/use-global-store"

function statusBadgeClass(status) {
  if (!status) return "bg-zinc-200 text-zinc-700"
  if (status === "Completed") return "bg-emerald-100 text-emerald-700"
  if (status === "In Progress") return "bg-amber-100 text-amber-700"
  return "bg-zinc-200 text-zinc-700"
}

export default function TaskCard({ project, task, onEdit, onOpen }) {
  const { user, role } = useGlobalStore()

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
    <div className="group relative flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-sm">
      <div onClick={handleOpen} role="button" tabIndex={0} className="cursor-pointer">
        <p className="font-medium">{task.title}</p>
        <p className="text-xs text-muted-foreground">{task.id} • Due {task.due} • Est {task.estimate}</p>
        <p className="text-xs text-muted-foreground">Time: {hours}h {minutes}m</p>
      </div>

      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClass(task.status)}`}>{task.status}</span>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold">{task.priority}</span>
      </div>

      {canEdit && (
        <div className="absolute -top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto">
          <button type="button" onClick={handleEdit} className="inline-flex items-center gap-1 rounded-md border bg-card px-2 py-1 text-sm" title="Edit">
            <Edit className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
