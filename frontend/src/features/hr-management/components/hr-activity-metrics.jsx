/**
 * HR Activity Metrics Cards Component
 * Displays HR-specific metrics: employees, departments, projects, pending payroll
 */

function formatMetricValue(value, type) {
	if (type === "hours") return `${parseFloat(value).toFixed(1)}h`
	if (type === "amount") return `$${parseFloat(value).toFixed(2)}`
	if (type === "count") return parseInt(value, 10)
	return value
}

function getMetricStyle(type) {
	const styles = {
		employees: "border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 cursor-pointer",
		departments: "border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10 cursor-pointer",
		projects: "border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer",
		payroll: "border-green-500/40 bg-green-500/5 hover:bg-green-500/10 cursor-pointer",
	}
	return styles[type] || "border-border bg-card cursor-pointer"
}

export function HRActivityMetricsCards({ metrics, isLoading = false, onMetricClick = () => {} }) {
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
			id: "employees",
			icon: "👥",
			title: "Total Employees",
			value: metrics.totalEmployees || 0,
			subtitle: `${metrics.newEmployeesThisMonth || 0} new this month`,
			type: "employees",
		},
		{
			id: "departments",
			icon: "🏢",
			title: "Departments",
			value: metrics.departmentCount || 0,
			subtitle: "Active departments",
			type: "departments",
		},
		{
			id: "projects",
			icon: "📊",
			title: "Projects",
			value: metrics.projectCount || 0,
			subtitle: "Active projects",
			type: "projects",
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
					className={`rounded-3xl border p-4 shadow-sm transition-colors ${getMetricStyle(card.type)}`}
					onClick={() => onMetricClick?.(card.type)}
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
