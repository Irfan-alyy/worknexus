import { DollarSign, Plus } from "lucide-react"

import { AllowanceModal } from "@/features/payroll/components/allowance-modal"
import { PayrollTable } from "@/features/payroll/components/payroll-table"
import { SalaryCard } from "@/features/payroll/components/salary-card"

const payrollCards = [
  { title: "Net payroll", value: "$86,420", note: "After deductions" },
  { title: "Bonuses", value: "$12,400", note: "6 employees approved" },
  { title: "Pending review", value: "4 items", note: "Needs finance sign-off" },
]

export function PayrollPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Payroll</p>
          <h2 className="mt-1 text-2xl font-semibold">Compensation dashboard</h2>
          <p className="mt-2 text-sm text-muted-foreground">Track salary summaries, allowances, and the next payout cycle.</p>
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="h-4 w-4" />
          New allowance
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {payrollCards.map((card) => (
          <SalaryCard key={card.title} {...card} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Payroll table</p>
              <h3 className="mt-1 text-lg font-semibold">Monthly payout status</h3>
            </div>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-5 overflow-hidden rounded-2xl border border-border">
            <PayrollTable />
          </div>
        </section>

        <div className="space-y-6">
          <AllowanceModal />
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Finance note</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Keep allowance approvals and payroll reviews in this panel so finance can finalize payout without leaving the page.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}