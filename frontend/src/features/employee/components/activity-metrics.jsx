/**
 * Format metric display value
 */
function formatMetricValue(value, type) {
	if (type === "hours") return `${parseFloat(value).toFixed(1)}h`
	if (type === "amount") return `$${parseFloat(value).toFixed(2)}`
	if (type === "count") return parseInt(value, 10)
	return value
}

/**
 * Get metric card styling based on type
 */
function getMetricStyle(type) {
	const styles = {
		tasks: "border-primary/40 bg-primary/5",
		overdue: "border-red-500/40 bg-red-500/5",
		payroll: "border-green-500/40 bg-green-500/5",
		hours: "border-blue-500/40 bg-blue-500/5",
	}
	return styles[type] || "border-border bg-card"
}

export function ActivityMetricsCards({ metrics, isLoading = false }) {
	if (isLoading) {
		return (
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="h-24 animate-pulse rounded-3xl border border-border bg-card" />
				))}
			</div>
		)
	}

	if (!metrics) {
		return null
	}

	const cards = [
		{
			id: "tasks",
			icon: "📋",
			title: "Tasks Due",
			value: metrics.tasksDueThisWeek || 0,
			subtitle: "This week",
			type: "tasks",
			highlightValue: true,
		},
		{
			id: "overdue",
			icon: "⚠️",
			title: "Overdue",
			value: metrics.overdueTasks || 0,
			subtitle: "Needs attention",
			type: "overdue",
			highlightValue: metrics.overdueTasks > 0,
		},
		{
			id: "hours",
			icon: "⏱️",
			title: "Hours Logged",
			value: formatMetricValue(metrics.totalHoursThisWeek || 0, "hours"),
			subtitle: "This week",
			type: "hours",
		},
		{
			id: "payroll",
			icon: "💰",
			title: "Pending Payroll",
			value: `$${parseFloat(metrics.pendingPayrollAmount || 0).toFixed(2)}`,
			subtitle: `${metrics.pendingPayrollCount || 0} records`,
			type: "payroll",
			highlightValue: metrics.pendingPayrollCount > 0,
		},
	]

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			{cards.map((card) => (
				<div
					key={card.id}
					className={`rounded-3xl border p-4 shadow-sm transition-colors hover:bg-secondary/10 ${getMetricStyle(card.type)}`}
				>
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{card.subtitle}</p>
							<h3 className="mt-1 text-sm font-semibold text-foreground">{card.title}</h3>
						</div>
						<span className="text-2xl">{card.icon}</span>
					</div>
					<div className="mt-3">
						<p className={`text-3xl font-bold ${card.highlightValue ? "text-primary" : "text-foreground"}`}>
							{card.value}
						</p>
					</div>
				</div>
			))}
		</div>
	)
}
