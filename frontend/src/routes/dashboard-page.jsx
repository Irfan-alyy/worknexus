import { useGlobalStore } from "@/stores/use-global-store"
import { roleDefinitions } from "@/config/constants"
import { DashboardActivityFeed } from "@/components/shared/dashboard-activity-feed"
import { DashboardHero } from "@/components/shared/dashboard-hero"
import { DashboardMetricGrid } from "@/components/shared/dashboard-metric-grid"
import { DashboardRolePanel } from "@/components/shared/dashboard-role-panel"
import { RoleGuideFlow } from "@/components/shared/role-guide-flow"
import { Loader2 } from "lucide-react"

// Import hooks for fetching real data
import { useAdminActivities, useAdminActivityMetrics } from "@/features/admin/hooks/useAdminActivities"
import { useHRActivities, useHRActivityMetrics } from "@/features/hr-management/hooks/useHRActivities"
import { usePmActivities, usePmActivityMetrics } from "@/features/pm/hooks/use-pm-activities"
import { useEmployeeActivities, useEmployeeActivityMetrics } from "@/features/employee/hooks/use-employee-activities"

// Import transform utilities
import {
	transformMetricsToGrid,
	transformActivitiesToFeed,
	getFallbackDashboardData,
} from "@/lib/dashboard-transform"
import { useQuery } from "@tanstack/react-query"
import { usersApi } from "@/features/users/services/users-api"

export function DashboardPage() {
	const { role, user } = useGlobalStore()
	const roleConfig = roleDefinitions[role] ?? roleDefinitions.employee

	// Fetch data based on role
	let metricsQuery, activitiesQuery

	if (role === "admin") {
		metricsQuery = useAdminActivityMetrics()
		activitiesQuery = useAdminActivities()
	} else if (role === "hr") {
		metricsQuery = useHRActivityMetrics()
		activitiesQuery = useHRActivities()
	} else if (role === "pm") {
		metricsQuery = usePmActivityMetrics()
		activitiesQuery = usePmActivities()
	} else if (role === "employee") {
		// For employee, fetch the full user record to obtain employee id, then fetch employee metrics
		const currentUserId = user?.id ?? null
		const userQuery = useQuery({
			queryKey: ["users", "detail", currentUserId ?? "me"],
			queryFn: () => usersApi.getUser(currentUserId ?? "me"),
			enabled: !!currentUserId,
		})
		const employeeId = userQuery.data?.data?.employee?.id
		metricsQuery = useEmployeeActivityMetrics(employeeId, { enabled: !!employeeId })
		activitiesQuery = useEmployeeActivities(employeeId, { enabled: !!employeeId })
	} else {
		metricsQuery = { data: {}, isLoading: false, error: null }
		activitiesQuery = { data: [], isLoading: false, error: null }
	}

	// Transform data
//   console.log("Metrics:", metricsQuery.data, role)
	const metrics = transformMetricsToGrid(metricsQuery.data, role)
	const activities = transformActivitiesToFeed(activitiesQuery.data)
	// Get fallback data
	const fallback = getFallbackDashboardData(role)
	const displayMetrics = metrics.length > 0 ? metrics : fallback.mockMetrics
	const displayActivities = activities.length > 0 ? activities : fallback.mockActivities
	// Determine loading state
	const isLoading = metricsQuery.isLoading || activitiesQuery.isLoading
	const hasError = metricsQuery.error || activitiesQuery.error

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

				{/* Metrics Section */}
				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : hasError ? (
					<div className="rounded-3xl border border-border bg-card p-6">
						<p className="text-sm text-muted-foreground">
							Unable to load live metrics. Showing latest data.
						</p>
					</div>
				) : null}

				<DashboardMetricGrid items={displayMetrics} />

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
									Streamlined workflow for {roleConfig.shortLabel} operations.
								</p>
							</article>
						))}
					</div>
				</section>

				<DashboardActivityFeed items={displayActivities} />
				<DashboardRolePanel focusPoints={roleConfig.focusPoints} quickActions={roleConfig.quickActions} />
			</div>
		</div>
	)
}