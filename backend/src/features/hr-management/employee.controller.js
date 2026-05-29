const {
  listEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
} = require("./employee.service")
const { successResponse, errorResponse } = require("../../utils/response")
const AppError = require("../../utils/app-error")

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

    // Only admin and hr can update email and role
    if ((payload.email || payload.role) && userRole !== "admin" && userRole !== "hr") {
      throw AppError.forbidden("Only admin and HR can update email and role")
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