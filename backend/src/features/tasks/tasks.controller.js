const AppError = require("../../utils/app-error")
const { successResponse } = require("../../utils/response")
const tasksService = require("./tasks.service")
const projectsService = require("../projects/projects.service")
const { log } = require("../../utils/logger")

async function listTasksController(req, res, next) {
  try {
    const tasks = await tasksService.listTasks(req.user)
    const { response, statusCode } = successResponse(tasks)
    return res.status(statusCode).json(response)
  } catch (err) {
    next(err)
  }
}

async function getTaskController(req, res, next) {
  try {
    const id = req.params?.id
    const task = await tasksService.getTaskById(id)
    if (!task) throw AppError.notFound("Task not found")

    // permission: admin/hr always, project manager for their project, assigned employee, or team member
    const allowed = await _canAccessTask(req.user, task)
    if (!allowed) throw AppError.forbidden()

    const { response, statusCode } = successResponse(task)
    return res.status(statusCode).json(response)
  } catch (err) {
    next(err)
  }
}

async function createTaskController(req, res, next) {
  try {
    const payload = req.validatedBody || req.body

    // permission check: admin/hr always
    if (req.user.role === "admin" || req.user.role === "hr") {
      const created = await tasksService.createTask(payload)
      const { response, statusCode } = successResponse(created, "Task created", 201)
      return res.status(statusCode).json(response)
    }

    // pm: allowed if manager of project
    if (req.user.role === "pm") {
      const isManager = await projectsService.isProjectManager(payload.project_id, req.user.id)
      if (!isManager) throw AppError.forbidden("Only project manager can create tasks for this project")
      const created = await tasksService.createTask(payload)
      const { response, statusCode } = successResponse(created, "Task created", 201)
      return res.status(statusCode).json(response)
    }

    // employee: allow if creating task assigned to themselves or if they are member of project
    if (req.user.role === "employee") {
      const employee = await projectsService.getEmployeeByUserId(req.user.id)
      if (!employee) throw AppError.forbidden()

      // allow if employee_id matches their id
      if (payload.employee_id && Number(payload.employee_id) === employee.id) {
        const created = await tasksService.createTask(payload)
        const { response, statusCode } = successResponse(created, "Task created", 201)
        return res.status(statusCode).json(response)
      }

      // or allow if they are team member of project
      const isMember = await projectsService.isTeamMember(payload.project_id, req.user.id)
      if (isMember) {
        const created = await tasksService.createTask({ ...payload, employee_id: null }) // prevent them from assigning 
        const { response, statusCode } = successResponse(created, "Task created", 201)
        return res.status(statusCode).json(response)
      }

      throw AppError.forbidden()
    }

    throw AppError.forbidden()
  } catch (err) {
    log("error", "createTaskController error", { message: err?.message, stack: err?.stack })
    next(err)
  }
}

async function updateTaskController(req, res, next) {
  try {
    const id = req.params?.id
    const payload = req.validatedBody || req.body
    const task = await tasksService.getTaskById(id)
    if (!task) throw AppError.notFound("Task not found")

    // permission: admin/hr always
    if (req.user.role === "admin" || req.user.role === "hr") {
      const updated = await tasksService.updateTask(id, payload)
      const { response, statusCode } = successResponse(updated, "Task updated")
      return res.status(statusCode).json(response)
    }

    // pm: allowed if project manager
    if (req.user.role === "pm") {
      const isManager = await projectsService.isProjectManager(task.projectId, req.user.id)
      if (!isManager) throw AppError.forbidden()
      const updated = await tasksService.updateTask(id, payload)
      const { response, statusCode } = successResponse(updated, "Task updated")
      return res.status(statusCode).json(response)
    }

    // employee: allowed if they are assigned employee
    if (req.user.role === "employee") {
      const employee = await projectsService.getEmployeeByUserId(req.user.id)
      if (!employee) throw AppError.forbidden()
      if (task.employeeId !== employee.id) throw AppError.forbidden()
      const updated = await tasksService.updateTask(id, payload)
      const { response, statusCode } = successResponse(updated, "Task updated")
      return res.status(statusCode).json(response)
    }

    throw AppError.forbidden()
  } catch (err) {
    next(err)
  }
}

async function deleteTaskController(req, res, next) {
  try {
    const id = req.params?.id
    const task = await tasksService.getTaskById(id)
    if (!task) throw AppError.notFound("Task not found")

    // only admin/hr or project manager can delete
    if (req.user.role === "admin" || req.user.role === "hr") {
      await tasksService.deleteTask(id)
      const { response, statusCode } = successResponse(null, "Task deleted")
      return res.status(statusCode).json(response)
    }

    if (req.user.role === "pm") {
      const isManager = await projectsService.isProjectManager(task.projectId, req.user.id)
      if (!isManager) throw AppError.forbidden()
      await tasksService.deleteTask(id)
      const { response, statusCode } = successResponse(null, "Task deleted")
      return res.status(statusCode).json(response)
    }

    throw AppError.forbidden()
  } catch (err) {
    next(err)
  }
}

async function _canAccessTask(user, task) {
  if (!user) return false
  if (user.role === "admin" || user.role === "hr") return true
  if (user.role === "pm") {
    return await projectsService.isProjectManager(task.projectId, user.id)
  }
  if (user.role === "employee") {
    const employee = await projectsService.getEmployeeByUserId(user.id)
    if (!employee) return false
    if (task.employeeId === employee.id) return true
    return await projectsService.isTeamMember(task.projectId, user.id)
  }
  return false
}

module.exports = {
  listTasksController,
  getTaskController,
  createTaskController,
  updateTaskController,
  deleteTaskController,
}
