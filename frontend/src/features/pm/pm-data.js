export const pmPageTitles = {
	projects: "Projects",
	activities: "Activities",
	analytics: "Analytics",
	milestones: "Milestones",
}

export const pmProjectSeeds = [
	{ id: 1, name: "Website Refresh", owner: "Nadia", status: "active", progress: 68, summary: "Improve the marketing site and launch the new pages." },
	{ id: 2, name: "Client Portal", owner: "Imran", status: "planning", progress: 32, summary: "Prepare the portal rollout for support and billing." },
	{ id: 3, name: "Mobile Release", owner: "Sara", status: "blocked", progress: 54, summary: "Resolve API issues before the next release window." },
]

export const pmActivitySeeds = [
	{ id: 1, title: "Project updated", note: "Website Refresh moved to development", time: "10m ago", details: ["Owner updated", "Timeline reviewed", "No blockers"] },
	{ id: 2, title: "Task assigned", note: "New task added to Client Portal", time: "35m ago", details: ["Assigned to Imran", "Due tomorrow", "Priority high"] },
	{ id: 3, title: "Milestone reviewed", note: "Mobile Release checkpoint checked", time: "1h ago", details: ["Status: at risk", "QA pending", "Client notified"] },
]

export const pmMilestoneSeeds = [
	{ id: 1, name: "Design sign-off", project: "Website Refresh", status: "done", due: "May 24" },
	{ id: 2, name: "API freeze", project: "Mobile Release", status: "in progress", due: "May 28" },
	{ id: 3, name: "Launch prep", project: "Client Portal", status: "planned", due: "Jun 2" },
]

export function tabFromPath(pathname) {
	if (pathname.endsWith("/activities")) return "activities"
	if (pathname.endsWith("/analytics")) return "analytics"
	if (pathname.endsWith("/milestones")) return "milestones"
	return "projects"
}