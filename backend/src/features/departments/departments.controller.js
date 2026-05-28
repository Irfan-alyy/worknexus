const {
  listDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
} = require("./departments.service")
const { successResponse } = require("../../utils/response")
const AppError = require("../../utils/app-error")

async function listDepartmentsController(req, res, next) {
  try {
    const data = await listDepartments()
    const { response, statusCode } = successResponse(data)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function getDepartmentController(req, res, next) {
  try {
    const { id } = req.params
    const dept = await getDepartmentById(id)
    if (!dept) throw AppError.notFound("Department not found")
    const { response, statusCode } = successResponse(dept)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function createDepartmentController(req, res, next) {
  try {
    const payload = req.validatedBody || req.body
    const created = await createDepartment(payload)
    const { response, statusCode } = successResponse(created, "Department created", 201)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function updateDepartmentController(req, res, next) {
  try {
    const { id } = req.params
    const payload = req.validatedBody || req.body
    const updated = await updateDepartment(id, payload)
    const { response, statusCode } = successResponse(updated, "Department updated")
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  listDepartmentsController,
  getDepartmentController,
  createDepartmentController,
  updateDepartmentController,
}
