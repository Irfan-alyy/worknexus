const prisma = require("../../config/db.config")
const AppError = require("../../utils/app-error")
const { getEmployeeByUserId, isProjectManager, isTeamMember } = require("../projects/projects.service")

async function getProjectAccessContext(userId) {
  const employee = await getEmployeeByUserId(userId)
  if (!employee) {
    return {
      employeeId: null,
      managedProjectIds: new Set(),
      teamProjectIds: new Set(),
    }
  }

  const [managed, teamMemberships] = await Promise.all([
    prisma.project.findMany({
      where: { managerEmployeeId: employee.id },
      select: { id: true },
    }),
    prisma.projectTeam.findMany({
      where: { employeeId: employee.id },
      select: { projectId: true },
    }),
  ])

  return {
    employeeId: employee.id,
    managedProjectIds: new Set(managed.map((project) => project.id)),
    teamProjectIds: new Set(teamMemberships.map((membership) => membership.projectId)),
  }
}

async function canAccessProjectScope(projectId, user) {
  if (user.role === "admin" || user.role === "hr") return true
  if (user.role === "pm") return await isProjectManager(projectId, user.id)
  return await isTeamMember(projectId, user.id)
}

function hasChannelMembership(channel, userId) {
  return channel.members?.some((member) => member.userId === Number(userId))
}

// Backward-compatible alias; membership checks are not tied to privacy anymore.
const hasPrivateMembership = hasChannelMembership

async function canAccessChannel(channel, user, context = null) {

  if (channel.isPrivate) {
    return hasPrivateMembership(channel, user.id)
  }

  // For non-private channels, check membership or project access for all roles
  // Global (non-project) channels: require membership for all roles
  if (!channel.projectId) {
    return hasChannelMembership(channel, user.id)
  }

  // Project-scoped channels: check project access
  if (user.role === "admin" || user.role === "hr") {
    // Admin/HR can access any project-scoped channel
    return await isTeamMember(channel.projectId, user.id)
  }

  if (context) {
    if (context.managedProjectIds.has(channel.projectId)) return true
    if (context.teamProjectIds.has(channel.projectId)) return true
    return false
  }

  const manager = await isProjectManager(channel.projectId, user.id)
  if (manager) return true
  return await isTeamMember(channel.projectId, user.id)
}

async function assertCanManageChannel(channel, user) {
  if (user.role === "admin" || user.role === "hr") return

  if (user.role === "pm" && channel.projectId) {
    const manager = await isProjectManager(channel.projectId, user.id)
    if (manager) return
  }

  throw AppError.forbidden("You do not have permission to manage this channel")
}

async function assertProjectParticipantOrAdminHr(projectId, targetUserId) {
  const target = await prisma.user.findUnique({
    where: { id: Number(targetUserId) },
    select: { id: true, role: true },
  })

  if (!target) {
    throw AppError.notFound("User not found")
  }

  if (target.role === "admin" || target.role === "hr") {
    return target
  }

  const employee = await getEmployeeByUserId(target.id)
  if (!employee) {
    throw AppError.validationError("Invalid channel member", [
      { field: "user_id", message: "User is not eligible for this project channel" },
    ])
  }

  const [project, membership] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      select: { managerEmployeeId: true },
    }),
    prisma.projectTeam.findUnique({
      where: {
        projectId_employeeId: {
          projectId,
          employeeId: employee.id,
        },
      },
    }),
  ])

  const isManager = project?.managerEmployeeId === employee.id
  if (!isManager && !membership) {
    throw AppError.validationError("Invalid channel member", [
      { field: "user_id", message: "User must belong to this project team" },
    ])
  }

  return target
}

module.exports = {
  getProjectAccessContext,
  canAccessProjectScope,
  hasChannelMembership,
  hasPrivateMembership,
  canAccessChannel,
  assertCanManageChannel,
  assertProjectParticipantOrAdminHr,
}