const prisma = require("../../config/db.config")
const AppError = require("../../utils/app-error")
const { log } = require("../../utils/logger")
const projectsService = require("../projects/projects.service")

async function listTasks(user) {
  try {
    if (!user) throw AppError.unauthorized()

    // admin and hr see all tasks
    if (user.role === "admin" || user.role === "hr") {
      return await prisma.task.findMany({ include: { project: true, employee: { include: { user: { select: { id: true, email: true, role: true } } } }, timeLogs: true } })
    }

    // resolve employee
    const employee = await projectsService.getEmployeeByUserId(user.id)
    if (!employee) return []

    if (user.role === "pm") {
      // pm: tasks for projects they manage
      return await prisma.task.findMany({ where: { project: { managerEmployeeId: employee.id } }, include: { project: true, employee: true, timeLogs: true } })
    }

    // employee: tasks assigned to them or tasks in projects they're a team member of
    return await prisma.task.findMany({ where: { OR: [{ employeeId: employee.id }, { project: { teamMembers: { some: { employeeId: employee.id } } } }] }, include: { project: true, employee: true, timeLogs: true } })
  } catch (err) {
    log("error", "tasks.service listTasks error", { message: err?.message, stack: err?.stack })
    throw new AppError("Failed to list tasks", 500, false)
  }
}

async function getTaskById(id) {
  try {
    console.log("getTaskById called with id", id)
    return await prisma.task.findUnique({ where: { id: id }, include: { project: true, employee: { include: { user: { select: { id: true, email: true, role: true } } } }, timeLogs: { include: { employee: { include: { user: { select: { id: true, email: true } } } } } } } })
  } catch (err) {
    console.log("getTaskById error", {  err })
    throw new AppError("Failed to fetch task", 500, false)
  }
}

async function createTask(data) {
  try {
    const createData = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      projectId: data.project_id,
      employeeId: data.employee_id,
    }

    const created = await prisma.task.create({ data: createData })
    return created
  } catch (err) {
    log("error", "tasks.service createTask error", { message: err?.message, stack: err?.stack })
    if (err && err.code === "P2003") {
      throw new AppError("Invalid project or employee selected", 400, true)
    }
    throw new AppError("Failed to create task", 500, false)
  }
}

async function updateTask(id, data) {
  try {
    const updateData = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.priority !== undefined) updateData.priority = data.priority
    if (data.status !== undefined) updateData.status = data.status
    if (data.due_date !== undefined) updateData.dueDate = data.due_date ? new Date(data.due_date) : null
    if (data.employee_id !== undefined) updateData.employeeId = data.employee_id

    const updated = await prisma.task.update({ where: { id: id }, data: updateData })
    return updated
  } catch (err) {
    if (err && err.code === "P2025") {
      throw AppError.notFound("Task not found")
    }
    throw new AppError("Failed to update task", 500, false)
  }
}

async function deleteTask(id) {
  try {
    const deleted = await prisma.task.delete({ where: { id: id } })
    return deleted
  } catch (err) {
    if (err && err.code === "P2025") {
      throw AppError.notFound("Task not found")
    }
    throw new AppError("Failed to delete task", 500, false)
  }
}

module.exports = {
  listTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
}
