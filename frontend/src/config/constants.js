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
		guideTabs: [
			{ label: "Dashboard", description: "Check alerts, approvals, and overall workspace health." },
			{ label: "Departments", description: "Organize teams and manage the department structure." },
			{ label: "Projects", description: "Review project records and keep delivery work aligned." },
			{ label: "Clients", description: "Track client accounts and the work tied to each one." },
			{ label: "Managers", description: "Manage manager accounts and their access across the workspace." },
			{ label: "Employees", description: "Maintain employee records and role-based access details." },
			{ label: "Tasks", description: "See the full task queue and monitor work in progress." },
			{ label: "Activities", description: "Review recent platform activity and important workflow changes." },
			{ label: "Payroll", description: "Review allowances, approvals, and compensation snapshots." },
			{ label: "Channels", description: "Open project channels to follow team discussion and updates." },
			{ label: "Direct messages", description: "Jump into private conversations for one-to-one communication." },
		],
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
		guideTabs: [
			{ label: "Dashboard", description: "See the main HR summary, alerts, and current priorities." },
			{ label: "Recruitments", description: "Track open roles, applicants, and hiring progress." },
			{ label: "Projects", description: "View active project work that affects staffing and planning." },
			{ label: "Clients", description: "Monitor client records that support delivery and onboarding." },
			{ label: "Employees", description: "Manage employee records, onboarding, and profile updates." },
			{ label: "Payroll", description: "Review payroll readiness, approvals, and payout status." },
			{ label: "Channels", description: "Follow HR-related discussions in shared project channels." },
			{ label: "Direct messages", description: "Send private messages for sensitive people-ops conversations." },
		],
	},
	pm: {
		label: "Project Manager",
		shortLabel: "PM",
		dashboardTitle: "Delivery command center",
		dashboardDescription:
			"Track project progress, client communication, and team delivery health.",
		sidebarItems: ["Dashboard", "Projects", "Activities", "Analytics", "Milestones", "Chat"],
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
		guideTabs: [
			{ label: "Dashboard", description: "Review delivery status, priorities, and project health at a glance." },
			{ label: "Projects", description: "Create and manage projects, owners, and delivery scope." },
			{ label: "Tasks", description: "Track assigned tasks and make sure nothing is blocked." },
			{ label: "Activities", description: "Check recent updates, progress changes, and team movement." },
			{ label: "Analytics", description: "Look at trends and summary signals to spot delivery issues early." },
			{ label: "Milestones", description: "Follow key checkpoints and confirm delivery dates stay on track." },
			{ label: "Channels", description: "Use project channels to coordinate work and share updates." },
			{ label: "Direct messages", description: "Open private conversations when you need a quick direct follow-up." },
		],
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
		guideTabs: [
			{ label: "Dashboard", description: "See your personal work summary, priorities, and current alerts." },
			{ label: "Projects", description: "Open the projects you are assigned to and follow progress." },
			{ label: "Tasks", description: "Review your tasks and update progress as work moves forward." },
			{ label: "Activities", description: "Check recent changes, comments, and workflow updates." },
			{ label: "Profile", description: "Manage your personal profile details and related records." },
			{ label: "Channels", description: "Join team channels to stay informed on project discussions." },
			{ label: "Direct messages", description: "Use private messages for quick one-to-one communication." },
		],
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
	"/pm": {
		title: "Delivery command center",
		description: "Review projects, activities, analytics, and milestones from one simple workspace.",
		bullets: ["Projects overview", "Activity feed", "Milestone tracking"],
	},
	"/pm/projects": {
		title: "Projects",
		description: "Manage live work, assign owners, and track project status.",
		bullets: ["Create projects", "Edit project details", "Remove finished work"],
	},
	"/pm/activities": {
		title: "Activities",
		description: "See recent work updates and team progress in one list.",
		bullets: ["View recent updates", "Check status changes", "Open activity details"],
	},
	"/pm/analytics": {
		title: "Analytics",
		description: "Look at delivery trends and progress summary at a glance.",
		bullets: ["Read progress summary", "Review blocked work", "Track delivery health"],
	},
	"/pm/milestones": {
		title: "Milestones",
		description: "Follow milestone dates, completion states, and delivery checkpoints.",
		bullets: ["Monitor milestone status", "See due dates", "Check completion rate"],
	},
	"/employee/projects": {
		title: "My projects",
		description: "Track your assigned projects and the task status split across completed, in progress, and pending.",
		bullets: ["Review assigned projects", "Open task details", "Track due dates and progress"],
	},
	"/employee/activities": {
		title: "My activities",
		description: "Follow your latest work updates like new tasks, channel additions, and project changes.",
		bullets: ["See latest updates", "Open activity details", "Prioritize new items"],
	},
	"/employee/profile": {
		title: "My profile",
		description: "Manage personal details and review your payment history from a single profile section.",
		bullets: ["Review profile details", "Edit details in popup", "Check payment records"],
	},
}
