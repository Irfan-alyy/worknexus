import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { useGlobalStore } from "@/stores/use-global-store"
import { usersApi } from "@/features/users/services/users-api"
import { useEmployeeActivities, useEmployeeActivityMetrics } from "../hooks/use-employee-activities"
import { ActivityCard } from "./activity-card"
import { ActivityMetricsCards } from "./activity-metrics"

function groupActivitiesByType(activities) {
	const grouped = {}

	activities.forEach((activity) => {
		if (!grouped[activity.type]) {
			grouped[activity.type] = []
		}
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

export function EmployeeActivitiesSection({ onOpenDetail }) {
	const { user } = useGlobalStore()
	const currentUserId = user?.id ?? null

	const userQuery = useQuery({
		queryKey: queryKeys.users.detail(currentUserId ?? "me"),
		queryFn: () => usersApi.getUser(currentUserId),
		enabled: Boolean(currentUserId),
	})

	const profileUser = userQuery.data?.data ?? null
	const employeeId = profileUser?.employee?.id ?? null

	const { data: activities = [], isLoading: activitiesLoading, error: activitiesError } = useEmployeeActivities(employeeId)
	const { data: metrics, isLoading: metricsLoading } = useEmployeeActivityMetrics(employeeId)

	if (!currentUserId || userQuery.isLoading) {
		return (
			<div className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
				Loading profile data...
			</div>
		)
	}

	if (userQuery.error) {
		return (
			<div className="rounded-3xl border border-red-500/40 bg-red-500/5 p-5 text-sm text-red-600 shadow-sm">
				Failed to load user profile.
			</div>
		)
	}

	if (!employeeId) {
		return (
			<div className="rounded-3xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-sm">
				Unable to resolve employee profile for this session.
			</div>
		)
	}

	const groupedActivities = groupActivitiesByType(activities)
	const activityTypes = Object.keys(groupedActivities).sort()

	return (
		<div className="space-y-6">
			{/* Metrics Cards */}
			<ActivityMetricsCards metrics={metrics} isLoading={metricsLoading} />

			{/* Header */}
			<div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
				<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Activity stream</p>
				<h2 className="mt-2 text-lg font-semibold">Everything related to your work updates</h2>
				<p className="mt-1 text-sm text-muted-foreground">Track assignments, time logs, payroll, and project changes in one feed.</p>
			</div>

			{/* Activities by Type */}
			{activitiesLoading ? (
				<div className="space-y-3">
					{[1, 2, 3].map((i) => (
						<div key={i} className="h-24 animate-pulse rounded-3xl border border-border bg-card" />
					))}
				</div>
			) : activitiesError ? (
				<div className="rounded-3xl border border-red-500/40 bg-red-500/5 p-5 shadow-sm">
					<p className="text-sm font-medium text-red-600">Failed to load activities</p>
					<p className="mt-1 text-sm text-red-500/70">{activitiesError.message}</p>
				</div>
			) : activities.length === 0 ? (
				<div className="rounded-3xl border border-border bg-card p-5 shadow-sm text-center">
					<p className="text-muted-foreground">No activities yet</p>
				</div>
			) : (
				<div className="space-y-6">
					{activityTypes.map((type) => {
						const typeActivities = groupedActivities[type].slice(0, 5) // Show max 5 per type
						const totalCount = groupedActivities[type].length

						return (
							<div key={type}>
								<div className="mb-3 flex items-center justify-between">
									<h3 className="text-sm font-semibold text-foreground">
										{getActivityTypeLabel(type)}
										{totalCount > 5 && <span className="ml-2 text-xs text-muted-foreground">({totalCount} total)</span>}
									</h3>
								</div>
								<div className="space-y-3">
									{typeActivities.map((activity, idx) => (
										<ActivityCard
											key={`${type}-${idx}`}
											activity={activity}
											onOpenDetail={onOpenDetail}
										/>
									))}
								</div>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}
