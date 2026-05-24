export const employeePageTitles = {
	projects: "Projects",
	activities: "Activities",
	profile: "Profile",
}

export const employeeProjects = [
	{
		id: 1,
		name: "WorkNexus Dashboard Refresh",
		projectCode: "WN-24",
		manager: "Bilal Ahmed",
		channel: "#product-dev",
		dueDate: "Jun 12, 2026",
		status: "In Progress",
		completion: 64,
		timeline: ["Kickoff completed", "UI baseline reviewed", "Responsive QA in progress"],
		dependencies: ["Design token updates", "PM review sign-off"],
		tasks: [
			{ id: "wn-121", title: "Build role analytics cards", status: "Completed", priority: "Medium", due: "May 19", estimate: "6h", blocker: "None" },
			{ id: "wn-134", title: "Refine responsive sidebar spacing", status: "In Progress", priority: "High", due: "May 25", estimate: "10h", blocker: "Awaiting final spacing sign-off" },
			{ id: "wn-146", title: "Add route aside content hints", status: "Pending", priority: "Medium", due: "May 29", estimate: "4h", blocker: "Depends on copy approval" },
			{ id: "wn-151", title: "Run visual QA across breakpoints", status: "Pending", priority: "Low", due: "Jun 2", estimate: "5h", blocker: "None" },
		],
	},
	{
		id: 2,
		name: "Client Portal Sprint 3",
		projectCode: "CP-09",
		manager: "Aisha Khan",
		channel: "#announcements",
		dueDate: "Jun 20, 2026",
		status: "At Risk",
		completion: 41,
		timeline: ["Scope confirmed", "Integration started", "Risk raised for API delay"],
		dependencies: ["API retry endpoint", "Client acceptance criteria"],
		tasks: [
			{ id: "cp-211", title: "Integrate invoice status table", status: "In Progress", priority: "High", due: "May 28", estimate: "8h", blocker: "Backend response mismatch" },
			{ id: "cp-224", title: "Fix client export issue", status: "Completed", priority: "High", due: "May 21", estimate: "3h", blocker: "None" },
			{ id: "cp-239", title: "Document retry flow for failures", status: "Pending", priority: "Medium", due: "May 31", estimate: "2h", blocker: "Pending API finalization" },
		],
	},
	{
		id: 3,
		name: "Time Tracking Module",
		projectCode: "TT-07",
		manager: "Imran Shah",
		channel: "#general",
		dueDate: "Jul 3, 2026",
		status: "Planning",
		completion: 18,
		timeline: ["Discovery started", "Widgets identified", "Timeline under review"],
		dependencies: ["HR policy checklist", "Time entry API contract"],
		tasks: [
			{ id: "tt-301", title: "Define weekly summary widget", status: "Pending", priority: "Medium", due: "May 30", estimate: "4h", blocker: "Awaiting reporting metrics" },
			{ id: "tt-318", title: "Prototype approval timeline UI", status: "In Progress", priority: "Low", due: "Jun 4", estimate: "6h", blocker: "None" },
		],
	},
]

export const employeeActivities = [
	{
		id: 1,
		type: "Task Assignment",
		title: "New task assigned: Refine responsive sidebar spacing",
		time: "10 minutes ago",
		summary: "Project manager assigned a high-priority UI spacing task in WorkNexus Dashboard Refresh.",
		new: true,
		source: "Project Manager",
		action: "Open task details and update progress",
		details: [
			"Project: WorkNexus Dashboard Refresh",
			"Due: May 25",
			"Priority: High",
			"Assigned by: Bilal Ahmed",
		],
	},
	{
		id: 2,
		type: "Channel Update",
		title: "Added to channel #release-q2",
		time: "34 minutes ago",
		summary: "You were added to a focused channel for release coordination and QA updates.",
		new: true,
		source: "Operations",
		action: "Review unread messages and acknowledge",
		details: [
			"Channel: #release-q2",
			"Added by: Aisha Khan",
			"Purpose: Launch preparation",
			"Initial unread messages: 12",
		],
	},
	{
		id: 3,
		type: "Project Change",
		title: "Moved to project: Client Portal Sprint 3",
		time: "2 hours ago",
		summary: "Your workload now includes Sprint 3 support tasks for client reporting.",
		new: false,
		source: "Project Allocation",
		action: "Check sprint scope and first deliverable",
		details: [
			"Project: Client Portal Sprint 3",
			"Role: Frontend Contributor",
			"First checkpoint: May 28",
		],
	},
	{
		id: 4,
		type: "Task Completed",
		title: "Task approved: Integrate invoice status table",
		time: "Yesterday",
		summary: "Your completed task was reviewed and marked approved by the PM.",
		new: false,
		source: "Task Review",
		action: "Move to next pending item",
		details: [
			"Task: Integrate invoice status table",
			"Reviewer: Imran Shah",
			"Approved in: 1 review cycle",
		],
	},
]

export const employeeProfileSeed = {
	phone: "+92 300 0000000",
	department: "Engineering",
	position: "Frontend Engineer",
	location: "Lahore",
	joinedAt: "Jan 2025",
}

export const employeePaymentHistory = [
	{ id: 1, month: "May 2026", amount: "$2,200", status: "Paid", date: "May 01, 2026" },
	{ id: 2, month: "Apr 2026", amount: "$2,150", status: "Paid", date: "Apr 01, 2026" },
	{ id: 3, month: "Mar 2026", amount: "$2,150", status: "Paid", date: "Mar 01, 2026" },
	{ id: 4, month: "Feb 2026", amount: "$2,050", status: "Paid", date: "Feb 01, 2026" },
]

export function employeeTabFromPath(pathname) {
	if (pathname.endsWith("/activities")) return "activities"
	if (pathname.endsWith("/profile")) return "profile"
	return "projects"
}

export const employeeActivityBadgeCount = 4
