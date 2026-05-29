import apiClient from "@/lib/axios"

export async function listVisibleProjects() {
  const response = await apiClient.get("/projects")
  return response.data
}

export async function getProjects() {
  return listVisibleProjects()
}

export async function getProjectById(id) {
  const response = await apiClient.get(`/projects/${id}`)
  return response.data
}

export async function getProjectTeam(projectId) {
  const response = await apiClient.get(`/projects/${projectId}/team`)
  return response.data
}

export async function getProjectTasks(projectId, { page = 1, limit = 5 } = {}) {
  const response = await apiClient.get(`/projects/${projectId}/tasks`, {
    params: { page, limit },
  })
  return response.data
}

export async function getTaskById(taskId) {
  const response = await apiClient.get(`/tasks/${taskId}`)
  return response.data
}

export async function createTask(projectId, task) {
  const payload = {
    title: task.title,
    description: task.description || undefined,
    priority: task.priority || "medium",
    status: task.status || "pending",
    due_date: task.due_date || undefined,
    project_id: projectId,
  }

  if (task.employee_id !== undefined && task.employee_id !== null && task.employee_id !== "") {
    payload.employee_id = Number(task.employee_id)
  }

  const response = await apiClient.post("/tasks", payload)
  return response.data
}

export async function updateTask(projectId, taskId, updates) {
  void projectId

  const payload = {
    title: updates.title,
    description: updates.description,
    priority: updates.priority,
    status: updates.status,
    due_date: updates.due_date,
  }

  if (updates.employee_id !== undefined && updates.employee_id !== null && updates.employee_id !== "") {
    payload.employee_id = Number(updates.employee_id)
  }

  const response = await apiClient.patch(`/tasks/${taskId}`, payload)
  return response.data
}

export async function createTimeLog(payload) {
  const response = await apiClient.post("/time-logs", payload)
  return response.data
}

export async function addTimelog(projectId, taskId, payload = {}) {
  void projectId
  return createTimeLog({ task_id: taskId, ...payload })
}

export default {
  getProjects,
  listVisibleProjects,
  getProjectById,
  getProjectTeam,
  getProjectTasks,
  getTaskById,
  createTask,
  updateTask,
  createTimeLog,
  addTimelog,
}
