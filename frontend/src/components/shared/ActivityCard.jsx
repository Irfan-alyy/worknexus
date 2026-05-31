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

const ACTIVITY_COLORS = {
	employee_created: "bg-blue-500/10 text-blue-700",
	employee_updated: "bg-blue-500/10 text-blue-700",
	payroll_generated: "bg-green-500/10 text-green-700",
	payroll_status_changed: "bg-green-500/10 text-green-700",
	department_created: "bg-purple-500/10 text-purple-700",
	project_created: "bg-indigo-500/10 text-indigo-700",
	project_updated: "bg-indigo-500/10 text-indigo-700",
	task_assigned: "bg-orange-500/10 text-orange-700",
	task_completed: "bg-emerald-500/10 text-emerald-700",
	task_due_soon: "bg-yellow-500/10 text-yellow-700",
	time_log_added: "bg-cyan-500/10 text-cyan-700",
	time_logs_summary: "bg-cyan-500/10 text-cyan-700",
	client_created: "bg-pink-500/10 text-pink-700",
	user_created: "bg-fuchsia-500/10 text-fuchsia-700",
	admin_summary: "bg-gray-500/10 text-gray-700",
}

/**
 * ActivityCard - Display a single activity
 * @param {Object} props
 * @param {Object} props.activity - Activity object
 * @param {Function} props.onClick - Callback when card is clicked
 * @param {boolean} props.isSelected - Whether this card is currently selected
 */
export function ActivityCard({ activity, onClick, isSelected = false }) {
	const icon = ACTIVITY_ICONS[activity.type] || "•"
	const colorClass = ACTIVITY_COLORS[activity.type] || "bg-gray-500/10 text-gray-700"

	return (
		<button
			type="button"
			onClick={onClick}
			className={`w-full rounded-2xl border p-4 text-left transition-all ${
				isSelected
					? "border-primary bg-primary/5 shadow-sm"
					: "border-border bg-background hover:border-border/60 hover:bg-secondary/30"
			}`}
		>
			<div className="flex items-start gap-3">
				{/* Icon */}
				<div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-lg text-lg ${colorClass}`}>
					{icon}
				</div>

				{/* Content */}
				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-2">
						<div className="flex-1">
							<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
								{activity.type?.replace(/_/g, " ")}
							</p>
							<h3 className="mt-1 truncate text-sm font-semibold line-clamp-2">
								{activity.title}
							</h3>
							{activity.description && (
								<p className="mt-1 truncate text-xs text-muted-foreground line-clamp-2">
									{activity.description}
								</p>
							)}
						</div>

						{/* Time and Badge */}
						<div className="flex flex-col items-end gap-1">
							<span className="whitespace-nowrap rounded-full bg-secondary px-2 py-1 text-xs font-medium text-foreground">
								{formatRelativeTime(activity.timestamp)}
							</span>
							{activity.isNew && (
								<span className="h-2 w-2 rounded-full bg-primary" title="New activity" />
							)}
						</div>
					</div>

					{/* Metadata */}
					{activity.metadata && Object.keys(activity.metadata).length > 0 && (
						<div className="mt-2 flex flex-wrap gap-1">
							{Object.entries(activity.metadata)
								.slice(0, 2)
								.map(([key, value]) => {
									if (value === null || value === undefined) return null
									return (
										<span
											key={key}
											className="inline-block rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
										>
											{String(value).substring(0, 30)}
											{String(value).length > 30 ? "..." : ""}
										</span>
									)
								})}
						</div>
					)}
				</div>
			</div>
		</button>
	)
}

export default ActivityCard
