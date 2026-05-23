export const roleDefinitions = {
	admin: {
		label: "Admin",
		shortLabel: "Admin",
		dashboardTitle: "Admin Dashboard",
		dashboardDescription:
			"Monitor users, settings, approvals, and the health of the platform.",
		sidebarItems: ["Dashboard", "Chat", "Payroll", "HR"],
		stats: [
			{ label: "System alerts", value: "2", note: "Requires attention" },
			{ label: "Accounts managed", value: "24", note: "HR and PM access" },
			{ label: "Audit status", value: "Healthy", note: "Last check 5m ago" },
		],
		activity: [
			{ title: "Created HR account", meta: "User access • 10m ago" },
			{ title: "Reviewed permissions", meta: "Security • 28m ago" },
			{ title: "Updated system settings", meta: "Admin panel • 44m ago" },
		],
		focusPoints: [
			"Create HR and PM accounts",
			"Manage system settings",
			"Review audit and access logs",
		],
		quickActions: ["User management", "Access control", "System settings"],
	},
	hr: {
		label: "HR Manager",
		shortLabel: "HR",
		dashboardTitle: "People operations center",
		dashboardDescription:
			"Manage employees, departments, onboarding, and payroll coordination.",
		sidebarItems: ["Dashboard", "HR", "Payroll", "Chat"],
		stats: [
			{ label: "Open onboarding", value: "5", note: "2 pending approvals" },
			{ label: "Employees", value: "128", note: "14 new this month" },
			{ label: "Payroll readiness", value: "94%", note: "Finalize before Friday" },
		],
		activity: [
			{ title: "Onboarding task completed", meta: "HR workflow • 12m ago" },
			{ title: "Department updated", meta: "Org chart • 31m ago" },
			{ title: "Payroll batch prepared", meta: "Finance handoff • 48m ago" },
		],
		focusPoints: [
			"Manage employees and departments",
			"Prepare payroll approvals",
			"Track onboarding completion",
		],
		quickActions: ["Onboarding", "Employees", "Payroll review"],
	},
	pm: {
		label: "Project Manager",
		shortLabel: "PM",
		dashboardTitle: "Delivery command center",
		dashboardDescription:
			"Track project progress, client communication, and team delivery health.",
		sidebarItems: ["Dashboard", "Chat"],
		stats: [
			{ label: "Active projects", value: "7", note: "2 at risk" },
			{ label: "Client follow-ups", value: "11", note: "3 due today" },
			{ label: "Open tasks", value: "26", note: "8 assigned to team" },
		],
		activity: [
			{ title: "Project milestone updated", meta: "Delivery • 9m ago" },
			{ title: "Client feedback logged", meta: "Account management • 27m ago" },
			{ title: "New task assigned", meta: "Sprint board • 45m ago" },
		],
		focusPoints: [
			"Create and monitor projects",
			"Assign teams and tasks",
			"Track client progress",
		],
		quickActions: ["Projects", "Tasks", "Client updates"],
	},
	employee: {
		label: "Employee",
		shortLabel: "Employee",
		dashboardTitle: "Personal workbench",
		dashboardDescription:
			"Stay on top of tasks, working hours, and the next items you need to finish.",
		sidebarItems: ["Dashboard", "Chat"],
		stats: [
			{ label: "Tasks due", value: "4", note: "2 due today" },
			{ label: "Hours logged", value: "36", note: "Target 40 hours" },
			{ label: "Updates waiting", value: "3", note: "Review your board" },
		],
		activity: [
			{ title: "Task status updated", meta: "Task board • 6m ago" },
			{ title: "Hours logged for today", meta: "Time tracking • 24m ago" },
			{ title: "New comment received", meta: "Team chat • 41m ago" },
		],
		focusPoints: [
			"View tasks and working hours",
			"Update task status",
			"Keep your board current",
		],
		quickActions: ["My tasks", "Time log", "Team updates"],
	},
}

export const authRoleOptions = [
	{ value: "admin", label: "Admin" },
	{ value: "hr", label: "HR Manager" },
	{ value: "pm", label: "Project Manager" },
	{ value: "employee", label: "Employee" },
]

export const dashboardRouteMeta = {
	"/dashboard": {
		title: "Workspace pulse",
		description: "Track the current state of the workspace and jump into the busiest areas.",
	},
	"/chat": {
		title: "Chat context",
		description: "Keep channel activity, people, and shortcuts close to the conversation.",
	},
	"/payroll": {
		title: "Payroll summary",
		description: "Review compensation snapshots and pending allowances before approval.",
	},
	"/hr": {
		title: "Onboarding status",
		description: "Guide new hires through the workspace setup and policy acknowledgements.",
	},
	"/recruitments": {
		title: "Recruitment board",
		description: "Create job openings and monitor applicant activity for active hiring roles.",
	},
}
