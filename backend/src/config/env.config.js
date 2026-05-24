function getEnvConfig() {
  const port = Number(process.env.PORT || 3000)
  const payrollScheduleHour = Number(process.env.PAYROLL_SCHEDULE_HOUR ?? 0)
  const payrollScheduleMinute = Number(process.env.PAYROLL_SCHEDULE_MINUTE ?? 5)
  const payrollTestIntervalMinutes = Number(process.env.PAYROLL_TEST_INTERVAL_MINUTES ?? 0)

  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number.isFinite(port) ? port : 3000,
    databaseUrl: process.env.DATABASE_URL || "",
    jwtSecret: process.env.JWT_SECRET || "",
    payrollSchedulerEnabled: String(process.env.PAYROLL_SCHEDULER_ENABLED ?? "true") !== "false",
    payrollScheduleMode: process.env.PAYROLL_SCHEDULE_MODE || "weekly",
    payrollScheduleHour: Number.isFinite(payrollScheduleHour) ? payrollScheduleHour : 0,
    payrollScheduleMinute: Number.isFinite(payrollScheduleMinute) ? payrollScheduleMinute : 5,
    payrollTestIntervalMinutes:
      Number.isFinite(payrollTestIntervalMinutes) && payrollTestIntervalMinutes > 0
        ? payrollTestIntervalMinutes
        : 0,
  }
}

module.exports = {
  getEnvConfig,
}