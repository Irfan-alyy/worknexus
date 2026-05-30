import { usePmActivities, usePmActivityMetrics } from "../hooks/use-pm-activities"
import { ActivityCard } from "@/features/employee/components/activity-card"
import { ActivityMetricsCards } from "@/features/employee/components/activity-metrics"

function groupActivitiesByType(activities) {
	const grouped = {}
	activities.forEach((activity) => {
		if (!grouped[activity.type]) grouped[activity.type] = []
		grouped[activity.type].push(activity)
	})
	return grouped
}

function getActivityTypeLabel(type) {
	const labels = {
		task_assigned: "Task Assignments",
		task_status_changed: "Task Updates",
		task_due_soon: "Due Soon",
		task_completed: "Completed Tasks",
		time_log_added: "Time Logs",
		payroll_generated: "Payroll",
		payroll_status_changed: "Payroll Updates",
		project_added: "Project Memberships",
	}
	return labels[type] || type.replace(/_/g, " ")
}

export function PmActivitiesSection({ onOpenDetail }) {
	const { data: activities = [], isLoading: activitiesLoading, error: activitiesError } = usePmActivities()
	const { data: metrics, isLoading: metricsLoading } = usePmActivityMetrics()
	if (activitiesLoading) {
		return (
			<div className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">Loading activities...</div>
		)
	}

	if (activitiesError) {
		return (
			<div className="rounded-3xl border border-red-500/40 bg-red-500/5 p-5 text-sm text-red-600 shadow-sm">Failed to load PM activities</div>
		)
	}

	if (!activities || activities.length === 0) {
		return (
			<div className="rounded-3xl border border-border bg-card p-5 shadow-sm text-center">No project activities yet</div>
		)
	}

	const grouped = groupActivitiesByType(activities)
	const types = Object.keys(grouped).sort()

	return (
		<div className="space-y-6">
			<ActivityMetricsCards metrics={metrics} isLoading={metricsLoading} />

			<div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
				<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">PM Activity stream</p>
				<h2 className="mt-2 text-lg font-semibold">Recent updates across your projects</h2>
				<p className="mt-1 text-sm text-muted-foreground">Track tasks, time logs, and team changes for projects you manage.</p>
			</div>

			{types.map((type) => {
				const items = grouped[type].slice(0, 6)
				const total = grouped[type].length
				return (
					<div key={type}>
						<div className="mb-3 flex items-center justify-between">
							<h3 className="text-sm font-semibold text-foreground">
								{getActivityTypeLabel(type)}
								{total > 6 && <span className="ml-2 text-xs text-muted-foreground">({total} total)</span>}
							</h3>
						</div>
						<div className="space-y-3">
							{items.map((activity, idx) => (
								<ActivityCard key={`${type}-${idx}`} activity={activity} onOpenDetail={onOpenDetail ?? (() => {})} />
							))}
						</div>
					</div>
				)
			})}
		</div>
	)
}

export default PmActivitiesSection