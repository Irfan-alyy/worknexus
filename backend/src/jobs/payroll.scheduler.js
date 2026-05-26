const cron = require("node-cron")
const payrollService = require("../features/payroll/payroll.service")
const { getEnvConfig } = require("../config/env.config")
const { log } = require("../utils/logger")

let scheduledJob = null

// Cron expression: minute hour day-of-month month day-of-week
// By default: every Monday at 00:05 UTC
// For testing: set PAYROLL_CRON_EXPRESSION to override (e.g., "*/1 * * * *" for every minute)
function getCronExpression() {
  const envCron = process.env.PAYROLL_CRON_EXPRESSION
  if (envCron) {
    return envCron
  }
  // Default: Monday at 00:05 UTC (day-of-week 1 = Monday)
  return "5 0 * * 1"
}

async function runPayrollGenerationForCompletedTasks() {
  try {
    // Get current week period to find completed tasks
    const { start, end } = payrollService.getScheduledPayrollPeriod("weekly", new Date())

    log("info", "payroll.scheduler job running", {
      payPeriodStart: start.toISOString(),
      payPeriodEnd: end.toISOString(),
    })

    // Generate payrolls for employees with completed tasks in this period
    const result = await payrollService.generatePayrollsForPeriod({
      payPeriodStart: start,
      payPeriodEnd: end,
    })

    log("info", "payroll.scheduler job completed", {
      payPeriodStart: start.toISOString(),
      payPeriodEnd: end.toISOString(),
      createdCount: result.createdCount,
      skippedCount: result.skippedCount,
    })

    return result
  } catch (err) {
    log("error", "payroll.scheduler job error", { message: err?.message, stack: err?.stack })
    throw err
  }
}

function startPayrollScheduler() {
  const { payrollSchedulerEnabled } = getEnvConfig()

  if (!payrollSchedulerEnabled) {
    log("info", "payroll.scheduler disabled")
    return null
  }

  if (scheduledJob) {
    log("info", "payroll.scheduler already started")
    return scheduledJob
  }

  const cronExpr = getCronExpression()

  log("info", "payroll.scheduler starting", {
    cronExpression: cronExpr,
  })

  scheduledJob = cron.schedule(
    cronExpr,
    async () => {
      try {
        await runPayrollGenerationForCompletedTasks()
      } catch (err) {
        // Error already logged in runPayrollGenerationForCompletedTasks
      }
    },
    {
      scheduled: true,
      timezone: "UTC",
    }
  )

  return scheduledJob
}

function stopPayrollScheduler() {
  if (scheduledJob) {
    try {
      scheduledJob.stop()
    } catch (e) {
      // ignore
    }
    scheduledJob = null
    log("info", "payroll.scheduler stopped")
  }
}

module.exports = {
  startPayrollScheduler,
  stopPayrollScheduler,
  runPayrollGenerationForCompletedTasks,
}
