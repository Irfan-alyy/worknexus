import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"
import { OnboardingWizard } from "@/features/hr-management/components/onboarding-wizard"
import HRActivities from "./hr-activities"
import AdminDepartments from "@/features/admin/AdminDepartments"

const checklist = [
  "Contract uploaded",
  "Workspace account created",
  "Payroll profile prepared",
  "Policies acknowledged",
]

export function HrPage() {
  const [activeTab, setActiveTab] = useState("onboarding")
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const path = location.pathname.replace(/\/+$/, "")
    if (path.endsWith("/activities")) {
      setActiveTab("activities")
    } else if (path.endsWith("/departments")) {
      setActiveTab("departments")
    } else {
      setActiveTab("onboarding")
    }
  }, [location.pathname])

  const tabs = {
    activities: "Activities",
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      {/* <div className="mb-4 flex flex-wrap gap-2 rounded-3xl border border-border bg-card p-2 shadow-sm sm:mb-6"> */}
        {/* {Object.entries(tabs).map(([key, label]) => {
          const isActive = activeTab === key

          return (
            <button
              key={key}
              type="button"
              onClick={() => navigate(key === "onboarding" ? "/hr" : key === "departments" ? "/hr/departments" : "/hr/activities")}
              className={`rounded-2xl px-4 py-2 text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
            >
              {label}
            </button>
          )
        })} */}
      {/* </div> */}

      {/* Conditional Rendering Based on Tab */}
      {activeTab === "onboarding" ? (
        <>
          <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">HR onboarding</p>
            <h2 className="mt-1 text-2xl font-semibold">New hire setup</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Use the onboarding wizard to coordinate setup tasks, approvals, and first-day readiness.
            </p>
          </div>

          <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <OnboardingWizard />

            <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
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
        </>
      ) : activeTab === "activities" ? (
        <div className="space-y-6">
          <HRActivities />
        </div>
      ) : activeTab === "departments" ? (
        <div className="space-y-6">
          <AdminDepartments />
        </div>
      ) : null}
    </div>
  )
}