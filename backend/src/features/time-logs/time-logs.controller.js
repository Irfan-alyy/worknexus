const AppError = require("../../utils/app-error")
const { successResponse } = require("../../utils/response")
const timeLogsService = require("./time-logs.service")
const projectsService = require("../projects/projects.service")
const { log } = require("../../utils/logger")

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
      const task = await projectsService.getTaskById ? await projectsService.getTaskById(payload.task_id) : null
      // fallback: check project service
      const isManager = await projectsService.isProjectManager(payload.project_id || (task && task.projectId), req.user.id)
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
      const task = await timeLogsService.getTimeLogById ? null : null
      // we will fetch task via projects.service.getProjectById using task id
      const taskRecord = await require("../tasks/tasks.service").getTaskById(payload.task_id)
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
        const task = await require("../tasks/tasks.service").getTaskById(taskId)
        if (!task) throw AppError.notFound("Task not found")
        const isManager = await projectsService.isProjectManager(task.projectId, req.user.id)
        if (!isManager) throw AppError.forbidden()
        const records = await timeLogsService.listTimeLogs({ taskId, employeeId })
        const { response, statusCode } = successResponse(records)
        return res.status(statusCode).json(response)
      }

      // otherwise show time logs for projects they manage
      // simple approach: return all (pm limited by client) — keep conservative and return empty
      const records = []
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
