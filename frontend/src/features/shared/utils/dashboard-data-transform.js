/**
 * Transform backend metrics object to dashboard metric grid format
 * @param {Object} metrics - Raw metrics from backend
 * @param {string} role - User role (admin, hr, pm, employee)
 * @returns {Array} Formatted metrics for dashboard metric grid
 */
export function transformMetricsToGrid(metrics = {}, role = "employee") {
	if (!metrics || Object.keys(metrics).length === 0) {
		return []
	}

	const metricMap = {
		admin: [
			{ key: "totalManagers", label: "System Managers", note: "HR and PM roles" },
			{ key: "totalEmployees", label: "Employees", note: "Active profiles" },
			{ key: "clientCount", label: "Clients", note: "Client accounts" },
			{ key: "projectCount", label: "Projects", note: "Active projects" },
		],
		hr: [
			{ key: "totalEmployees", label: "Employees", note: "Total headcount" },
			{ key: "totalDepartments", label: "Departments", note: "Org divisions" },
			{ key: "totalProjects", label: "Projects", note: "Active projects" },
			{ key: "pendingPayroll", label: "Pending Payroll", note: "Items to process" },
		],
		pm: [
			{ key: "totalProjects", label: "Active Projects", note: "Managed projects" },
			{ key: "totalTasks", label: "Total Tasks", note: "Assigned to team" },
			{ key: "completedTasks", label: "Completed", note: "This week" },
			{ key: "pendingTasks", label: "Pending", note: "Awaiting review" },
		],
		employee: [
			{ key: "tasksDue", label: "Tasks Due", note: "This week" },
			{ key: "hoursLogged", label: "Hours Logged", note: "Current period" },
			{ key: "assignedProjects", label: "Projects", note: "Active projects" },
			{ key: "completedTasks", label: "Completed", note: "This month" },
		],
	}

	const roleMappings = metricMap[role] || metricMap.employee
    // console.log(roleMappings)
    // console.log(metrics)
	return roleMappings
		.map((mapping) => {
			const value = metrics[mapping.key]
			return {
				label: mapping.label,
				value: value !== undefined ? String(value) : "0",
				note: mapping.note,
			}
		})
		.filter((item) => item.value !== undefined)
}

/**
 * Transform backend activities to dashboard activity feed format
 * Limit to most recent 5 activities
 * @param {Array} activities - Raw activities from backend
 * @returns {Array} Formatted activities for dashboard activity feed
 */
export function transformActivitiesToFeed(activities = []) {
	if (!Array.isArray(activities) || activities.length === 0) {
		return []
	}

	// Sort by timestamp (newest first) and take top 5
	const recent = activities
		.sort((a, b) => {
			const aTime = new Date(a.timestamp || 0).getTime()
			const bTime = new Date(b.timestamp || 0).getTime()
			return bTime - aTime
		})
		.slice(0, 5)

	return recent.map((activity) => ({
		title: activity.title || activity.type || "Activity",
		meta: formatActivityMeta(activity),
	}))
}

/**
 * Format activity metadata into readable string
 * @param {Object} activity - Activity object
 * @returns {string} Formatted meta string
 */
function formatActivityMeta(activity) {
	let category = activity.category || activity.type || "General"

	// Format category name
	category = category
		.replace(/_/g, " ")
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ")

	// Format time ago
	let timeAgo = "just now"
	if (activity.timestamp) {
		const diff = Date.now() - new Date(activity.timestamp).getTime()
		const minutes = Math.floor(diff / 60000)
		const hours = Math.floor(minutes / 60)
		const days = Math.floor(hours / 24)

		if (minutes < 1) {
			timeAgo = "just now"
		} else if (minutes < 60) {
			timeAgo = `${minutes}m ago`
		} else if (hours < 24) {
			timeAgo = `${hours}h ago`
		} else if (days < 7) {
			timeAgo = `${days}d ago`
		} else {
			timeAgo = new Date(activity.timestamp).toLocaleDateString()
		}
	}

	return `${category} • ${timeAgo}`
}

/**
 * Get fallback mock data based on role
 * @param {string} role - User role
 * @returns {Object} Object with mockMetrics and mockActivities
 */
export function getFallbackDashboardData(role = "employee") {
	const fallbackData = {
		admin: {
			mockMetrics: [
				{ label: "System alerts", value: "2", note: "Requires attention" },
				{ label: "Accounts managed", value: "24", note: "HR and PM access" },
				{ label: "Audit status", value: "Healthy", note: "Last check 5m ago" },
			],
			mockActivities: [
				{ title: "Created HR account", meta: "User access • 10m ago" },
				{ title: "Reviewed permissions", meta: "Security • 28m ago" },
				{ title: "Updated system settings", meta: "Admin panel • 44m ago" },
			],
		},
		hr: {
			mockMetrics: [
				{ label: "Open onboarding", value: "5", note: "2 pending approvals" },
				{ label: "Employees", value: "128", note: "14 new this month" },
				{ label: "Payroll readiness", value: "94%", note: "Finalize before Friday" },
			],
			mockActivities: [
				{ title: "Onboarding task completed", meta: "HR workflow • 12m ago" },
				{ title: "Department updated", meta: "Org chart • 31m ago" },
				{ title: "Payroll batch prepared", meta: "Finance handoff • 48m ago" },
			],
		},
		pm: {
			mockMetrics: [
				{ label: "Active projects", value: "7", note: "2 at risk" },
				{ label: "Client follow-ups", value: "11", note: "3 due today" },
				{ label: "Open tasks", value: "26", note: "8 assigned to team" },
			],
			mockActivities: [
				{ title: "Project milestone updated", meta: "Delivery • 9m ago" },
				{ title: "Client feedback logged", meta: "Account management • 27m ago" },
				{ title: "New task assigned", meta: "Sprint board • 45m ago" },
			],
		},
		employee: {
			mockMetrics: [
				{ label: "Tasks due", value: "4", note: "2 due today" },
				{ label: "Hours logged", value: "36", note: "Target 40 hours" },
				{ label: "Updates waiting", value: "3", note: "Review your board" },
			],
			mockActivities: [
				{ title: "Task status updated", meta: "Task board • 6m ago" },
				{ title: "Hours logged for today", meta: "Time tracking • 24m ago" },
				{ title: "New comment received", meta: "Team chat • 41m ago" },
			],
		},
	}

	return fallbackData[role] || fallbackData.employee
}
