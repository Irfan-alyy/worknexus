const AppError = require("../../utils/app-error")
const { successResponse } = require("../../utils/response")
const payrollService = require("./payroll.service")
const { log } = require("../../utils/logger")
const projectsService = require("../projects/projects.service")

async function resolveEmployeeForUser(user) {
  if (!user) return null
  return projectsService.getEmployeeByUserId(user.id)
}

async function listPayrollsController(req, res, next) {
  try {
    const { employeeId, paymentStatus, start, end } = req.query

    let scopedEmployeeId = employeeId
    if (req.user.role !== "admin" && req.user.role !== "hr") {
      const employee = await resolveEmployeeForUser(req.user)
      if (!employee) {
        const { response, statusCode } = successResponse([])
        return res.status(statusCode).json(response)
      }
      scopedEmployeeId = employee.id
    }

    const records = await payrollService.listPayrolls({ employeeId: scopedEmployeeId, paymentStatus, start, end })
    const { response, statusCode } = successResponse(records)
    return res.status(statusCode).json(response)
  } catch (err) {
    log("error", "listPayrollsController error", { message: err?.message, stack: err?.stack })
    next(err)
  }
}

async function getPayrollController(req, res, next) {
  try {
    const id = req.params.id
    const record = await payrollService.getPayrollById(id)
    if (!record) throw AppError.notFound("Payroll not found")

    if (req.user.role === "admin" || req.user.role === "hr") {
      const { response, statusCode } = successResponse(record)
      return res.status(statusCode).json(response)
    }

    const employee = await resolveEmployeeForUser(req.user)
    if (!employee || record.employeeId !== employee.id) {
      throw AppError.forbidden()
    }

    const { response, statusCode } = successResponse(record)
    return res.status(statusCode).json(response)
  } catch (err) {
    log("error", "getPayrollController error", { message: err?.message, stack: err?.stack })
    next(err)
  }
}

async function calculatePayrollController(req, res, next) {
  try {
    if (req.user.role !== "admin" && req.user.role !== "hr") throw AppError.forbidden()
    const payload = req.validatedBody || req.body
    const { employee_id, pay_period_start, pay_period_end, revenue_amount, create_record } = payload

    const calc = await payrollService.calculatePayrollForEmployee({ employeeId: employee_id, payPeriodStart: pay_period_start, payPeriodEnd: pay_period_end, revenueAmount: revenue_amount })

    if (create_record) {
      const created = await payrollService.createPayrollRecord({
        employeeId: employee_id,
        amount: calc.amount,
        payPeriodStart: pay_period_start,
        payPeriodEnd: pay_period_end,
        breakdown: calc.breakdown,
      })

      if (created.created) {
        const { response, statusCode } = successResponse(created.payroll, "Payroll created", 201)
        return res.status(statusCode).json(response)
      }

      const { response, statusCode } = successResponse(
        { calculation: calc, skippedReason: created.skippedReason, payroll: created.payroll },
        created.skippedReason === "zero_amount" ? "Payroll amount is zero, record not created" : "Payroll already exists"
      )
      return res.status(statusCode).json(response)
    }

    const { response, statusCode } = successResponse(calc)
    return res.status(statusCode).json(response)
  } catch (err) {
    log("error", "calculatePayrollController error", { message: err?.message, stack: err?.stack })
    next(err)
  }
}

async function updatePayrollController(req, res, next) {
  try {
    if (req.user.role !== "admin" && req.user.role !== "hr") throw AppError.forbidden()
    const id = req.params.id
    const payload = req.validatedBody || req.body
    const { payment_status: paymentStatus } = payload
    const updated = await payrollService.updatePayrollStatus(id, paymentStatus)
    const { response, statusCode } = successResponse(updated, "Payroll updated")
    return res.status(statusCode).json(response)
  } catch (err) {
    log("error", "updatePayrollController error", { message: err?.message, stack: err?.stack })
    next(err)
  }
}

module.exports = {
  listPayrollsController,
  getPayrollController,
  calculatePayrollController,
  updatePayrollController,
}