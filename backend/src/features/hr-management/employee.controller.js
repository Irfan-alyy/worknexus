const {
  listEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
} = require("./employee.service")
const { successResponse, errorResponse } = require("../../utils/response")
const AppError = require("../../utils/app-error")

const SELF_SERVICE_FIELDS = new Set([
  "email",
  "password",
  "firstName",
  "first_name",
  "lastName",
  "last_name",
])

function isEmployeeOwner(employee, user) {
  return Boolean(employee && user && Number(employee.userId) === Number(user.id))
}

function hasRestrictedFields(payload = {}) {
  return [
    "role",
    "departmentId",
    "department_id",
    "paymentModel",
    "payment_model",
    "baseSalary",
    "base_salary",
    "hourlyRate",
    "hourly_rate",
    "revenueSharePercent",
    "revenue_share_percent",
  ].some((field) => payload[field] !== undefined)
}

async function listEmployeesController(req, res, next) {
  try {
    const employees = await listEmployees()
    const { response, statusCode } = successResponse(employees)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function getEmployeeController(req, res, next) {
  try {
    const { id } = req.params
    const employee = await getEmployeeById(id)
    if (!employee) {
      throw AppError.notFound("Employee not found")
    }

	const userRole = req.user?.role
	if (userRole !== "admin" && userRole !== "hr" && !isEmployeeOwner(employee, req.user)) {
		throw AppError.forbidden("You can only view your own employee profile")
	}

    const { response, statusCode } = successResponse(employee)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function createEmployeeController(req, res, next) {
  try {
    const payload = req.validatedBody || req.body
    const created = await createEmployee(payload)
    const { response, statusCode } = successResponse(created, "Employee account created", 201)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function updateEmployeeController(req, res, next) {
  try {
    const { id } = req.params
    const payload = req.validatedBody || req.body
    const userRole = req.user?.role

  const employee = await getEmployeeById(id)
  if (!employee) {
    throw AppError.notFound("Employee not found")
  }

  const isAdminOrHr = userRole === "admin" || userRole === "hr"
  const isOwner = isEmployeeOwner(employee, req.user)

  if (!isAdminOrHr) {
    if (!isOwner) {
      throw AppError.forbidden("You can only update your own employee profile")
    }

    if (hasRestrictedFields(payload)) {
      throw AppError.forbidden("You can only update email, password, first name, and last name on your own profile")
    }
  }

    const updated = await updateEmployee(id, payload)
    const { response, statusCode } = successResponse(updated, "Employee updated")
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  listEmployeesController,
  getEmployeeController,
  createEmployeeController,
  updateEmployeeController,
}