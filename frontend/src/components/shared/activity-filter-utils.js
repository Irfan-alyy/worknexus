const ACTIVITY_TYPE_PREFIXES = {
	employee: ["employee_"],
	payroll: ["payroll_"],
	department: ["department_"],
	project: ["project_"],
	task: ["task_"],
	timelog: ["time_log", "time_logs_"],
	client: ["client_"],
	user: ["user_"],
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

function startOfToday() {
	const now = new Date()
	const start = new Date(now)
	start.setHours(0, 0, 0, 0)
	return start
}

function getDateRangeStart(dateRange) {
	const now = new Date()

	switch (dateRange) {
		case "today": {
			const start = new Date(now)
			start.setHours(0, 0, 0, 0)
			return start
		}
		case "week":
			return new Date(now.getTime() - 7 * ONE_DAY_MS)
		case "month":
			return new Date(now.getFullYear(), now.getMonth(), 1)
		default:
			return null
	}
}

function matchesTypeFilter(activity, type) {
	if (!type) return true

	const prefixes = ACTIVITY_TYPE_PREFIXES[type]
	if (!prefixes) {
		return activity.type === type
	}

	return prefixes.some((prefix) => activity.type === type || activity.type.startsWith(prefix) || activity.source === type)
}

function matchesDateRangeFilter(activity, dateRange) {
	if (!dateRange || dateRange === "all") return true

	const start = getDateRangeStart(dateRange)
	if (!start) return true

	return new Date(activity.timestamp) >= start
}

function matchesStatusFilter(activity, status) {
	if (!status || status === "all") return true

	if (status === "new") {
		return Boolean(activity.isNew) || new Date(activity.timestamp) >= startOfToday()
	}

	if (status === "archived") {
		return !Boolean(activity.isNew) && new Date(activity.timestamp) < startOfToday()
	}

	return true
}

export function filterActivities(activities = [], filters = {}) {
	const { type, dateRange, status } = filters

	return activities.filter((activity) => {
		return (
			matchesTypeFilter(activity, type) &&
			matchesDateRangeFilter(activity, dateRange) &&
			matchesStatusFilter(activity, status)
		)
	})
}
