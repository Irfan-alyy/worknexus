const prisma = require("../../config/db.config")
const AppError = require("../../utils/app-error")
const { log } = require("../../utils/logger")

function mapEmployeeSummary(employee) {
  if (!employee) return null

  return {
    id: employee.id,
    firstName: employee.firstName,
    lastName: employee.lastName,
    user: employee.user
      ? {
          id: employee.user.id,
          email: employee.user.email,
          role: employee.user.role,
        }
      : undefined,
  }
}

function mapTaskSummary(task) {
  if (!task) return null

  const totalHours = Array.isArray(task.timeLogs)
    ? task.timeLogs.reduce((sum, entry) => sum + Number(entry?.hours || 0), 0)
    : 0

  return {
    id: task.id,
    projectId: task.projectId,
    employeeId: task.employeeId,
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    completedAt: task.completedAt,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    totalHours,
    employee: mapEmployeeSummary(task.employee),
  }
}

async function syncPrivateProjectChannelMemberships(projectId, employeeIds, action) {
  const channels = await prisma.channel.findMany({
    where: { projectId, isPrivate: true },
    select: { id: true },
  })

  if (!channels.length) return

  const channelIds = channels.map((channel) => channel.id)
  // Normalize employeeIds to an array
  const ids = Array.isArray(employeeIds) ? employeeIds.map(Number) : [Number(employeeIds)]

  if (action === "add") {
    // Create a channel member entry for each combination of channel and employee
    const data = []
    for (const channelId of channelIds) {
      for (const employeeId of ids) {
        const user = await prisma.employee.findUnique({
          where: { id: employeeId },
          select: { userId: true },
        })
        if (user) {
          data.push({
            channelId,
            userId: user.userId,
          })
        }
      }
    }
    if (data.length > 0) {
      await prisma.channelMember.createMany({
        data,
        skipDuplicates: true,
      })
    }
    return
  }

  if (action === "remove") {
    // Find userIds from employeeIds
    const employees = await prisma.employee.findMany({
      where: { id: { in: ids } },
      select: { userId: true },
    })
    const userIds = employees.map((e) => e.userId)

    await prisma.channelMember.deleteMany({
      where: {
        channelId: { in: channelIds },
        userId: { in: userIds },
      },
    })
  }
}

async function getEmployeeByUserId(userId) {
  if (!userId) return null
  return await prisma.employee.findUnique({ where: { userId: Number(userId) } })
}

async function getEmployeeById(id) {
  try {
    return await prisma.employee.findUnique({ where: { id: Number(id) }, include: { user: { select: { id: true, email: true, role: true } } } })
  } catch (err) {
    throw new AppError("Failed to fetch employee", 500, false)
  }
}

async function listProjects(user) {
  try {
    if (!user) throw AppError.unauthorized()

    if (user.role === "admin" || user.role === "hr") {
      return await prisma.project.findMany({
        include: {
          client: true,
          manager: {
            include: {
              user: { select: { id: true, email: true, role: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      })
    }

    // resolve employee
    const employee = await getEmployeeByUserId(user.id)
    if (!employee) return []

    if (user.role === "pm") {
      return await prisma.project.findMany({
        where: { managerEmployeeId: employee.id },
        include: {
          client: true,
          manager: {
            include: {
              user: { select: { id: true, email: true, role: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      })
    }

    // employee
    return await prisma.project.findMany({
      where: { teamMembers: { some: { employeeId: employee.id } } },
      include: {
        client: true,
        manager: {
          include: {
            user: { select: { id: true, email: true, role: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })
  } catch (err) {
    log("error", "projects.service listProjects error", { message: err?.message, stack: err?.stack })
    throw new AppError("Failed to list projects", 500, false)
  }
}

async function getProjectById(id) {
  try {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        manager: {
          include: {
            user: { select: { id: true, email: true, role: true } },
          },
        },
        teamMembers: {
          include: {
            employee: {
              include: {
                user: { select: { id: true, email: true, role: true } },
              },
            },
          },
        },
        tasks: {
          orderBy: { createdAt: "desc" },
          take: 5,
          include: {
            employee: {
              include: {
                user: { select: { id: true, email: true, role: true } },
              },
            },
          },
        },
      },
    })
  } catch (err) {
    console.log("Error in getProjectById:", err)
    throw new AppError("Failed to fetch project", 500, false)
  }
}

async function listProjectTasks(projectId, { page = 1, limit = 5 } = {}) {
  try {
    const safePage = Math.max(1, Number(page) || 1)
    const safeLimit = Math.min(20, Math.max(1, Number(limit) || 5))
    const skip = (safePage - 1) * safeLimit

    const [total, tasks] = await Promise.all([
      prisma.task.count({ where: { projectId } }),
      prisma.task.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
        skip,
        take: safeLimit,
        include: {
          employee: {
            include: {
              user: { select: { id: true, email: true, role: true } },
            },
          },
          timeLogs: {
            select: { hours: true },
          },
        },
      }),
    ])

    const mappedTasks = tasks.map(mapTaskSummary).filter(Boolean)

    return {
      tasks: mappedTasks,
      page: safePage,
      limit: safeLimit,
      total,
      hasMore: skip + mappedTasks.length < total,
    }
  } catch (err) {
    log("error", "projects.service listProjectTasks error", { message: err?.message, stack: err?.stack })
    throw new AppError("Failed to list project tasks", 500, false)
  }
}

async function createProject(data) {
  try {
    const createData = {
      name: data.name,
      description: data.description,
      status: data.status,
      clientId: data.client_id,
      managerEmployeeId: data.manager_employee_id,
    }

    const created = await prisma.project.create({ data: createData })
    return created
  } catch (err) {
    log("error", "projects.service createProject error", { message: err?.message, stack: err?.stack })
    if (err && err.code === "P2003") {
      throw new AppError("Invalid client or manager selected", 400, true)
    }
    if (err && err.code === "P2002") {
      throw AppError.conflict("Unique constraint violation")
    }
    throw new AppError("Failed to create project", 500, false)
  }
}

async function updateProject(id, data) {
  try {
    const updateData = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.status !== undefined) updateData.status = data.status
    if (data.client_id !== undefined) updateData.clientId = data.client_id
    if (data.manager_employee_id !== undefined) updateData.managerEmployeeId = data.manager_employee_id

    const updated = await prisma.project.update({ where: { id }, data: updateData })
    return updated
  } catch (err) {
    console.log("Error in updateProject:", err)
    if (err && err.code === "P2025") {
      throw AppError.notFound("Project not found")
    }
    throw new AppError("Failed to update project", 500, false)
  }
}

async function addTeamMember(projectId, employeeIds) {
  try {
    // ensure project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } })
    if (!project) throw AppError.notFound("Project not found")

    // ensure employee exists
    const employees = await prisma.employee.findMany({ where: { id: { in: employeeIds.map(Number) } } })
    if (employees.length !== employeeIds.length) throw AppError.notFound("One or more employees not found")
    
    const created = await prisma.projectTeam.createMany({ data: employeeIds.map(id => ({ projectId, employeeId: Number(id) })) })
    await syncPrivateProjectChannelMemberships(projectId, employeeIds.map(Number), "add")
    return created
  } catch (err) {
    console.log("Error in addTeamMember:", err)
    if (err && err.code === "P2002") {
      throw AppError.conflict("Employee already assigned to project")
    }
    if (err?.statusCode) throw err
    throw new AppError("Failed to add team member", 500, false)
  }
}

async function removeTeamMember(projectId, employeeId) {
  try {
    const deleted = await prisma.projectTeam.delete({ where: { projectId_employeeId: { projectId, employeeId: Number(employeeId) } } })
    await syncPrivateProjectChannelMemberships(projectId, Number(employeeId), "remove")
    return deleted
  } catch (err) {
    if (err && err.code === "P2025") {
      throw AppError.notFound("Team membership not found")
    }
    throw new AppError("Failed to remove team member", 500, false)
  }
}

async function listProjectTeam(projectId) {
  try {
    return await prisma.projectTeam.findMany({ where: { projectId }, include: { employee: { include: { user: { select: { id: true, email: true, role: true } } } } } })
  } catch (err) {
    throw new AppError("Failed to list project team", 500, false)
  }
}

async function isTeamMember(projectId, userId) {
  const employee = await getEmployeeByUserId(userId)
  if (!employee) return false
  const membership = await prisma.projectTeam.findUnique({ where: { projectId_employeeId: { projectId, employeeId: employee.id } } })
  return Boolean(membership)
}

async function isProjectManager(projectId, userId) {
  const employee = await getEmployeeByUserId(userId)
  if (!employee) return false
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return false
  return project.managerEmployeeId === employee.id
}

module.exports = {
  listProjects,
  getProjectById,
  listProjectTasks,
  createProject,
  updateProject,
  addTeamMember,
  removeTeamMember,
  listProjectTeam,
  getEmployeeByUserId,
  getEmployeeById,
  isTeamMember,
  isProjectManager,
  mapTaskSummary,
}
