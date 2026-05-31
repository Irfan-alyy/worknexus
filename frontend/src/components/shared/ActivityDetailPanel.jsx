import { formatRelativeTime } from "@/lib/date-utils"

const ACTIVITY_ICONS = {
	employee_created: "👤",
	employee_updated: "✏️",
	payroll_generated: "💰",
	payroll_status_changed: "📊",
	department_created: "🏢",
	project_created: "📋",
	project_updated: "🔄",
	task_assigned: "✓",
	task_completed: "🎯",
	task_due_soon: "⏰",
	time_log_added: "⏱️",
	time_logs_summary: "📈",
	client_created: "🤝",
	user_created: "👨‍💼",
	admin_summary: "📊",
}

/**
 * ActivityDetailPanel - Display detailed information about an activity
 * @param {Object} props
 * @param {Object} props.activity - Activity object with all details
 */
export function ActivityDetailPanel({ activity }) {
	const icon = ACTIVITY_ICONS[activity.type] || "•"

	if (!activity) {
		return (
			<div className="flex items-center justify-center p-6">
				<p className="text-muted-foreground">No activity selected</p>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="space-y-2">
				<div className="flex items-center gap-2">
					<span className="text-2xl">{icon}</span>
					<div>
						<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
							{activity.type?.replace(/_/g, " ")}
						</p>
						<h2 className="text-lg font-semibold">{activity.title}</h2>
					</div>
				</div>
				<p className="text-sm text-muted-foreground">
					{formatRelativeTime(activity.timestamp)}
				</p>
			</div>

			{/* Description */}
			{activity.description && (
				<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
					<p className="text-sm font-medium">Description</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						{activity.description}
					</p>
				</section>
			)}

			{/* Source & Type Info */}
			<section className="grid grid-cols-2 gap-3">
				{activity.source && (
					<div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Source</p>
						<p className="mt-1 font-medium capitalize">{activity.source}</p>
					</div>
				)}
				{activity.timestamp && (
					<div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Date</p>
						<p className="mt-1 font-medium text-sm">
							{new Date(activity.timestamp).toLocaleDateString()}
						</p>
					</div>
				)}
			</section>

			{/* Metadata / Details */}
			{activity.metadata && Object.keys(activity.metadata).length > 0 && (
				<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
					<p className="text-sm font-medium">Details</p>
					<div className="mt-3 space-y-2">
						{Object.entries(activity.metadata).map(([key, value]) => {
							if (value === null || value === undefined) return null
							return (
								<div key={key} className="rounded-xl border border-border bg-background px-3 py-2">
									<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
										{key.replace(/_/g, " ")}
									</p>
									<p className="mt-1 break-words text-sm font-medium">
										{Array.isArray(value) ? value.join(", ") : String(value)}
									</p>
								</div>
							)
						})}
					</div>
				</section>
			)}

			{/* Additional Fields */}
			{(activity.priority || activity.status || activity.amount || activity.hours) && (
				<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
					<p className="text-sm font-medium">Additional Info</p>
					<div className="mt-3 grid grid-cols-2 gap-2">
						{activity.priority && (
							<div>
								<p className="text-xs font-medium text-muted-foreground">Priority</p>
								<p className="mt-1 text-sm font-medium capitalize">{activity.priority}</p>
							</div>
						)}
						{activity.status && (
							<div>
								<p className="text-xs font-medium text-muted-foreground">Status</p>
								<p className="mt-1 text-sm font-medium capitalize">{activity.status}</p>
							</div>
						)}
						{activity.amount && (
							<div>
								<p className="text-xs font-medium text-muted-foreground">Amount</p>
								<p className="mt-1 text-sm font-medium">${Number(activity.amount).toFixed(2)}</p>
							</div>
						)}
						{activity.hours && (
							<div>
								<p className="text-xs font-medium text-muted-foreground">Hours</p>
								<p className="mt-1 text-sm font-medium">{Number(activity.hours).toFixed(2)}h</p>
							</div>
						)}
					</div>
				</section>
			)}
		</div>
	)
}

export default ActivityDetailPanel
