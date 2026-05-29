import { useMemo, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import * as service from "./projects-service"

function toDateInputValue(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

function toIsoDate(value) {
  if (!value) return undefined
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function createTaskForm(task) {
  return {
    title: task?.title || "",
    description: task?.description || "",
    priority: task?.priority || "medium",
    status: task?.status || "pending",
    due_date: toDateInputValue(task?.dueDate),
    employee_id: task?.employeeId ? String(task.employeeId) : "",
  }
}

function formatMemberLabel(member) {
  const employee = member?.employee || member
  const name = [employee?.firstName, employee?.lastName].filter(Boolean).join(" ")
  const email = employee?.user?.email
  if (name && email) return `${name}`
  return name || email || "Team member"
}

export default function TaskEditor({ project, task: originalTask, onSaved }) {
  const queryClient = useQueryClient()
  const [task, setTask] = useState(() => createTaskForm(originalTask))
  const [hours, setHours] = useState("")
  const [description, setDescription] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isAddingTimeLog, setIsAddingTimeLog] = useState(false)

  const canAddTimeLog = Boolean(originalTask?.id)

  const projectScope = useMemo(() => project?.id, [project?.id])

  const { data: teamResponse, isLoading: isLoadingTeam } = useQuery({
    queryKey: queryKeys.projects.detail(projectScope, "team-members"),
    queryFn: async () => service.getProjectTeam(projectScope),
    enabled: Boolean(projectScope),
  })

  const teamMembers = useMemo(() => teamResponse?.data || [], [teamResponse])

  async function invalidateTaskQueries(taskId) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.list() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectScope) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.tasks(projectScope) }),
      taskId ? queryClient.invalidateQueries({ queryKey: queryKeys.projects.task(taskId) }) : Promise.resolve(),
    ])
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      const payload = {
        title: task.title.trim(),
        description: task.description.trim() || undefined,
        priority: task.priority,
        status: task.status,
        due_date: toIsoDate(task.due_date),
      }

      if (task.employee_id !== "") {
        payload.employee_id = Number(task.employee_id)
      }

      let result
      if (originalTask) {
        result = await service.updateTask(project?.id, originalTask.id, payload)
      } else {
        result = await service.createTask(project?.id, payload)
      }

      await invalidateTaskQueries(result?.data?.id || originalTask?.id)
      if (onSaved) onSaved(result)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      alert(err.message || "Failed to save task")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAddTimelog() {
    if (!originalTask) return alert("Save the task first before adding time logs")
    if (!originalTask.employeeId) return alert("Assign the task before adding a time log")
    if (!hours || Number(hours) <= 0) return alert("Enter hours greater than 0")

    setIsAddingTimeLog(true)
    try {
      const result = await service.createTimeLog({
        task_id: originalTask.id,
        employee_id: originalTask.employeeId,
        hours: Number(hours),
        description: description.trim() || undefined,
      })

      await invalidateTaskQueries(originalTask.id)
      setHours("")
      setDescription("")
      if (onSaved) onSaved(result)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      alert(err.message || "Failed to add timelog")
    } finally {
      setIsAddingTimeLog(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Task editor</p>
        <h3 className="mt-1 text-lg font-semibold">{originalTask ? `Edit: ${originalTask.title}` : "New task"}</h3>
      </div>

      <div className="space-y-2">
        <input className="w-full rounded-lg border border-border bg-background p-2.5" value={task.title} onChange={(e) => setTask({ ...task, title: e.target.value })} placeholder="Title" />
        <textarea className="w-full rounded-lg border border-border bg-background p-2.5" rows={3} value={task.description} onChange={(e) => setTask({ ...task, description: e.target.value })} placeholder="Description" />
        <div className="grid gap-2 sm:grid-cols-2">
          <select className="w-full rounded-lg border border-border bg-background p-2.5" value={task.status} onChange={(e) => setTask({ ...task, status: e.target.value })}>
            <option value="pending">Pending</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
          <select className="w-full rounded-lg border border-border bg-background p-2.5" value={task.priority} onChange={(e) => setTask({ ...task, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <input type="date" className="w-full rounded-lg border border-border bg-background p-2.5" value={task.due_date} onChange={(e) => setTask({ ...task, due_date: e.target.value })} />
          <select className="w-full rounded-lg border border-border bg-background p-2.5" value={task.employee_id} onChange={(e) => setTask({ ...task, employee_id: e.target.value })}>
            <option value="">Unassigned</option>
            {isLoadingTeam ? (
              <option value="" disabled>
                Loading team members...
              </option>
            ) : null}
            {teamMembers.map((member) => {
              const employee = member?.employee || member
              return (
                <option key={employee?.id || member?.employeeId} value={employee?.id || member?.employeeId}>
                  {formatMemberLabel(member)}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {canAddTimeLog && (
        <div className="space-y-2 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-medium">Add time log</p>
          <div className="grid gap-2 sm:grid-cols-[120px_1fr_auto]">
            <input type="number" min="0.1" max="24" step="0.1" className="w-full rounded-lg border border-border bg-background p-2.5" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Hours" />
            <input className="w-full rounded-lg border border-border bg-background p-2.5" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
            <button type="button" onClick={handleAddTimelog} disabled={isAddingTimeLog} className="rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-foreground disabled:opacity-60">
              {isAddingTimeLog ? "Adding..." : "Add"}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Time logs are submitted in hours and synced to the backend immediately.</p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onSaved} className="rounded-lg border border-border px-3 py-2 text-sm font-medium">Cancel</button>
        <button type="button" onClick={handleSave} disabled={isSaving} className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  )
}
