const prisma = require("../../config/db.config")

const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000)

/**
 * Transforms task into activity objects
 * Handles task assignments and status-related events
 */
function transformTaskActivities(task, employeeId) {
	const activities = []

	// Task was recently assigned (created in last day)
	const createdDate = new Date(task.createdAt)
	if (createdDate > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
		activities.push({
			type: "task_assigned",
			title: `Task assigned: ${task.title}`,
			description: task.description || "",
			taskId: task.id,
			projectId: task.projectId,
			priority: task.priority,
			dueDate: task.dueDate,
			timestamp: task.createdAt,
			source: "task",
			metadata: {
				projectName: task.project?.name,
				assignedBy: task.project?.manager?.user?.email,
			},
			isNew: createdDate > ONE_HOUR_AGO,
		})
	}

	// Task is due soon (< 3 days)
	if (task.dueDate && task.status !== "completed") {
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const dueDate = new Date(task.dueDate)
		dueDate.setHours(0, 0, 0, 0)
		const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))

		if (daysUntilDue >= 0 && daysUntilDue <= 3) {
			activities.push({
				type: "task_due_soon",
				title: `Task due soon: ${task.title}`,
				description: "",
				taskId: task.id,
				projectId: task.projectId,
				priority: task.priority,
				dueDate: task.dueDate,
				timestamp: new Date(),
				source: "task",
				metadata: {
					projectName: task.project?.name,
					daysUntilDue,
				},
				isNew: false,
			})
		}
	}

	// Task recently completed
	if (task.status === "completed") {
		const completedDate = new Date(task.updatedAt)
		if (completedDate > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
			activities.push({
				type: "task_completed",
				title: `Task completed: ${task.title}`,
				description: "",
				taskId: task.id,
				projectId: task.projectId,
				timestamp: task.updatedAt,
				source: "task",
				metadata: {
					projectName: task.project?.name,
				},
				isNew: completedDate > ONE_HOUR_AGO,
			})
		}
	}

	return activities
}

/**
 * Transforms time logs into activity objects
 */
function transformTimeLogActivities(timeLogs, employeeId) {
	const activities = []

	// Group time logs by day and show recent ones
	const recentLogs = timeLogs.slice(0, 5) // Last 5 time logs
	const logsInLastDay = timeLogs.filter((log) => new Date(log.loggedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000))

	logsInLastDay.forEach((log) => {
		activities.push({
			type: "time_log_added",
			title: `Time logged: ${log.task?.title || "Task"}`,
			description: log.description || "",
			hours: log.hours,
			loggedAt: log.loggedAt,
			timestamp: log.loggedAt,
			source: "time_log",
			metadata: {
				taskTitle: log.task?.title,
				projectName: log.task?.project?.name,
				hours: log.hours,
			},
			isNew: new Date(log.loggedAt) > ONE_HOUR_AGO,
		})
	})

	return activities
}

/**
 * Transforms payroll records into activity objects
 */
function transformPayrollActivities(payrolls, employeeId) {
	const activities = []

	payrolls.forEach((payroll) => {
		const createdDate = new Date(payroll.createdAt)

		// Payroll generated event
		activities.push({
			type: "payroll_generated",
			title: `Payroll generated for ${payroll.payPeriodStart.toLocaleDateString()} - ${payroll.payPeriodEnd.toLocaleDateString()}`,
			description: `Amount: ${payroll.amount}`,
			amount: payroll.amount,
			paymentStatus: payroll.paymentStatus,
			payPeriodStart: payroll.payPeriodStart,
			payPeriodEnd: payroll.payPeriodEnd,
			timestamp: payroll.createdAt,
			source: "payroll",
			metadata: {
				amount: payroll.amount,
				status: payroll.paymentStatus,
				period: `${payroll.payPeriodStart.toLocaleDateString()} - ${payroll.payPeriodEnd.toLocaleDateString()}`,
			},
			isNew: createdDate > ONE_HOUR_AGO,
		})

		// Payroll status change event
		if (payroll.processedAt) {
			const processedDate = new Date(payroll.processedAt)
			activities.push({
				type: "payroll_status_changed",
				title: `Payroll marked as ${payroll.paymentStatus}`,
				description: `Amount: ${payroll.amount}`,
				amount: payroll.amount,
				paymentStatus: payroll.paymentStatus,
				timestamp: payroll.processedAt,
				source: "payroll",
				metadata: {
					amount: payroll.amount,
					status: payroll.paymentStatus,
				},
				isNew: processedDate > ONE_HOUR_AGO,
			})
		}
	})

	return activities
}

/**
 * Transforms project memberships into activity objects
 */
function transformProjectActivities(projects, employeeId) {
	const activities = []

	projects.forEach((project) => {
		// Check if employee was recently added to project
		const hasRecentTeamMember = project.teamMembers?.some((member) => {
			if (member.employeeId !== employeeId) return false
			const addedDate = new Date(member.assignedAt || project.createdAt)
			return addedDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
		})

		if (hasRecentTeamMember) {
			const teamMember = project.teamMembers?.find((m) => m.employeeId === employeeId)
			const timestamp = teamMember?.assignedAt || project.createdAt
			activities.push({
				type: "project_added",
				title: `Added to project: ${project.name}`,
				description: "",
				projectId: project.id,
				timestamp: new Date(timestamp),
				source: "project",
				metadata: {
					projectName: project.name,
					managerName: project.manager?.user?.email,
				},
				isNew: new Date(timestamp) > ONE_HOUR_AGO,
			})
		}
	})

	return activities
}

/**
 * Get all activities for an employee
 * Aggregates tasks, time logs, payroll, and project events
 */
async function getEmployeeActivities(employeeId, limit = 50) {
	try {
		// Fetch all relevant data in parallel
		const [tasks, timeLogs, payrolls, projectTeams] = await Promise.all([
			prisma.task.findMany({
				where: { employeeId },
				include: {
					project: {
						include: {
							manager: { include: { user: true } },
						},
					},
				},
				orderBy: { createdAt: "desc" },
			}),
			prisma.timeLog.findMany({
				where: { employeeId },
				include: {
					task: {
						include: {
							project: true,
						},
					},
				},
				orderBy: { loggedAt: "desc" },
			}),
			prisma.payroll.findMany({
				where: { employeeId },
				orderBy: { createdAt: "desc" },
			}),
			prisma.projectTeam.findMany({
				where: { employeeId },
				include: {
					project: {
						include: {
							manager: { include: { user: true } },
							teamMembers: true,
						},
					},
				},
				orderBy: { assignedAt: "desc" },
			}),
		])

		// Transform each data source into activities
		let activities = []

		tasks.forEach((task) => {
			activities = activities.concat(transformTaskActivities(task, employeeId))
		})

		timeLogs.forEach((log) => {
			activities = activities.concat(transformTimeLogActivities([log], employeeId))
		})

		payrolls.forEach((payroll) => {
			activities = activities.concat(transformPayrollActivities([payroll], employeeId))
		})

		const projects = projectTeams.map((pt) => pt.project)
		projects.forEach((project) => {
			activities = activities.concat(transformProjectActivities([project], employeeId))
		})

		// Remove duplicates based on type + id combination
		const uniqueActivities = []
		const seen = new Set()

		activities.forEach((activity) => {
			// Create a unique key for this activity
			const key = `${activity.type}_${activity.taskId || activity.projectId || activity.paymentStatus}_${Math.floor(activity.timestamp.getTime() / 1000)}`
			if (!seen.has(key)) {
				seen.add(key)
				uniqueActivities.push(activity)
			}
		})

		// Sort by timestamp (newest first)
		uniqueActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

		// Return limited results
		return uniqueActivities.slice(0, limit)
	} catch (error) {
		throw new Error(`Failed to fetch activities: ${error.message}`)
	}
}

/**
 * Get activity metrics for an employee
 * Aggregates summary statistics
 */
async function getEmployeeActivityMetrics(employeeId) {
	try {
		const today = new Date()
		const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
		const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

		const [tasks, timeLogs, payrolls, allTimeLogs] = await Promise.all([
			// Tasks due this week
			prisma.task.findMany({
				where: {
					employeeId,
					dueDate: {
						gte: today,
						lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
					},
					status: { not: "completed" },
				},
			}),

			// Time logs this week
			prisma.timeLog.findMany({
				where: {
					employeeId,
					loggedAt: { gte: weekStart },
				},
			}),

			// Pending payroll
			prisma.payroll.findMany({
				where: {
					employeeId,
					paymentStatus: "pending",
				},
			}),

			// All time logs for average calculation
			prisma.timeLog.findMany({
				where: { employeeId },
				orderBy: { loggedAt: "desc" },
				take: 50,
			}),
		])

		// Calculate total hours this week
		const totalHoursThisWeek = timeLogs.reduce((sum, log) => sum + Number(log.hours), 0)

		// Calculate average daily hours
		const daysCovered = new Set(timeLogs.map((log) => log.loggedAt.toDateString())).size || 1
		const averageDailyHours = (totalHoursThisWeek / daysCovered).toFixed(2)

		// Count overdue tasks
		const overdueTasks = tasks.filter((task) => new Date(task.dueDate) < today)

		// Calculate total pending payroll amount
		const totalPendingPayroll = payrolls.reduce((sum, p) => sum + Number(p.amount), 0)

		return {
			tasksDueThisWeek: tasks.length,
			overdueTasks: overdueTasks.length,
			totalHoursThisWeek: totalHoursThisWeek.toFixed(2),
			averageDailyHours,
			pendingPayrollAmount: totalPendingPayroll.toFixed(2),
			pendingPayrollCount: payrolls.length,
		}
	} catch (error) {
		throw new Error(`Failed to fetch activity metrics: ${error.message}`)
	}
}

module.exports = {
	getEmployeeActivities,
	getEmployeeActivityMetrics,
}

/**
 * Get activities across projects managed by a project manager
 */
async function getManagerActivities(managerId, limit = 50) {
	try {
		if (!Number.isInteger(managerId) || managerId <= 0) {
			return []
		}

		// Find projects managed by this manager (schema field: managerEmployeeId)
		const projects = await prisma.project.findMany({
			where: { managerEmployeeId: managerId },
			include: {
				manager: { include: { user: true } },
				teamMembers: true,
			},
		})
		const projectIds = projects.map((p) => p.id)

		// Fetch tasks for those projects
		const tasks = await prisma.task.findMany({
			where: { projectId: { in: projectIds } },
			include: {
				project: { include: { manager: { include: { user: true } } } },
			},
			orderBy: { createdAt: "desc" },
		})

		// Fetch time logs for tasks in these projects
		const timeLogs = await prisma.timeLog.findMany({
			where: {
				task: { projectId: { in: projectIds } },
			},
			include: {
				task: { include: { project: true } },
			},
			orderBy: { loggedAt: "desc" },
		})

		// Fetch project team entries
		const projectTeams = await prisma.projectTeam.findMany({
			where: { projectId: { in: projectIds } },
			include: {
				project: { include: { manager: { include: { user: true } }, teamMembers: true } },
			},
			orderBy: { assignedAt: "desc" },
		})

		// For manager view, payrolls can be for team members on projects
		const employeeIds = Array.from(new Set(projectTeams.map((pt) => pt.employeeId).filter(Boolean)))
		const payrolls = employeeIds.length
			? await prisma.payroll.findMany({ where: { employeeId: { in: employeeIds } }, orderBy: { createdAt: "desc" } })
			: []

		// Build activities using existing transforms
		let activities = []

		tasks.forEach((task) => {
			activities = activities.concat(transformTaskActivities(task, null))
		})

		timeLogs.forEach((log) => {
			activities = activities.concat(transformTimeLogActivities([log], null))
		})

		payrolls.forEach((payroll) => {
			activities = activities.concat(transformPayrollActivities([payroll], null))
		})

		const projectsList = projectTeams.map((pt) => pt.project)
		projectsList.forEach((project) => {
			activities = activities.concat(transformProjectActivities([project], null))
		})

		// Deduplicate and sort (reuse same logic)
		const uniqueActivities = []
		const seen = new Set()

		activities.forEach((activity) => {
			const key = `${activity.type}_${activity.taskId || activity.projectId || activity.paymentStatus}_${Math.floor(new Date(activity.timestamp).getTime() / 1000)}`
			if (!seen.has(key)) {
				seen.add(key)
				uniqueActivities.push(activity)
			}
		})

		uniqueActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

		return uniqueActivities.slice(0, limit)
	} catch (error) {
		throw new Error(`Failed to fetch manager activities: ${error.message}`)
	}
}

async function getManagerActivityMetrics(managerId) {
	try {
		if (!Number.isInteger(managerId) || managerId <= 0) {
			return {
				tasksDueThisWeek: 0,
				totalHoursThisWeek: "0.00",
				pendingPayrollAmount: "0.00",
				pendingPayrollCount: 0,
				projectsManaged: 0,
			}
		}

		// Find projects managed by this manager (schema field: managerEmployeeId)
		const projects = await prisma.project.findMany({ where: { managerEmployeeId: managerId } })
		const projectIds = projects.map((p) => p.id)

		const today = new Date()
		const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

		// Tasks due this week across manager's projects
		const tasksDue = await prisma.task.findMany({ where: { projectId: { in: projectIds }, dueDate: { gte: today, lte: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) }, status: { not: "completed" } } })

		// Time logs this week for tasks under these projects
		const timeLogs = await prisma.timeLog.findMany({ where: { task: { projectId: { in: projectIds } }, loggedAt: { gte: weekStart } } })

		// Pending payroll for employees on managed projects
		const projectTeams = await prisma.projectTeam.findMany({
			where: { projectId: { in: projectIds } },
			select: { employeeId: true },
		})
		const employeeIds = Array.from(new Set(projectTeams.map((pt) => pt.employeeId).filter(Boolean)))
		const pendingPayrolls = employeeIds.length
			? await prisma.payroll.findMany({
				where: {
					employeeId: { in: employeeIds },
					paymentStatus: "pending",
				},
			})
			: []

		const totalHoursThisWeek = timeLogs.reduce((sum, log) => sum + Number(log.hours), 0)
		const totalPendingPayroll = pendingPayrolls.reduce((sum, p) => sum + Number(p.amount), 0)

		return {
			tasksDueThisWeek: tasksDue.length,
			totalHoursThisWeek: totalHoursThisWeek.toFixed(2),
			pendingPayrollAmount: totalPendingPayroll.toFixed(2),
			pendingPayrollCount: pendingPayrolls.length,
			projectsManaged: projectIds.length,
		}
	} catch (error) {
		throw new Error(`Failed to fetch manager metrics: ${error.message}`)
	}
}

// Export manager functions
module.exports = {
	getEmployeeActivities,
	getEmployeeActivityMetrics,
	getManagerActivities,
	getManagerActivityMetrics,
}
