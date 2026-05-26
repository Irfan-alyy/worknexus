import { CheckCircle2 } from "lucide-react"

import { OnboardingWizard } from "@/features/hr-management/components/onboarding-wizard"

const checklist = [
  "Contract uploaded",
  "Workspace account created",
  "Payroll profile prepared",
  "Policies acknowledged",
]

export function HrPage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">HR onboarding</p>
        <h2 className="mt-1 text-2xl font-semibold">New hire setup</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Use the onboarding wizard to coordinate setup tasks, approvals, and first-day readiness.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <OnboardingWizard />

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <h3 className="text-lg font-semibold">Readiness checklist</h3>
          </div>
          <div className="mt-5 space-y-3">
            {checklist.map((item) => (
              <div key={item} className="flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3 text-sm">
                <span>{item}</span>
                <span className="text-xs font-medium text-muted-foreground">Done</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}