const { getManagerActivities, getManagerActivityMetrics } = require("../activities/activities.service")
const { successResponse } = require("../../utils/response")
const AppError = require("../../utils/app-error")
const { getUserById } = require("../users/users.service")

async function getPmActivities(req, res, next) {
  try {
    const user = req.user
    if (!user || user.role !== "pm") {
      return next(AppError.forbidden("Only project managers can access this resource"))
    }

    const manager = await getUserById(user.id)
    const managerId = manager?.employee?.id

    if (!Number.isInteger(managerId) || managerId <= 0) {
      const { response, statusCode } = successResponse([], "PM activities retrieved successfully")
      return res.status(statusCode).json(response)
    }

    const activities = await getManagerActivities(managerId)

    const { response, statusCode } = successResponse(activities, "PM activities retrieved successfully")
    return res.status(statusCode).json(response)
  } catch (error) {
    next(error)
  }
}

async function getPmActivityMetrics(req, res, next) {
  try {
    const user = req.user
    if (!user || user.role !== "pm") {
      return next(AppError.forbidden("Only project managers can access this resource"))
    }

    const manager = await getUserById(user.id)
    const managerId = manager?.employee?.id

    if (!Number.isInteger(managerId) || managerId <= 0) {
      const { response, statusCode } = successResponse(
        {
          tasksDueThisWeek: 0,
          totalHoursThisWeek: "0.00",
          pendingPayrollAmount: "0.00",
          pendingPayrollCount: 0,
          projectsManaged: 0,
        },
        "PM activity metrics retrieved successfully"
      )
      return res.status(statusCode).json(response)
    }

    const metrics = await getManagerActivityMetrics(managerId)

    const { response, statusCode } = successResponse(metrics, "PM activity metrics retrieved successfully")
    return res.status(statusCode).json(response)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getPmActivities,
  getPmActivityMetrics,
}
