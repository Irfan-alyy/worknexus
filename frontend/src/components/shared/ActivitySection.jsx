import { ActivityCard } from "./ActivityCard"

const ACTIVITY_TYPE_LABELS = {
	employee_created: "New Employees",
	employee_updated: "Employee Updates",
	payroll_generated: "Payroll Generated",
	payroll_status_changed: "Payroll Status Changes",
	department_created: "New Departments",
	project_created: "New Projects",
	project_updated: "Project Updates",
	task_assigned: "Task Assignments",
	task_completed: "Completed Tasks",
	task_due_soon: "Due Soon",
	time_log_added: "Time Logs",
	time_logs_summary: "Time Logs Summary",
	client_created: "New Clients",
	user_created: "New Users/Managers",
	admin_summary: "Company Overview",
}

/**
 * ActivitySection - Display activities grouped by type
 * @param {Object} props
 * @param {string} props.type - Activity type
 * @param {Array} props.activities - Activities of this type (should be pre-sorted by timestamp, newest first)
 * @param {Function} props.onActivityClick - Callback when activity card is clicked
 * @param {Object} props.selectedActivity - Currently selected activity
 */
export function ActivitySection({ type, activities, onActivityClick, selectedActivity }) {
	if (!activities || activities.length === 0) {
		return null
	}

	const label = ACTIVITY_TYPE_LABELS[type] || type.replace(/_/g, " ")
	const count = activities.length

	return (
		<div className="space-y-3">
			{/* Section Header */}
			<div className="flex items-center justify-between px-1">
				<h3 className="text-sm font-semibold capitalize">{label}</h3>
				<span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-muted-foreground">
					{count} {count === 1 ? "item" : "items"}
				</span>
			</div>

			{/* Activity Cards */}
			<div className="space-y-2">
				{activities.map((activity) => (
					<ActivityCard
						key={`${activity.type}_${activity.timestamp}`}
						activity={activity}
						onClick={() => onActivityClick(activity)}
						isSelected={selectedActivity?.timestamp === activity.timestamp && selectedActivity?.type === activity.type}
					/>
				))}
			</div>
		</div>
	)
}

export default ActivitySection
