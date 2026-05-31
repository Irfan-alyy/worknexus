const prisma = require("../../config/db.config")

const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000)
const ONE_DAY_MS = 24 * 60 * 60 * 1000

function startOfToday() {
	const now = new Date()
	const start = new Date(now)
	start.setHours(0, 0, 0, 0)
	return start
}

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
			console.log("Calculating month start for date range filter", new Date(now.getFullYear(), now.getMonth(), 1))
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

function applyActivityFilters(activities, filters = {}) {
	const { type, dateRange, status } = filters

	return activities.filter((activity) => {
		return (
			matchesTypeFilter(activity, type) &&
			matchesDateRangeFilter(activity, dateRange) &&
			matchesStatusFilter(activity, status)
		)
	})
}

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

		const [tasks, timeLogs, payrolls, allTimeLogs, projectTeams] = await Promise.all([
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
			prisma.projectTeam.findMany({
				where: { employeeId },
				include: { project: true },
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

		// total timelogs logged
		const totalTimeLogs = allTimeLogs.length

		// assigned projects
		const assignedProjects = new Set(projectTeams.map((pt) => pt.projectId)).size

		return {
			tasksDueThisWeek: tasks.length,
			overdueTasks: overdueTasks.length,
			totalHoursThisWeek: totalHoursThisWeek.toFixed(2),
			averageDailyHours,
			pendingPayrollAmount: totalPendingPayroll.toFixed(2),
			pendingPayrollCount: payrolls.length,
			totalTimeLogs,
			assignedProjects
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

/**
 * Transforms employee-related events for HR/Admin
 * Captures hiring, onboarding, role/status changes
 */
function transformEmployeeActivities(employees) {
	const activities = []
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

	employees.forEach((emp) => {
		const createdDate = new Date(emp.createdAt)

		// Employee hired/created event
		if (createdDate > thirtyDaysAgo) {
			activities.push({
				type: "employee_created",
				title: `New employee: ${emp.firstName} ${emp.lastName}`,
				description: `Department: ${emp.department?.name || "Unassigned"}`,
				employeeId: emp.id,
				timestamp: emp.createdAt,
				source: "employee",
				metadata: {
					employeeName: `${emp.firstName} ${emp.lastName}`,
					department: emp.department?.name,
					email: emp.user?.email,
					paymentModel: emp.paymentModel,
				},
				isNew: createdDate > ONE_HOUR_AGO,
			})
		}

		// Employee updated event (department or payment model change)
		const updatedDate = new Date(emp.updatedAt)
		if (updatedDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && updatedDate !== createdDate) {
			activities.push({
				type: "employee_updated",
				title: `Employee profile updated: ${emp.firstName} ${emp.lastName}`,
				description: `Last updated: ${new Date(emp.updatedAt).toLocaleDateString()}`,
				employeeId: emp.id,
				timestamp: emp.updatedAt,
				source: "employee",
				metadata: {
					employeeName: `${emp.firstName} ${emp.lastName}`,
					department: emp.department?.name,
				},
				isNew: false,
			})
		}
	})

	return activities
}

/**
 * Transforms client-related events for Admin
 */
function transformClientActivities(clients) {
	const activities = []
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

	clients.forEach((client) => {
		const createdDate = new Date(client.createdAt)

		// Client created event
		if (createdDate > thirtyDaysAgo) {
			activities.push({
				type: "client_created",
				title: `New client: ${client.name}`,
				description: `Company: ${client.company || "N/A"}, Email: ${client.email}`,
				clientId: client.id,
				timestamp: client.createdAt,
				source: "client",
				metadata: {
					clientName: client.name,
					company: client.company,
					email: client.email,
				},
				isNew: createdDate > ONE_HOUR_AGO,
			})
		}
	})

	return activities
}

/**
 * Transforms department-related events for HR/Admin
 */
function transformDepartmentActivities(departments) {
	const activities = []
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

	departments.forEach((dept) => {
		const createdDate = new Date(dept.createdAt)

		// Department created event
		if (createdDate > thirtyDaysAgo) {
			const employeeCount = dept.employees?.length || 0
			activities.push({
				type: "department_created",
				title: `New department: ${dept.name}`,
				description: `Team members: ${employeeCount}`,
				departmentId: dept.id,
				timestamp: dept.createdAt,
				source: "department",
				metadata: {
					departmentName: dept.name,
					teamSize: employeeCount,
				},
				isNew: createdDate > ONE_HOUR_AGO,
			})
		}
	})

	return activities
}

/**
 * Transforms user/manager-related events for Admin
 */
function transformUserActivities(users) {
	const activities = []
	const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

	users.forEach((user) => {
		const createdDate = new Date(user.createdAt)

		// User created event (focus on managers and admins)
		if (createdDate > thirtyDaysAgo && (user.role === "admin" || user.role === "pm" || user.role === "hr")) {
			activities.push({
				type: "user_created",
				title: `New ${user.role} user created`,
				description: `Email: ${user.email}`,
				userId: user.id,
				timestamp: user.createdAt,
				source: "user",
				metadata: {
					email: user.email,
					role: user.role,
				},
				isNew: createdDate > ONE_HOUR_AGO,
			})
		}
	})

	return activities
}

/**
 * Get all activities for HR dashboard
 * Aggregates employee, payroll, department, project, task, and timelog events
 */
async function getHRActivities(limit = 50, filters = {}) {
	try {
		const sourceTake = filters?.dateRange && filters.dateRange !== "all" ? 1000 : 100

		// Fetch all relevant data in parallel
		const [employees, payrolls, departments, projects, tasks, timeLogs] = await Promise.all([
			prisma.employee.findMany({
				include: {
					user: true,
					department: { include: { employees: true } },
				},
				orderBy: { createdAt: "desc" },
				take: sourceTake,
			}),
			prisma.payroll.findMany({
				include: { employee: { include: { user: true, department: true } } },
				orderBy: { createdAt: "desc" },
				take: sourceTake,
			}),
			prisma.department.findMany({
				include: { employees: true },
				orderBy: { createdAt: "desc" },
				take: sourceTake,
			}),
			prisma.project.findMany({
				include: { client: true, manager: { include: { user: true } }, teamMembers: true },
				orderBy: { createdAt: "desc" },
				take: sourceTake,
			}),
			prisma.task.findMany({
				include: { project: true, employee: true },
				orderBy: { createdAt: "desc" },
				take: sourceTake,
			}),
			prisma.timeLog.findMany({
				include: { task: { include: { project: true } }, employee: { include: { department: true } } },
				orderBy: { loggedAt: "desc" },
				take: sourceTake,
			}),
		])

		// Transform each data source into activities
		let activities = []

		// Employee activities
		activities = activities.concat(transformEmployeeActivities(employees))

		// Payroll activities
		payrolls.forEach((payroll) => {
			activities = activities.concat(transformPayrollActivities([payroll], payroll.employeeId))
		})

		// Department activities
		activities = activities.concat(transformDepartmentActivities(departments))

		// Project activities (focus on creation and team assignments)
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		projects.forEach((project) => {
			const createdDate = new Date(project.createdAt)
			if (createdDate > thirtyDaysAgo) {
				activities.push({
					type: "project_created",
					title: `New project: ${project.name}`,
					description: `Client: ${project.client?.name}, Status: ${project.status}`,
					projectId: project.id,
					timestamp: project.createdAt,
					source: "project",
					metadata: {
						projectName: project.name,
						clientName: project.client?.name,
						status: project.status,
						manager: project.manager?.user?.email,
					},
					isNew: createdDate > ONE_HOUR_AGO,
				})
			}
		})

		// Task activities
		tasks.forEach((task) => {
			const createdDate = new Date(task.createdAt)
			if (createdDate > thirtyDaysAgo && task.priority === "critical") {
				activities = activities.concat(transformTaskActivities(task, task.employeeId))
			}
		})

		// TimeLog summaries (daily/weekly)
		const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
		const weeklyLogs = timeLogs.filter((log) => new Date(log.loggedAt) > thisWeek)
		if (weeklyLogs.length > 0) {
			const totalHours = weeklyLogs.reduce((sum, log) => sum + Number(log.hours), 0)
			const uniqueEmployees = new Set(weeklyLogs.map((log) => log.employeeId))
			activities.push({
				type: "time_logs_summary",
				title: `Weekly time logs summary`,
				description: `${totalHours.toFixed(1)} hours logged by ${uniqueEmployees.size} employees this week`,
				timestamp: new Date(),
				source: "time_log",
				metadata: {
					totalHours: totalHours.toFixed(1),
					employeeCount: uniqueEmployees.size,
					weekStart: thisWeek.toLocaleDateString(),
				},
				isNew: false,
			})
		}

		// Remove duplicates based on type + id combination
		const uniqueActivities = []
		const seen = new Set()

		activities.forEach((activity) => {
			const key = `${activity.type}_${activity.employeeId || activity.projectId || activity.departmentId || activity.clientId || "summary"}_${Math.floor(new Date(activity.timestamp).getTime() / 1000)}`
			if (!seen.has(key)) {
				seen.add(key)
				uniqueActivities.push(activity)
			}
		})

		// Sort by timestamp (newest first)
		uniqueActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

		const filteredActivities = applyActivityFilters(uniqueActivities, filters)

		// Return limited results
		return filteredActivities.slice(0, limit)
	} catch (error) {
		throw new Error(`Failed to fetch HR activities: ${error.message}`)
	}
}

/**
 * Get all activities for Admin dashboard
 * Aggregates employee, client, project, task, payroll, department, and user events
 */
async function getAdminActivities(limit = 50, filters = {}) {
	try {
		const sourceTake = filters?.dateRange && filters.dateRange !== "all" ? 1000 : 100

		// Fetch all relevant data in parallel
		const [employees, clients, projects, tasks, payrolls, departments, users] = await Promise.all([
			prisma.employee.findMany({
				include: { user: true, department: true },
				orderBy: { createdAt: "desc" },
				take: sourceTake,
			}),
			prisma.client.findMany({
				orderBy: { createdAt: "desc" },
				take: sourceTake,
			}),
			prisma.project.findMany({
				include: { client: true, manager: { include: { user: true } }, teamMembers: true },
				orderBy: { createdAt: "desc" },
				take: sourceTake,
			}),
			prisma.task.findMany({
				include: { project: true, employee: true },
				orderBy: { createdAt: "desc" },
				take: sourceTake,
			}),
			prisma.payroll.findMany({
				include: { employee: { include: { user: true } } },
				orderBy: { createdAt: "desc" },
				take: sourceTake,
			}),
			prisma.department.findMany({
				include: { employees: true },
				orderBy: { createdAt: "desc" },
				take: sourceTake,
			}),
			prisma.user.findMany({
				orderBy: { createdAt: "desc" },
				take: sourceTake,
			}),
		])

		// Transform each data source into activities
		let activities = []

		// Employee activities
		activities = activities.concat(transformEmployeeActivities(employees))

		// Client activities
		activities = activities.concat(transformClientActivities(clients))

		// Project activities
		projects.forEach((project) => {
			const createdDate = new Date(project.createdAt)
			const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
			if (createdDate > thirtyDaysAgo) {
				activities.push({
					type: "project_created",
					title: `New project: ${project.name}`,
					description: `Client: ${project.client?.name}, Status: ${project.status}`,
					projectId: project.id,
					timestamp: project.createdAt,
					source: "project",
					metadata: {
						projectName: project.name,
						clientName: project.client?.name,
						status: project.status,
						manager: project.manager?.user?.email,
						teamSize: project.teamMembers?.length || 0,
					},
					isNew: createdDate > ONE_HOUR_AGO,
				})
			}

			// Project status changes (updated recently)
			const updatedDate = new Date(project.updatedAt)
			const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
			if (updatedDate > oneWeekAgo && updatedDate !== createdDate) {
				activities.push({
					type: "project_updated",
					title: `Project status updated: ${project.name}`,
					description: `Status: ${project.status}`,
					projectId: project.id,
					timestamp: project.updatedAt,
					source: "project",
					metadata: {
						projectName: project.name,
						status: project.status,
					},
					isNew: false,
				})
			}
		})

		// Task activities (critical tasks only)
		tasks.forEach((task) => {
			const createdDate = new Date(task.createdAt)
			const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
			if (createdDate > thirtyDaysAgo && task.priority === "critical") {
				activities = activities.concat(transformTaskActivities(task, task.employeeId))
			}
		})

		// Payroll activities
		payrolls.forEach((payroll) => {
			activities = activities.concat(transformPayrollActivities([payroll], payroll.employeeId))
		})

		// Department activities
		activities = activities.concat(transformDepartmentActivities(departments))

		// User/Manager activities
		activities = activities.concat(transformUserActivities(users))

		// Admin summary: Total entities count
		activities.push({
			type: "admin_summary",
			title: `Company overview`,
			description: `${employees.length} employees, ${clients.length} clients, ${projects.length} projects`,
			timestamp: new Date(),
			source: "system",
			metadata: {
				employeeCount: employees.length,
				clientCount: clients.length,
				projectCount: projects.length,
				departmentCount: departments.length,
			},
			isNew: false,
		})

		// Remove duplicates based on type + id combination
		const uniqueActivities = []
		const seen = new Set()

		activities.forEach((activity) => {
			const key = `${activity.type}_${activity.employeeId || activity.projectId || activity.clientId || activity.departmentId || activity.userId || "summary"}_${Math.floor(new Date(activity.timestamp).getTime() / 1000)}`
			if (!seen.has(key)) {
				seen.add(key)
				uniqueActivities.push(activity)
			}
		})

		// Sort by timestamp (newest first)
		uniqueActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

		const filteredActivities = applyActivityFilters(uniqueActivities, filters)

		// Return limited results
		return filteredActivities.slice(0, limit)
	} catch (error) {
		throw new Error(`Failed to fetch admin activities: ${error.message}`)
	}
}

/**
 * Get activity metrics for HR dashboard
 * Aggregates summary statistics: employees, payroll, departments, projects, tasks, time logs
 */
async function getHRActivityMetrics() {
	try {
		const today = new Date()
		const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
		const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

		const [
			totalEmployees,
			newEmployeesThisMonth,
			departmentCount,
			projectCount,
			tasksDueThisWeek,
			timeLogs,
			pendingPayrolls,
		] = await Promise.all([
			// Total employees
			prisma.employee.count(),

			// New employees this month
			prisma.employee.count({
				where: {
					createdAt: { gte: monthStart },
				},
			}),

			// Total departments
			prisma.department.count(),

			// Total projects
			prisma.project.count(),

			// Tasks due this week (all projects)
			prisma.task.findMany({
				where: {
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
					loggedAt: { gte: weekStart },
				},
			}),

			// Pending payroll
			prisma.payroll.findMany({
				where: {
					paymentStatus: "pending",
				},
			}),
		])

		const totalHoursThisWeek = timeLogs.reduce((sum, log) => sum + Number(log.hours), 0)
		const totalPendingPayroll = pendingPayrolls.reduce((sum, p) => sum + Number(p.amount), 0)

		return {
			totalEmployees,
			newEmployeesThisMonth,
			departmentCount,
			projectCount,
			tasksDueThisWeek: tasksDueThisWeek.length,
			totalHoursThisWeek: totalHoursThisWeek.toFixed(2),
			pendingPayrollAmount: totalPendingPayroll.toFixed(2),
			pendingPayrollCount: pendingPayrolls.length,
		}
	} catch (error) {
		throw new Error(`Failed to fetch HR activity metrics: ${error.message}`)
	}
}

/**
 * Get activity metrics for Admin dashboard
 * Aggregates summary statistics: employees, clients, projects, payroll, tasks
 */
async function getAdminActivityMetrics() {
	try {
		const today = new Date()
		const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
		const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

		const [
			totalManagers, 
			totalEmployees,
			newEmployeesThisMonth,
			clientCount,
			projectCount,
			tasksDueThisWeek,
			timeLogs,
			pendingPayrolls,
		] = await Promise.all([
			prisma.user.count({
				where: {
					role: { in: ["pm", "hr"] }
				}
			}),
			// Total employees
			prisma.employee.count(),

			// New employees this month
			prisma.employee.count({
				where: {
					createdAt: { gte: monthStart },
				},
			}),

			// Total clients
			prisma.client.count(),

			// Total projects
			prisma.project.count(),

			// Tasks due this week (all projects)
			prisma.task.findMany({
				where: {
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
					loggedAt: { gte: weekStart },
				},
			}),

			// Pending payroll
			prisma.payroll.findMany({
				where: {
					paymentStatus: "pending",
				},
			}),
		])

		const totalHoursThisWeek = timeLogs.reduce((sum, log) => sum + Number(log.hours), 0)
		const totalPendingPayroll = pendingPayrolls.reduce((sum, p) => sum + Number(p.amount), 0)

		return {
			totalManagers,
			totalEmployees,
			newEmployeesThisMonth,
			clientCount,
			projectCount,
			tasksDueThisWeek: tasksDueThisWeek.length,
			totalHoursThisWeek: totalHoursThisWeek.toFixed(2),
			pendingPayrollAmount: totalPendingPayroll.toFixed(2),
			pendingPayrollCount: pendingPayrolls.length,
		}
	} catch (error) {
		throw new Error(`Failed to fetch admin activity metrics: ${error.message}`)
	}
}

// Export manager functions
module.exports = {
	getEmployeeActivities,
	getEmployeeActivityMetrics,
	getManagerActivities,
	getManagerActivityMetrics,
	getHRActivities,
	getAdminActivities,
	getHRActivityMetrics,
	getAdminActivityMetrics,
}
