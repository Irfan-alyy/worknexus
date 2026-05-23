const prisma = require("../../config/db.config")
const AppError = require("../../utils/app-error")
const { log } = require("../../utils/logger")
const projectsService = require("../projects/projects.service")

async function createTimeLog(data) {
  try {
    const createData = {
      taskId: data.task_id,
      employeeId: data.employee_id,
      hours: data.hours,
      description: data.description,
      loggedAt: data.logged_at ? new Date(data.logged_at) : new Date(),
    }

    const created = await prisma.timeLog.create({ data: createData })
    return created
  } catch (err) {
    log("error", "time-logs.service createTimeLog error", { message: err?.message, stack: err?.stack })
    if (err && err.code === "P2003") {
      throw new AppError("Invalid task or employee selected", 400, true)
    }
    throw new AppError("Failed to create time log", 500, false)
  }
}

async function listTimeLogs(filter = {}) {
  try {
    const where = {}
    if (filter.taskId) where.taskId = filter.taskId
    if (filter.employeeId) where.employeeId = Number(filter.employeeId)
    console.log("listTimeLogs with filter", filter, "constructed where", where)
    return await prisma.timeLog.findMany({ where, include: { employee: { include: { user: { select: { id: true, email: true } } } }, task: true } })
  } catch (err) {
    throw new AppError("Failed to list time logs", 500, false)
  }
}

async function getTimeLogById(id) {
  try {
    return await prisma.timeLog.findUnique({ where: { id: Number(id) }, include: { employee: { include: { user: { select: { id: true, email: true } } } }, task: true } })
  } catch (err) {
    throw new AppError("Failed to fetch time log", 500, false)
  }
}

module.exports = {
  createTimeLog,
  listTimeLogs,
  getTimeLogById,
}
