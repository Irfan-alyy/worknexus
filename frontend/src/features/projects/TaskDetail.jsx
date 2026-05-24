import { useGlobalStore } from "@/stores/use-global-store"

export default function TaskDetail({ project, task }) {
  const { role } = useGlobalStore()

  const totalMinutes = (task.timelogs || []).reduce((s, t) => s + (t.minutes || 0), 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Task detail</p>
        <h3 className="mt-1 text-xl font-semibold">{task.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Project: {project.title}</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-medium">Assignment</p>
        <div className="mt-2 text-sm text-muted-foreground">
          <div>Assignee: {task.assignee || 'Unassigned'}</div>
          <div>Manager: {project.manager || 'N/A'}</div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-medium">Timelogs</p>
        <div className="mt-3 space-y-2">
          {(task.timelogs || []).length === 0 && <div className="text-sm text-muted-foreground">No timelogs yet.</div>}
          {(task.timelogs || []).map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-xl bg-background px-3 py-2 text-sm">
              <div>
                <div className="font-medium">{l.note || 'Entry'}</div>
                <div className="text-xs text-muted-foreground">{l.minutes} minutes</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Total time: {hours}h {minutes}m</p>
      </section>
    </div>
  )
}
