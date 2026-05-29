import { useEffect, useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { BadgeDollarSign, CircleDollarSign, Filter, Loader2, RefreshCw, Search, Sparkles, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useGlobalStore } from "@/stores/use-global-store"
import { queryKeys } from "@/config/query-keys"
import { hrApi } from "@/features/hr-management/services/hr-api"

import { PayrollTable } from "@/features/payroll/components/payroll-table"
import { SalaryCard } from "@/features/payroll/components/salary-card"
import { useCalculatePayrollMutation, usePayrollsQuery, useUpdatePayrollStatusMutation } from "@/features/payroll"

const defaultFilterForm = {
  employeeId: "",
  paymentStatus: "",
  start: "",
  end: "",
}

function getCurrentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    start: formatDateInput(start),
    end: formatDateInput(end),
  }
}

function formatDateInput(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatCurrency(value) {
  const amount = Number(value ?? 0)

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isNaN(amount) ? 0 : amount)
}

function formatDate(value) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function formatPaymentLabel(status) {
  if (!status) return "Unknown"
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function formatModelLabel(model) {
  if (!model) return 
  return model
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function buildPayrollQueryParams(form) {
  const params = {}

  if (form.employeeId.trim()) params.employeeId = Number(form.employeeId)
  if (form.paymentStatus) params.paymentStatus = form.paymentStatus
  if (form.start) params.start = `${form.start}T00:00:00Z`
  if (form.end) params.end = `${form.end}T23:59:59Z`

  return params
}

export function PayrollPage() {
  const { user, role } = useGlobalStore()
  const [filterForm, setFilterForm] = useState(defaultFilterForm)
  const [appliedFilters, setAppliedFilters] = useState({})
  
  const employeesQuery = useQuery({
    queryKey: queryKeys.hr.employees(),
    queryFn: () => hrApi.listEmployees(),
  })
  
  const employees = useMemo(() => {
    const list = Array.isArray(employeesQuery.data?.data) ? [...employeesQuery.data.data] : []
    return list.sort((a, b) => {
      const nameA = [a?.firstName?.trim(), a?.lastName?.trim()].filter(Boolean).join(" ").toLowerCase()
      const nameB = [b?.firstName?.trim(), b?.lastName?.trim()].filter(Boolean).join(" ").toLowerCase()
      return nameA.localeCompare(nameB)
    })
  }, [employeesQuery.data?.data])
  
  const [generationForm, setGenerationForm] = useState(() => {
    const currentMonth = getCurrentMonthRange()

    return {
      employeeId: "",
      payPeriodStart: currentMonth.start,
      payPeriodEnd: currentMonth.end,
      revenueAmount: "",
      createRecord: true,
    }
  })

   const selectedEmployeePaymentModel = useMemo(() => {
    if (!generationForm.employeeId) return null
    const selected = employees.find((emp) => String(emp?.id) === String(generationForm.employeeId))
    return selected?.paymentModel ?? null
  }, [generationForm.employeeId, employees])
  

  const [generationResult, setGenerationResult] = useState(null)
  const [statusMessage, setStatusMessage] = useState("")

  const payrollsQuery = usePayrollsQuery(appliedFilters)
  const calculatePayrollMutation = useCalculatePayrollMutation({
    onSuccess: (response) => {
      setGenerationResult(response?.data ?? null)
      setStatusMessage(response?.message || (response?.data?.skippedReason ? "Payroll amount is zero, record not created." : response?.data?.id ? "Payroll created successfully." : "Payroll calculation completed."))
    },
  })
  const updatePayrollStatusMutation = useUpdatePayrollStatusMutation({
    onSuccess: (_, variables) => {
      const nextStatus = variables?.paymentStatus
      setStatusMessage(`Payroll status updated to ${formatPaymentLabel(nextStatus).toLowerCase()}.`)
    },
  })

  const payrolls = useMemo(() => {
    const entries = Array.isArray(payrollsQuery.data?.data) ? [...payrollsQuery.data.data] : []

    return entries
      .sort((left, right) => {
        const leftTime = new Date(left?.payPeriodEnd || left?.createdAt || 0).getTime()
        const rightTime = new Date(right?.payPeriodEnd || right?.createdAt || 0).getTime()
        return rightTime - leftTime
      })
      .map((record) => {
        const employee = record?.employee ?? {}
        const employeeName = [employee?.firstName?.trim(), employee?.lastName?.trim()].filter(Boolean).join(" ") || employee?.user?.email || `Employee #${record?.employeeId ?? "N/A"}`

        return {
          ...record,
          employeeName,
          employeeEmail: employee?.user?.email || "",
          paymentModelLabel: formatModelLabel(employee?.paymentModel),
          payPeriodLabel: `${formatDate(record?.payPeriodStart)} – ${formatDate(record?.payPeriodEnd)}`,
        }
      })
  }, [payrollsQuery.data?.data])

  const summary = useMemo(() => {
    const base = {
      count: payrolls.length,
      totalAmount: 0,
      pendingCount: 0,
      processedCount: 0,
      paidCount: 0,
      hourlyCount: 0,
      fixedCount: 0,
      revenueShareCount: 0,
    }

    for (const payroll of payrolls) {
      base.totalAmount += Number(payroll?.amount || 0)
      if (payroll?.paymentStatus === "pending") base.pendingCount += 1
      if (payroll?.paymentStatus === "processed") base.processedCount += 1
      if (payroll?.paymentStatus === "paid") base.paidCount += 1

      if (payroll?.employee?.paymentModel === "hourly") base.hourlyCount += 1
      if (payroll?.employee?.paymentModel === "fixed") base.fixedCount += 1
      if (payroll?.employee?.paymentModel === "revenue_share") base.revenueShareCount += 1
    }

    base.settledCount = base.processedCount + base.paidCount
    base.averageAmount = base.count ? base.totalAmount / base.count : 0

    return base
  }, [payrolls])

  const payrollCards = [
    { title: "Total payrolls", value: summary.count.toString(), note: "Records returned by the payroll API" },
    { title: "Gross amount", value: formatCurrency(summary.totalAmount), note: `Average ${formatCurrency(summary.averageAmount)}` },
    { title: "Pending payouts", value: summary.pendingCount.toString(), note: "Awaiting finance review" },
    { title: "Settled payouts", value: summary.settledCount.toString(), note: "Processed or already paid" },
  ]

  const canManagePayroll = role === "admin" || role === "hr"
  const payrollStatusBreakdown = [
    { label: "Pending", value: summary.pendingCount, tone: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" },
    { label: "Processed", value: summary.processedCount, tone: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300" },
    { label: "Paid", value: summary.paidCount, tone: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" },
  ]
  const payrollModelBreakdown = [
    { label: "Hourly", value: summary.hourlyCount },
    { label: "Fixed", value: summary.fixedCount },
    { label: "Revenue share", value: summary.revenueShareCount },
  ]

  useEffect(() => {
    if (!statusMessage) return
    const timer = window.setTimeout(() => setStatusMessage(""), 5000)
    return () => window.clearTimeout(timer)
  }, [statusMessage])

  function handleFilterChange(field, value) {
    setFilterForm((current) => ({ ...current, [field]: value }))
  }

  function handleFilterSubmit(event) {
    event.preventDefault()
    setAppliedFilters(buildPayrollQueryParams(filterForm))
  }

  function handleFilterReset() {
    setFilterForm(defaultFilterForm)
    setAppliedFilters({})
  }

  function handleGenerationChange(field, value) {
    setGenerationForm((current) => ({ ...current, [field]: value }))
  }

  async function handleGeneratePayroll(event) {
    event.preventDefault()
    setStatusMessage("")
    setGenerationResult(null)

    const employeeId = Number(generationForm.employeeId)
    if (!employeeId || employeeId <= 0) {
      setStatusMessage("Select an employee.")
      return
    }

    if (!generationForm.payPeriodStart || !generationForm.payPeriodEnd) {
      setStatusMessage("Select a valid pay period range.")
      return
    }

    const payload = {
      employee_id: employeeId,
      pay_period_start: `${generationForm.payPeriodStart}T00:00:00Z`,
      pay_period_end: `${generationForm.payPeriodEnd}T23:59:59Z`,
      create_record: generationForm.createRecord,
    }

    // Only include revenue_amount for revenue_share payment models
    if (selectedEmployeePaymentModel === "revenue_share" && generationForm.revenueAmount.trim() !== "") {
      payload.revenue_amount = Number(generationForm.revenueAmount)
    }

    try {
      await calculatePayrollMutation.mutateAsync(payload)
      await payrollsQuery.refetch()
    } catch (error) {
      setStatusMessage(error?.response?.data?.message || error?.message || "Unable to calculate payroll.")
    }
  }

  async function handleStatusChange(payrollId, paymentStatus) {
    try {
      await updatePayrollStatusMutation.mutateAsync({ payrollId, paymentStatus })
      await payrollsQuery.refetch()
    } catch (error) {
      setStatusMessage(error?.response?.data?.message || error?.message || "Unable to update payroll status.")
    }
  }

  const statusDraftId = updatePayrollStatusMutation.variables?.payrollId ?? null

  return (
    <div className="h-full overflow-auto p-6 min-w-0">
      <header className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <CircleDollarSign className="h-4 w-4" />
            Payroll dashboard
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Payroll overview and generation</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Live payroll records are loaded from the backend, including period, amount, payment status, and employee details.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Signed in as {user?.name || "Guest"} · {String(role || "employee").toUpperCase()}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => payrollsQuery.refetch()}
            disabled={payrollsQuery.isFetching}
          >
            {payrollsQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <TrendingUp className="h-4 w-4" />
            Back to top
          </Button>
        </div>
      </header>

      {statusMessage ? (
        <div className="mt-4 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
          {statusMessage}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {payrollCards.map((card) => (
          <SalaryCard key={card.title} {...card} />
        ))}
      </div>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 min-w-0">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Filters</p>
                <h3 className="mt-1 text-lg font-semibold">Refine payroll records</h3>
              </div>
              <Filter className="h-5 w-5 text-muted-foreground" />
            </div>

            <form className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={handleFilterSubmit}>
              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Employee</span>
                <select
                  value={filterForm.employeeId}
                  onChange={(event) => handleFilterChange("employeeId", event.target.value)}
                  disabled={employeesQuery.isLoading}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-ring disabled:opacity-60"
                >
                  <option value="">All employees</option>
                  {employees.map((emp) => {
                    const displayName = [emp?.firstName?.trim(), emp?.lastName?.trim()].filter(Boolean).join(" ") || emp?.user?.email || `Employee #${emp?.id}`
                    return (
                      <option key={emp.id} value={emp.id}>
                        {displayName}
                      </option>
                    )
                  })}
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Payment status</span>
                <select
                  value={filterForm.paymentStatus}
                  onChange={(event) => handleFilterChange("paymentStatus", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-ring"
                >
                  <option value="">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processed">Processed</option>
                  <option value="paid">Paid</option>
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Start date</span>
                <input
                  type="date"
                  value={filterForm.start}
                  onChange={(event) => handleFilterChange("start", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-ring"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">End date</span>
                <input
                  type="date"
                  value={filterForm.end}
                  onChange={(event) => handleFilterChange("end", event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-ring"
                />
              </label>

              <div className="flex flex-wrap items-center gap-3 md:col-span-2 xl:col-span-4">
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4" />
                  Apply filters
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleFilterReset}>
                  Reset
                </Button>
              </div>
            </form>
          </div>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Payroll records</p>
                <h3 className="mt-1 text-lg font-semibold">Backend payroll list</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {payrollStatusBreakdown.map((item) => (
                  <span key={item.label} className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${item.tone}`}>
                    {item.label} <span className="rounded-full bg-background/60 px-2 py-0.5 text-[11px]">{item.value}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
              <PayrollTable
                rows={payrolls}
                loading={payrollsQuery.isLoading || payrollsQuery.isFetching}
                errorMessage={payrollsQuery.isError ? payrollsQuery.error?.response?.data?.message || payrollsQuery.error?.message || "Unable to load payroll records." : ""}
                emptyMessage="No payroll records were returned for these filters."
                canManageStatus={canManagePayroll}
                onStatusChange={handleStatusChange}
                updatingPayrollId={statusDraftId}
              />
            </div>
          </section>
        </div>

        <div className="space-y-6 min-w-0">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Payroll generation</p>
                <h3 className="mt-1 text-lg font-semibold">Calculate or create a record</h3>
              </div>
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleGeneratePayroll}>
              <label className="space-y-2 text-sm">
                <span className="text-muted-foreground">Employee</span>
                <select
                  value={generationForm.employeeId}
                  onChange={(event) => handleGenerationChange("employeeId", event.target.value)}
                  disabled={employeesQuery.isLoading}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-ring disabled:opacity-60"
                >
                  <option value="">Select an employee</option>
                  {employees.map((emp) => {
                    const displayName = [emp?.firstName?.trim(), emp?.lastName?.trim()].filter(Boolean).join(" ") || emp?.user?.email || `Employee #${emp?.id}`
                    return (
                      <option key={emp.id} value={emp.id}>
                        {displayName}
                      </option>
                    )
                  })}
                </select>
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground">Pay period start</span>
                  <input
                    type="date"
                    value={generationForm.payPeriodStart}
                    onChange={(event) => handleGenerationChange("payPeriodStart", event.target.value)}
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-ring"
                  />
                </label>

                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground">Pay period end</span>
                  <input
                    type="date"
                    value={generationForm.payPeriodEnd}
                    onChange={(event) => handleGenerationChange("payPeriodEnd", event.target.value)}
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-ring"
                  />
                </label>
              </div>

              {selectedEmployeePaymentModel === "revenue_share" ? (
                <label className="space-y-2 text-sm">
                  <span className="text-muted-foreground">Revenue amount</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={generationForm.revenueAmount}
                    onChange={(event) => handleGenerationChange("revenueAmount", event.target.value)}
                    placeholder="Enter total revenue for this period"
                    className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-ring"
                  />
                </label>
              ) : null}

              <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={generationForm.createRecord}
                  onChange={(event) => handleGenerationChange("createRecord", event.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span>
                  Create payroll record after calculation
                  <span className="block text-xs text-muted-foreground">If the amount is zero, the backend skips record creation.</span>
                </span>
              </label>

              <Button type="submit" className="w-full" disabled={calculatePayrollMutation.isPending}>
                {calculatePayrollMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeDollarSign className="h-4 w-4" />}
                {generationForm.createRecord ? "Create payroll" : "Preview calculation"}
              </Button>
            </form>

            {generationResult ? (
              <div className="mt-5 rounded-2xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Latest result</p>
                <div className="mt-3 space-y-2 text-sm">
                  {generationResult.id ? (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Payroll ID</span>
                      <span className="font-medium break-all">{generationResult.id}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Employee</span>
                    <span className="font-medium">#{generationResult.employeeId}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">{formatCurrency(generationResult.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Payment model</span>
                    <span className="font-medium">{formatModelLabel(selectedEmployeePaymentModel || generationResult.paymentModel)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Pay period</span>
                    <span className="font-medium text-right">{formatDate(generationResult.payPeriodStart)} – {formatDate(generationResult.payPeriodEnd)}</span>
                  </div>
                  {generationResult.paymentStatus ? (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium capitalize">{generationResult.paymentStatus}</span>
                    </div>
                  ) : null}
                  {generationResult.skippedReason ? (
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Skipped</span>
                      <span className="font-medium capitalize">{generationResult.skippedReason.replaceAll("_", " ")}</span>
                    </div>
                  ) : null}
                </div>

                {generationResult.breakdown ? (
                  <div className="mt-4 rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                    {typeof generationResult.breakdown.completedTaskCount === "number" ? <div>Completed tasks: {generationResult.breakdown.completedTaskCount}</div> : null}
                    {typeof generationResult.breakdown.totalHours === "number" ? <div>Total hours: {generationResult.breakdown.totalHours}</div> : null}
                    {typeof generationResult.breakdown.hourlyRate === "number" ? <div>Hourly rate: {formatCurrency(generationResult.breakdown.hourlyRate)}</div> : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Payroll states</p>
            <div className="mt-4 space-y-3">
              {payrollStatusBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl bg-background px-4 py-3 text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Payment models</p>
            <div className="mt-4 space-y-3">
              {payrollModelBreakdown.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl bg-background px-4 py-3 text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

export default PayrollPage