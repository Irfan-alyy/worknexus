import { useState } from "react"
import { useGlobalStore } from "@/stores/use-global-store"
import * as service from "./projects-service"

export default function TaskEditor({ project, task: originalTask, onSaved }) {
  const { closeAside } = useGlobalStore()
  const [task, setTask] = useState(originalTask || { title: "", status: "Pending", priority: "Medium", estimate: "" })
  const [minutes, setMinutes] = useState(0)
  const [note, setNote] = useState("")

  async function handleSave() {
    try {
      if (originalTask) {
        await service.updateTask(project.id, originalTask.id, task)
      } else {
        await service.createTask(project.id, task)
      }
      if (onSaved) onSaved()
      closeAside()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      alert(err.message || "Failed to save task")
    }
  }

  async function handleAddTimelog() {
    if (!originalTask) return alert("Save the task first before adding timelogs")
    try {
      await service.addTimelog(project.id, originalTask.id, { minutes, note })
      setMinutes(0)
      setNote("")
      if (onSaved) onSaved()
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      alert(err.message || "Failed to add timelog")
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Task editor</p>
        <h3 className="mt-1 text-lg font-semibold">{originalTask ? `Edit: ${originalTask.title}` : "New task"}</h3>
      </div>

      <div className="space-y-2">
        <input className="w-full rounded border p-2" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} placeholder="Title" />
        <input className="w-full rounded border p-2" value={task.estimate} onChange={(e) => setTask({ ...task, estimate: e.target.value })} placeholder="Estimate (e.g. 2h)" />
        <select className="w-full rounded border p-2" value={task.status} onChange={(e) => setTask({ ...task, status: e.target.value })}>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Completed</option>
        </select>
        <select className="w-full rounded border p-2" value={task.priority} onChange={(e) => setTask({ ...task, priority: e.target.value })}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <textarea className="w-full rounded border p-2" value={task.blocker || ""} onChange={(e) => setTask({ ...task, blocker: e.target.value })} placeholder="Blocker notes" />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Add timelog</p>
        <div className="flex gap-2">
          <input type="number" min="0" className="w-24 rounded border p-2" value={minutes} onChange={(e) => setMinutes(Number(e.target.value || 0))} />
          <input className="flex-1 rounded border p-2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" />
          <button type="button" onClick={handleAddTimelog} className="rounded bg-secondary px-3 py-2">Add</button>
        </div>
        <p className="text-xs text-muted-foreground">Timelogs are stored per task (minutes).</p>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={closeAside} className="px-3 py-2 rounded border">Cancel</button>
        <button type="button" onClick={handleSave} className="px-3 py-2 rounded bg-primary text-white">Save</button>
      </div>
    </div>
  )
}
