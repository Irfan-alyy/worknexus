const AppError = require("../../utils/app-error")
const { successResponse } = require("../../utils/response")
const timeLogsService = require("./time-logs.service")
const projectsService = require("../projects/projects.service")
const { log } = require("../../utils/logger")
const tasksService = require("../tasks/tasks.service")
const prisma = require("../../config/db.config")

async function createTimeLogController(req, res, next) {
  try {
    const payload = req.validatedBody || req.body

    // permission: admin/hr always
    if (req.user.role === "admin" || req.user.role === "hr") {
      const created = await timeLogsService.createTimeLog(payload)
      const { response, statusCode } = successResponse(created, "Time log created", 201)
      return res.status(statusCode).json(response)
    }

    // pm: allowed if manager of the task's project
    if (req.user.role === "pm") {
      const task = await tasksService.getTaskById(payload.task_id)
      // fallback: check project service
      const isManager = await projectsService.isProjectManager(task.projectId, req.user.id)
      if (!isManager) throw AppError.forbidden()
      const created = await timeLogsService.createTimeLog(payload)
      const { response, statusCode } = successResponse(created, "Time log created", 201)
      return res.status(statusCode).json(response)
    }

    // employee: only allow logging for themselves
    if (req.user.role === "employee") {
      const employee = await projectsService.getEmployeeByUserId(req.user.id)
      if (!employee) throw AppError.forbidden()
      if (Number(payload.employee_id) !== employee.id) throw AppError.forbidden("Cannot log time for other employees")

      // ensure they belong to task's project or assigned to task
      const taskRecord = await tasksService.getTaskById(payload.task_id)
      if (!taskRecord) throw AppError.notFound("Task not found")

      const isMember = await projectsService.isTeamMember(taskRecord.projectId, req.user.id)
      if (!isMember && taskRecord.employeeId !== employee.id) throw AppError.forbidden()

      const created = await timeLogsService.createTimeLog(payload)
      const { response, statusCode } = successResponse(created, "Time log created", 201)
      return res.status(statusCode).json(response)
    }

    throw AppError.forbidden()
  } catch (err) {
    log("error", "createTimeLogController error", { message: err?.message, stack: err?.stack })
    next(err)
  }
}

async function listTimeLogsController(req, res, next) {
  try {
    const { taskId, employeeId } = req.query

    // basic permission: admin/hr see all
    if (req.user.role === "admin" || req.user.role === "hr") {
      const records = await timeLogsService.listTimeLogs({ taskId, employeeId })
      const { response, statusCode } = successResponse(records)
      return res.status(statusCode).json(response)
    }

    // pm: restrict to projects they manage
    if (req.user.role === "pm") {
      // if filtering by task, ensure manager of task's project
      if (taskId) {
        const task = await tasksService.getTaskById(taskId)
        if (!task) throw AppError.notFound("Task not found")
        const isManager = await projectsService.isProjectManager(task.projectId, req.user.id)
        if (!isManager) throw AppError.forbidden()
        const records = await timeLogsService.listTimeLogs({ taskId, employeeId })
        const { response, statusCode } = successResponse(records)
        return res.status(statusCode).json(response)
      }

      // Get all projects managed by this PM and filter time logs by those projects
      const employee = await projectsService.getEmployeeByUserId(req.user.id)
      if (!employee) throw AppError.forbidden()
      
      const managedProjects = await prisma.project.findMany({
        where: { managerEmployeeId: employee.id },
        select: { id: true }
      })
      
      const projectIds = managedProjects.map(p => p.id)
      const records = projectIds.length > 0 ? await timeLogsService.listTimeLogs({ projectIds, employeeId }) : []
      const { response, statusCode } = successResponse(records)
      return res.status(statusCode).json(response)
    }

    // employee: only their time logs or for tasks they belong to
    if (req.user.role === "employee") {
      const employee = await projectsService.getEmployeeByUserId(req.user.id)
      if (!employee) throw AppError.forbidden()
      if (employeeId && Number(employeeId) !== employee.id) throw AppError.forbidden()
      const records = await timeLogsService.listTimeLogs({ taskId, employeeId: employee.id })
      const { response, statusCode } = successResponse(records)
      return res.status(statusCode).json(response)
    }

    throw AppError.forbidden()
  } catch (err) {
    next(err)
  }
}

module.exports = {
  createTimeLogController,
  listTimeLogsController,
}
