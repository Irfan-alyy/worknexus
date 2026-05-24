const prisma = require("../../config/db.config")
const AppError = require("../../utils/app-error")
const { log } = require("../../utils/logger")

const MS_PER_DAY = 24 * 60 * 60 * 1000

function toNumber(value, fallback = 0) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function roundMoney(value) {
  return Math.round((toNumber(value, 0) + Number.EPSILON) * 100) / 100
}

function normalizeDate(value, fieldName) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new AppError(`${fieldName} is invalid`, 400, true)
  }
  return date
}

function startOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
}

function endOfUtcDay(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999))
}

function addUtcDays(date, days) {
  const next = new Date(date.getTime())
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

function getWeekPeriod(referenceDate = new Date()) {
  const reference = normalizeDate(referenceDate, "referenceDate")
  const dayIndexFromMonday = (reference.getUTCDay() + 6) % 7
  const start = startOfUtcDay(addUtcDays(reference, -dayIndexFromMonday))
  const end = endOfUtcDay(addUtcDays(start, 6))
  return { start, end }
}

function getMonthPeriod(referenceDate = new Date()) {
  const reference = normalizeDate(referenceDate, "referenceDate")
  const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1, 0, 0, 0, 0))
  const end = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 0, 23, 59, 59, 999))
  return { start, end }
}

function getScheduledPayrollPeriod(mode = "weekly", referenceDate = new Date()) {
  if (mode === "monthly") return getMonthPeriod(referenceDate)
  return getWeekPeriod(referenceDate)
}

function serializeDecimalValue(value) {
  if (value === null || value === undefined) return value
  const num = Number(value)
  return Number.isFinite(num) ? num : value
}

function serializeEmployeeForPayroll(employee) {
  if (!employee) return employee

  return {
    ...employee,
    baseSalary: serializeDecimalValue(employee.baseSalary),
    hourlyRate: serializeDecimalValue(employee.hourlyRate),
    revenueSharePercent: serializeDecimalValue(employee.revenueSharePercent),
  }
}

function serializePayrollRecord(record) {
  if (!record) return record

  return {
    ...record,
    amount: serializeDecimalValue(record.amount),
    employee: serializeEmployeeForPayroll(record.employee),
  }
}

async function loadEmployee(employeeId) {
  return prisma.employee.findUnique({
    where: { id: Number(employeeId) },
    include: {
      user: { select: { id: true, email: true, role: true } },
    },
  })
}

async function buildCompletedTaskBreakdown({ employeeId, start, end }) {
  const completedTasks = await prisma.task.findMany({
    where: {
      employeeId: Number(employeeId),
      status: "completed",
      completedAt: { gte: start, lte: end },
    },
    select: {
      id: true,
      title: true,
      completedAt: true,
      project: { select: { id: true, name: true } },
    },
    orderBy: { completedAt: "asc" },
  })

  const completedTaskIds = completedTasks.map((task) => task.id)
  const timeLogs = completedTaskIds.length
    ? await prisma.timeLog.findMany({
        where: {
          employeeId: Number(employeeId),
          taskId: { in: completedTaskIds },
          loggedAt: { gte: start, lte: end },
        },
        select: { taskId: true, hours: true },
      })
    : []

  const hoursByTaskId = new Map()
  for (const logEntry of timeLogs) {
    const existingHours = toNumber(hoursByTaskId.get(logEntry.taskId), 0)
    hoursByTaskId.set(logEntry.taskId, existingHours + toNumber(logEntry.hours, 0))
  }

  const completedTaskDetails = completedTasks.map((task) => ({
    id: task.id,
    title: task.title,
    projectId: task.project?.id || null,
    projectName: task.project?.name || null,
    completedAt: task.completedAt,
    hours: roundMoney(hoursByTaskId.get(task.id) || 0),
  }))

  const totalHours = roundMoney(
    completedTaskDetails.reduce((sum, task) => sum + toNumber(task.hours, 0), 0)
  )

  return {
    completedTaskCount: completedTaskDetails.length,
    totalHours,
    completedTasks: completedTaskDetails,
  }
}

function calculateFixedPayroll(baseSalary, start, end) {
  const normalizedStart = startOfUtcDay(start)
  const normalizedEnd = endOfUtcDay(end)

  if (normalizedEnd < normalizedStart) {
    throw new AppError("pay_period_end must be after pay_period_start", 400, true)
  }

  const daySegments = new Map()
  let cursor = new Date(normalizedStart.getTime())

  while (cursor <= normalizedEnd) {
    const year = cursor.getUTCFullYear()
    const month = cursor.getUTCMonth()
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    const existing = daySegments.get(monthKey) || {
      month: monthKey,
      days: 0,
      daysInMonth,
      amount: 0,
    }

    existing.days += 1
    existing.amount += toNumber(baseSalary, 0) / daysInMonth
    daySegments.set(monthKey, existing)
    cursor = addUtcDays(cursor, 1)
  }

  const segments = Array.from(daySegments.values()).map((segment) => ({
    ...segment,
    amount: roundMoney(segment.amount),
  }))

  const amount = roundMoney(segments.reduce((sum, segment) => sum + toNumber(segment.amount, 0), 0))
  const daysInPeriod = Math.round((startOfUtcDay(normalizedEnd) - startOfUtcDay(normalizedStart)) / MS_PER_DAY) + 1
  const prorated = !(segments.length === 1 && segments[0].days === segments[0].daysInMonth)

  return {
    amount,
    breakdown: {
      baseSalary: toNumber(baseSalary, 0),
      prorated,
      daysInPeriod,
      segments,
    },
  }
}

async function calculatePayrollForEmployee({ employeeId, employee: providedEmployee, payPeriodStart, payPeriodEnd, revenueAmount }) {
  try {
    const employee = providedEmployee || (await loadEmployee(employeeId))
    if (!employee) throw new AppError("Employee not found", 404, true)

    const start = normalizeDate(payPeriodStart, "pay_period_start")
    const end = normalizeDate(payPeriodEnd, "pay_period_end")

    if (end < start) {
      throw new AppError("pay_period_end must be after pay_period_start", 400, true)
    }

    let amount = 0
    let breakdown = {}

    const taskSummary = await buildCompletedTaskBreakdown({
      employeeId: employee.id,
      start,
      end,
    })

    if (employee.paymentModel === "hourly") {
      const hourlyRate = toNumber(employee.hourlyRate, 0)
      amount = roundMoney(taskSummary.totalHours * hourlyRate)
      breakdown = {
        ...taskSummary,
        hourlyRate,
      }
    } else if (employee.paymentModel === "fixed") {
      const fixedResult = calculateFixedPayroll(employee.baseSalary, start, end)
      amount = fixedResult.amount
      breakdown = {
        ...fixedResult.breakdown,
        ...taskSummary,
      }
    } else if (employee.paymentModel === "revenue_share") {
      const sharePercent = toNumber(employee.revenueSharePercent, 0)
      const grossRevenue = revenueAmount !== undefined ? Number(revenueAmount) : NaN

      if (!sharePercent || sharePercent <= 0) {
        throw new AppError("Revenue share percentage is not configured for this employee", 400, true)
      }

      if (!Number.isFinite(grossRevenue)) {
        throw new AppError("revenue_amount is required for revenue share payroll calculation", 400, true)
      }

      amount = roundMoney(grossRevenue * (sharePercent / 100))
      breakdown = {
        ...taskSummary,
        revenueAmount: roundMoney(grossRevenue),
        revenueSharePercent: sharePercent,
      }
    } else {
      amount = 0
      breakdown = taskSummary
    }

    return {
      employeeId: Number(employee.id),
      amount: roundMoney(amount),
      paymentModel: employee.paymentModel,
      payPeriodStart: start,
      payPeriodEnd: end,
      breakdown,
    }
  } catch (err) {
    log("error", "payroll.service calculatePayrollForEmployee error", { message: err?.message, stack: err?.stack })
    if (err instanceof AppError) throw err
    throw new AppError("Failed to calculate payroll", 500, false)
  }
}

async function createPayrollRecord({ employeeId, amount, payPeriodStart, payPeriodEnd, breakdown }) {
  try {
    const roundedAmount = roundMoney(amount)
    if (roundedAmount <= 0) {
      return { created: false, skippedReason: "zero_amount", payroll: null }
    }

    const employeeIdNumber = Number(employeeId)
    const start = normalizeDate(payPeriodStart, "pay_period_start")
    const end = normalizeDate(payPeriodEnd, "pay_period_end")

    const existing = await prisma.payroll.findFirst({
      where: {
        employeeId: employeeIdNumber,
        payPeriodStart: start,
        payPeriodEnd: end,
      },
      include: {
        employee: { include: { user: { select: { id: true, email: true, role: true } } } },
      },
    })

    if (existing) {
      return { created: false, skippedReason: "already_exists", payroll: serializePayrollRecord(existing) }
    }

    const created = await prisma.payroll.create({
      data: {
        employeeId: employeeIdNumber,
        amount: roundedAmount,
        payPeriodStart: start,
        payPeriodEnd: end,
        breakdown: breakdown || undefined,
      },
      include: {
        employee: { include: { user: { select: { id: true, email: true, role: true } } } },
      },
    })

    return { created: true, payroll: serializePayrollRecord(created) }
  } catch (err) {
    log("error", "payroll.service createPayrollRecord error", { message: err?.message, stack: err?.stack })
    if (err?.code === "P2002") {
      const start = normalizeDate(payPeriodStart, "pay_period_start")
      const end = normalizeDate(payPeriodEnd, "pay_period_end")
      const existing = await prisma.payroll.findFirst({
        where: {
          employeeId: Number(employeeId),
          payPeriodStart: start,
          payPeriodEnd: end,
        },
        include: {
          employee: { include: { user: { select: { id: true, email: true, role: true } } } },
        },
      })
      return { created: false, skippedReason: "already_exists", payroll: serializePayrollRecord(existing) }
    }
    if (err instanceof AppError) throw err
    throw new AppError("Failed to create payroll record", 500, false)
  }
}

async function generatePayrollsForPeriod({ payPeriodStart, payPeriodEnd, revenueAmounts = {}, dryRun = false }) {
  try {
    const start = normalizeDate(payPeriodStart, "pay_period_start")
    const end = normalizeDate(payPeriodEnd, "pay_period_end")

    if (end < start) {
      throw new AppError("pay_period_end must be after pay_period_start", 400, true)
    }

    const employees = await prisma.employee.findMany({
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
      orderBy: { id: "asc" },
    })

    const result = {
      payPeriodStart: start,
      payPeriodEnd: end,
      totalEmployees: employees.length,
      createdCount: 0,
      skippedCount: 0,
      created: [],
      skipped: [],
    }

    for (const employee of employees) {
      try {
        const revenueAmount = revenueAmounts?.[employee.id] ?? revenueAmounts?.[String(employee.id)]
        const calc = await calculatePayrollForEmployee({
          employee,
          payPeriodStart: start,
          payPeriodEnd: end,
          revenueAmount,
        })

        if (calc.amount <= 0) {
          result.skipped.push({
            employeeId: employee.id,
            paymentModel: employee.paymentModel,
            reason: "zero_amount",
            breakdown: calc.breakdown,
          })
          result.skippedCount += 1
          continue
        }

        if (dryRun) {
          result.created.push({
            employeeId: employee.id,
            paymentModel: employee.paymentModel,
            amount: calc.amount,
            breakdown: calc.breakdown,
            dryRun: true,
          })
          result.createdCount += 1
          continue
        }

        const created = await createPayrollRecord({
          employeeId: employee.id,
          amount: calc.amount,
          payPeriodStart: start,
          payPeriodEnd: end,
          breakdown: calc.breakdown,
        })

        if (created.created) {
          result.created.push(created.payroll)
          result.createdCount += 1
        } else {
          result.skipped.push({
            employeeId: employee.id,
            paymentModel: employee.paymentModel,
            reason: created.skippedReason || "skipped",
            payroll: created.payroll || null,
          })
          result.skippedCount += 1
        }
      } catch (err) {
        result.skipped.push({
          employeeId: employee.id,
          paymentModel: employee.paymentModel,
          reason: err?.message || "generation_failed",
        })
        result.skippedCount += 1
      }
    }

    return result
  } catch (err) {
    if (err instanceof AppError) throw err
    throw new AppError("Failed to generate payrolls", 500, false)
  }
}

async function listPayrolls(filter = {}) {
  try {
    const where = {}
    if (filter.employeeId !== undefined && filter.employeeId !== null && filter.employeeId !== "") {
      where.employeeId = Number(filter.employeeId)
    }
    if (filter.paymentStatus) where.paymentStatus = filter.paymentStatus
    if (filter.start && filter.end) {
      const start = normalizeDate(filter.start, "start")
      const end = normalizeDate(filter.end, "end")
      where.payPeriodStart = { gte: start }
      where.payPeriodEnd = { lte: end }
    }

    const records = await prisma.payroll.findMany({
      where,
      include: {
        employee: {
          include: {
            user: { select: { id: true, email: true, role: true } },
          },
        },
      },
      orderBy: [{ payPeriodStart: "desc" }, { createdAt: "desc" }],
    })

    return records.map(serializePayrollRecord)
  } catch (err) {
    if (err instanceof AppError) throw err
    log("error", "payroll.service listPayrolls error", { message: err?.message, stack: err?.stack })
    throw new AppError("Failed to list payrolls", 500, false)
  }
}

async function getPayrollById(id) {
  try {
    const record = await prisma.payroll.findUnique({
      where: { id },
      include: {
        employee: {
          include: {
            user: { select: { id: true, email: true, role: true } },
          },
        },
      },
    })

    return serializePayrollRecord(record)
  } catch (err) {
    if (err instanceof AppError) throw err
    log("error", "payroll.service getPayrollById error", { message: err?.message, stack: err?.stack })
    throw new AppError("Failed to fetch payroll", 500, false)
  }
}

async function updatePayrollStatus(id, status) {
  try {
    const data = { paymentStatus: status }
    if (status === "processed" || status === "paid") {
      data.processedAt = new Date()
    } else if (status === "pending") {
      data.processedAt = null
    }

    const updated = await prisma.payroll.update({
      where: { id },
      data,
      include: {
        employee: {
          include: {
            user: { select: { id: true, email: true, role: true } },
          },
        },
      },
    })

    return serializePayrollRecord(updated)
  } catch (err) {
    if (err && err.code === "P2025") throw new AppError("Payroll not found", 404, true)
    if (err instanceof AppError) throw err
    throw new AppError("Failed to update payroll", 500, false)
  }
}

module.exports = {
  calculatePayrollForEmployee,
  createPayrollRecord,
  generatePayrollsForPeriod,
  getScheduledPayrollPeriod,
  listPayrolls,
  getPayrollById,
  updatePayrollStatus,
}