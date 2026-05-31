const { getEmployeeActivities, getEmployeeActivityMetrics, getHRActivities, getAdminActivities } = require("./activities.service")
const { successResponse } = require("../../utils/response")
const AppError = require("../../utils/app-error")
const prisma = require("../../config/db.config")

/**
 * GET /api/v1/employees/:id/activities
 * Get all activities for an employee
 */
async function getActivities(req, res, next) {
	try {
		const { id } = req.params
		const employeeId = parseInt(id, 10)

		if (!employeeId || employeeId <= 0) {
			return next(AppError.validationError("Invalid employee ID"))
		}

		// Verify employee exists
		const employee = await prisma.employee.findUnique({
			where: { id: employeeId },
		})

		if (!employee) {
			return next(AppError.notFound("Employee not found"))
		}

		// Check authorization: user can view own activities, admin/hr can view any
		const isAdmin = req.user.role === "admin"
		const isHR = req.user.role === "hr"
		const isOwner = Number(employee.userId) === Number(req.user.id)

		if (!isAdmin && !isHR && !isOwner) {
			return next(AppError.forbidden("You can only view your own activities"))
		}

		const activities = await getEmployeeActivities(employeeId)

		const { response, statusCode } = successResponse(activities, "Activities retrieved successfully")
		return res.status(statusCode).json(response)
	} catch (error) {
		next(error)
	}
}

/**
 * GET /api/v1/employees/:id/activities/metrics
 * Get activity metrics (summary statistics) for an employee
 */
async function getActivityMetrics(req, res, next) {
	try {
		const { id } = req.params
		const employeeId = parseInt(id, 10)

		if (!employeeId || employeeId <= 0) {
			return next(AppError.validationError("Invalid employee ID"))
		}

		// Verify employee exists
		const employee = await prisma.employee.findUnique({
			where: { id: employeeId },
		})

		if (!employee) {
			return next(AppError.notFound("Employee not found"))
		}

		// Check authorization
		const isAdmin = req.user.role === "admin"
		const isHR = req.user.role === "hr"
		const isOwner = Number(employee.userId) === Number(req.user.id)

		if (!isAdmin && !isHR && !isOwner) {
			return next(AppError.forbidden("You can only view your own metrics"))
		}

		const metrics = await getEmployeeActivityMetrics(employeeId)

		const { response, statusCode } = successResponse(metrics, "Activity metrics retrieved successfully")
		return res.status(statusCode).json(response)
	} catch (error) {
		next(error)
	}
}

/**
 * GET /api/v1/hr/activities
 * Get all activities for HR dashboard
 */
async function getHRActivitiesController(req, res, next) {
	try {
		// Check authorization: only HR and admin can access
		const isHR = req.user.role === "hr"
		const isAdmin = req.user.role === "admin"

		if (!isHR && !isAdmin) {
			return next(AppError.forbidden("Only HR and admin can view HR activities"))
		}

		// Optional limit parameter
		const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50

		const activities = await getHRActivities(limit)

		const { response, statusCode } = successResponse(activities, "HR activities retrieved successfully")
		return res.status(statusCode).json(response)
	} catch (error) {
		next(error)
	}
}

/**
 * GET /api/v1/admin/activities
 * Get all activities for Admin dashboard
 */
async function getAdminActivitiesController(req, res, next) {
	try {
		// Check authorization: only admin can access
		const isAdmin = req.user.role === "admin"

		if (!isAdmin) {
			return next(AppError.forbidden("Only admin can view admin activities"))
		}

		// Optional limit parameter
		const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50

		const activities = await getAdminActivities(limit)

		const { response, statusCode } = successResponse(activities, "Admin activities retrieved successfully")
		return res.status(statusCode).json(response)
	} catch (error) {
		next(error)
	}
}

module.exports = {
	getActivities,
	getActivityMetrics,
	getHRActivitiesController,
	getAdminActivitiesController,
}
