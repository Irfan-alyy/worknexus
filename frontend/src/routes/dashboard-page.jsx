import { useGlobalStore } from "@/stores/use-global-store"
import { roleDefinitions } from "@/config/constants"
import { DashboardActivityFeed } from "@/components/shared/dashboard-activity-feed"
import { DashboardHero } from "@/components/shared/dashboard-hero"
import { DashboardMetricGrid } from "@/components/shared/dashboard-metric-grid"
import { DashboardRolePanel } from "@/components/shared/dashboard-role-panel"
import { RoleGuideFlow } from "@/components/shared/role-guide-flow"

export function DashboardPage() {
  const { role, user } = useGlobalStore()
  const roleConfig = roleDefinitions[role] ?? roleDefinitions.employee

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6">
      <div className="space-y-6 flex flex-col">
        <DashboardHero
          roleLabel={roleConfig.label}
          title={roleConfig.dashboardTitle}
          description={`${roleConfig.dashboardDescription} Signed in as ${user.name || "Guest User"}.`}
        />
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <RoleGuideFlow tabs={roleConfig.guideTabs} roleLabel={roleConfig.label} />
        </section>
        <DashboardMetricGrid items={roleConfig.stats} />

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Workspace priority</p>
              <h2 className="mt-1 text-lg font-semibold">What this role should focus on</h2>
            </div>
            <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-foreground">
              Responsive
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-4">
            {roleConfig.quickActions.map((action) => (
              <article key={action} className="rounded-2xl border border-border bg-background p-4">
                <p className="text-sm font-medium">{action}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This section can later plug into backend data for the {roleConfig.shortLabel} role.
                </p>
              </article>
            ))}
          </div>
        </section>

        <DashboardActivityFeed items={roleConfig.activity} />
        <DashboardRolePanel focusPoints={roleConfig.focusPoints} quickActions={roleConfig.quickActions} />
      </div>
    </div>
  )
}