import { formatRelativeTime } from "@/lib/date-utils"

/**
 * Get icon based on activity type
 */
function getActivityIcon(type) {
	const iconMap = {
		task_assigned: "📋",
		task_status_changed: "✅",
		task_due_soon: "⏰",
		task_completed: "🎉",
		time_log_added: "⏱️",
		payroll_generated: "💰",
		payroll_status_changed: "📊",
		project_added: "📁",
	}
	return iconMap[type] || "📌"
}

/**
 * Get color based on activity type
 */
function getActivityColor(type) {
	const colorMap = {
		task_assigned: "border-primary/40 bg-primary/5",
		task_status_changed: "border-green-500/40 bg-green-500/5",
		task_due_soon: "border-yellow-500/40 bg-yellow-500/5",
		task_completed: "border-green-600/40 bg-green-600/5",
		time_log_added: "border-blue-500/40 bg-blue-500/5",
		payroll_generated: "border-purple-500/40 bg-purple-500/5",
		payroll_status_changed: "border-purple-600/40 bg-purple-600/5",
		project_added: "border-orange-500/40 bg-orange-500/5",
	}
	return colorMap[type] || "border-border bg-card"
}

/**
 * Format activity type for display
 */
function formatActivityType(type) {
	const typeMap = {
		task_assigned: "Task Assigned",
		task_status_changed: "Task Updated",
		task_due_soon: "Due Soon",
		task_completed: "Task Completed",
		time_log_added: "Time Logged",
		payroll_generated: "Payroll Generated",
		payroll_status_changed: "Payroll Status",
		project_added: "Project Membership",
	}
	return typeMap[type] || type.replace(/_/g, " ").toUpperCase()
}

/**
 * Parse amount with proper formatting
 */
function formatAmount(amount) {
	if (!amount) return ""
	return `$${parseFloat(amount).toFixed(2)}`
}

export function ActivityCard({ activity, onOpenDetail }) {
	const timestamp = new Date(activity.timestamp)
	const timeAgo = formatRelativeTime(timestamp)
	const icon = getActivityIcon(activity.type)
	const className = getActivityColor(activity.isNew ? "task_assigned" : activity.type)

	return (
		<button
			type="button"
			onClick={() => onOpenDetail(activity.type, <ActivityDetailModal activity={activity} />)}
			className={`w-full rounded-3xl border p-5 text-left shadow-sm transition-colors hover:bg-secondary/30 ${className}`}
		>
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div className="flex gap-3">
					<div className="text-2xl">{icon}</div>
					<div className="flex-1">
						<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
							{formatActivityType(activity.type)}
						</p>
						<h3 className="mt-1 text-base font-semibold">{activity.title}</h3>
						{activity.description && (
							<p className="mt-2 text-sm text-muted-foreground">{activity.description}</p>
						)}
						{activity.metadata && Object.keys(activity.metadata).length > 0 && (
							<div className="mt-2 flex flex-wrap gap-2">
								{activity.metadata.projectName && (
									<span className="inline-block rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
										{activity.metadata.projectName}
									</span>
								)}
								{activity.metadata.hours && (
									<span className="inline-block rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
										{activity.metadata.hours}h
									</span>
								)}
								{activity.metadata.amount && (
									<span className="inline-block rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
										{formatAmount(activity.metadata.amount)}
									</span>
								)}
								{activity.metadata.daysUntilDue !== undefined && (
									<span className="inline-block rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground">
										{activity.metadata.daysUntilDue} days
									</span>
								)}
								{activity.metadata.status && (
									<span className="inline-block rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground capitalize">
										{activity.metadata.status}
									</span>
								)}
							</div>
						)}
					</div>
				</div>
				<div className="flex items-center gap-2">
					{activity.isNew && (
						<span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
							New
						</span>
					)}
					<span className="rounded-full bg-secondary px-3 py-1 whitespace-nowrap text-xs font-medium text-foreground">
						{timeAgo}
					</span>
				</div>
			</div>
		</button>
	)
}

/**
 * Activity detail modal component
 */
function ActivityDetailModal({ activity }) {
	const typeLabel = formatActivityType(activity.type)

	return (
		<div className="space-y-4">
			<div>
				<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{typeLabel}</p>
				<h3 className="mt-1 text-xl font-semibold">{activity.title}</h3>
				<p className="mt-1 text-sm text-muted-foreground">{new Date(activity.timestamp).toLocaleDateString()}</p>
			</div>

			{activity.description && (
				<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
					<p className="text-sm font-medium">Details</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">{activity.description}</p>
				</section>
			)}

			{activity.metadata && Object.keys(activity.metadata).length > 0 && (
				<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
					<p className="text-sm font-medium">Related Information</p>
					<div className="mt-3 space-y-2">
						{activity.metadata.projectName && (
							<div className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
								<span className="font-medium text-foreground">Project: </span>
								{activity.metadata.projectName}
							</div>
						)}
						{activity.metadata.hours && (
							<div className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
								<span className="font-medium text-foreground">Hours: </span>
								{activity.metadata.hours}
							</div>
						)}
						{activity.metadata.amount && (
							<div className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
								<span className="font-medium text-foreground">Amount: </span>
								{formatAmount(activity.metadata.amount)}
							</div>
						)}
						{activity.metadata.period && (
							<div className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
								<span className="font-medium text-foreground">Period: </span>
								{activity.metadata.period}
							</div>
						)}
						{activity.metadata.status && (
							<div className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
								<span className="font-medium text-foreground">Status: </span>
								<span className="capitalize">{activity.metadata.status}</span>
							</div>
						)}
						{activity.metadata.daysUntilDue !== undefined && (
							<div className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
								<span className="font-medium text-foreground">Days Until Due: </span>
								{activity.metadata.daysUntilDue}
							</div>
						)}
					</div>
				</section>
			)}

			<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Activity Type</p>
				<div className="mt-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
					{activity.source ? `Source: ${activity.source}` : typeLabel}
				</div>
			</section>
		</div>
	)
}
