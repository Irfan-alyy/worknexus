const prisma = require("../../../config/db.config")
const AppError = require("../../../utils/app-error")
const {
  getProjectAccessContext,
  canAccessProjectScope,
  hasChannelMembership,
  canAccessChannel,
  assertCanManageChannel,
  assertProjectParticipantOrAdminHr,
} = require("../channel-permissions")

const CHANNEL_BASE_INCLUDE = {
  project: {
    select: {
      id: true,
      name: true,
      managerEmployeeId: true,
    },
  },
  _count: {
    select: {
      members: true,
      messages: true,
    },
  },
}

async function createChannel(payload, user) {
  const projectId = payload.project_id || null
  const isPrivate = Boolean(payload.is_private)
  const normalizedName = String(payload.name || "").trim()

  if (!normalizedName) {
    throw AppError.validationError("Invalid channel name", [
      { field: "name", message: "Channel name is required" },
    ])
  }

  if (!projectId) {
    const existingGlobal = await prisma.channel.findFirst({
      where: { projectId: null, name: normalizedName },
      select: { id: true },
    })

    if (existingGlobal) {
      throw AppError.conflict("A global channel with this name already exists")
    }
  }

  if (!projectId && !(user.role === "admin" || user.role === "hr")) {
    throw AppError.forbidden("Only admin or hr can create global channels")
  }

  if (projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } })
    if (!project) throw AppError.notFound("Project not found")

    const hasAccess = await canAccessProjectScope(projectId, user)
    if (!hasAccess) {
      throw AppError.forbidden("You can only create channels for your own projects")
    }
  }

  const rawMemberIds = Array.isArray(payload.member_user_ids) ? payload.member_user_ids : []
  const uniqueMemberIds = [...new Set(rawMemberIds.map(Number).filter(Boolean))]
  const memberIds = [...new Set([Number(user.id), ...uniqueMemberIds])]
  if (projectId && uniqueMemberIds.length > 0) {
    for (const memberUserId of memberIds) {
      await assertProjectParticipantOrAdminHr(projectId, memberUserId)
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const createdChannel = await tx.channel.create({
        data: {
          name: normalizedName,
          description: payload.description,
          projectId,
          isPrivate,
          createdByUserId: Number(user.id),
        },
        include: {
          ...CHANNEL_BASE_INCLUDE,
          members: {
            include: {
              user: { select: { id: true, email: true, role: true } },
            },
          },
        },
      })

      if (memberIds.length > 0) {
        await tx.channelMember.createMany({
          data: memberIds.map((memberUserId) => ({
            channelId: createdChannel.id,
            userId: memberUserId,
          })),
          skipDuplicates: true,
        })
      }

      const refreshed = await tx.channel.findUnique({
        where: { id: createdChannel.id },
        include: {
          ...CHANNEL_BASE_INCLUDE,
          members: {
            include: {
              user: { select: { id: true, email: true, role: true } },
            },
          },
        },
      })

      return {
        ...refreshed,
        currentUserIsMember: hasChannelMembership(refreshed, user.id),
      }
    })
  } catch (err) {
    if (err?.code === "P2002") {
      throw AppError.conflict("A channel with this name already exists in this scope")
    }
    throw err
  }
}

async function listChannelsForUser(user, options = {}) {
  const where = {}
  if (options.projectId) {
    where.projectId = options.projectId
  }

  const [channels, context] = await Promise.all([
    prisma.channel.findMany({
      where,
      include: {
        ...CHANNEL_BASE_INCLUDE,
        members: {
            select:{userId:true}
        },
      },
      orderBy: [{ projectId: "asc" }, { createdAt: "desc" }],
    }),
    getProjectAccessContext(user.id),
  ])

  // Determine which of these channels the current user is a member of (accurate even if preview doesn't contain them)
  const channelIds = channels.map((c) => c.id)
  const membershipRows = channelIds.length
    ? await prisma.channelMember.findMany({ where: { channelId: { in: channelIds }, userId: Number(user.id) }, select: { channelId: true } })
    : []
  const membershipSet = new Set(membershipRows.map((r) => r.channelId))
  const visibleChannels = []
  for (const channel of channels) {
    if (await canAccessChannel(channel, user, context)) {
      visibleChannels.push({
        ...channel,
        // members is now a small preview (up to 3) of member objects { userId, user: { id, email, role } }
        currentUserIsMember: membershipSet.has(channel.id),
      })
    }
  }
  return visibleChannels
}

async function getProjectChannels(projectId, user) {
  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } })
  if (!project) throw AppError.notFound("Project not found")

  const hasProjectAccess = await canAccessProjectScope(projectId, user)
  if (!hasProjectAccess) throw AppError.forbidden("You do not have access to this project")

  return await listChannelsForUser(user, { projectId })
}

async function getChannelById(channelId, user) {
  const channel = await prisma.channel.findUnique({
    where: { id: channelId },
    include: {
      ...CHANNEL_BASE_INCLUDE,
      members: {
        include: {
          user: { select: { id: true, email: true, role: true, employee:{
            select:{firstName:true,lastName:true}
          } } },
        },
      },
    },
  })

  if (!channel) throw AppError.notFound("Channel not found")

  const canAccess = await canAccessChannel(channel, user)
  if (!canAccess) throw AppError.forbidden("You do not have access to this channel")

  return {
    ...channel,
    currentUserIsMember: hasChannelMembership(channel, user.id),
  }
}

async function findOrCreateDM(receiverId, user) {
  const senderId = Number(user.id)
  const targetId = Number(receiverId)

  if (senderId === targetId) {
    throw AppError.validationError("Cannot create a DM with yourself", [
      { field: "receiverId", message: "Cannot DM self" }
    ])
  }

  // Ensure receiver exists
  const targetUser = await prisma.user.findUnique({ where: { id: targetId }, select: { id: true } })
  if (!targetUser) {
    throw AppError.notFound("Receiver not found")
  }

  // Generate deterministic channel name for 1-1 DM
  const sortedIds = [senderId, targetId].sort((a, b) => a - b)
  const dmName = `dm_${sortedIds[0]}_${sortedIds[1]}`

  // Try to find the existing DM
  let channel = await prisma.channel.findFirst({
    where: {
      name: dmName,
      isPrivate: true,
      projectId: null,
    }
  })

  if (!channel) {
    // Create new DM channel silently
    channel = await prisma.$transaction(async (tx) => {
      const created = await tx.channel.create({
        data: {
          name: dmName,
          description: "Direct Message",
          projectId: null,
          isPrivate: true,
          createdByUserId: senderId,
        }
      })

      // Add both members
      await tx.channelMember.createMany({
        data: [
          { channelId: created.id, userId: senderId },
          { channelId: created.id, userId: targetId }
        ]
      })

      return created
    })
  }

  // Use existing get function to fetch rich include payload
  return await getChannelById(channel.id, user)
}

async function updateChannel(channelId, payload, user) {
  const existing = await prisma.channel.findUnique({
    where: { id: channelId },
    include: {
      members: {
        where: { userId: Number(user.id) },
        select: { userId: true },
      },
    },
  })

  if (!existing) throw AppError.notFound("Channel not found")

  await assertCanManageChannel(existing, user)

  const updateData = {}
  if (payload.name !== undefined) {
    const nextName = String(payload.name).trim()
    if (!nextName) {
      throw AppError.validationError("Invalid channel name", [
        { field: "name", message: "Channel name is required" },
      ])
    }

    if (!existing.projectId) {
      const duplicate = await prisma.channel.findFirst({
        where: { projectId: null, name: nextName, NOT: { id: channelId } },
        select: { id: true },
      })
      if (duplicate) {
        throw AppError.conflict("A global channel with this name already exists")
      }
    }

    updateData.name = nextName
  }
  if (payload.description !== undefined) updateData.description = payload.description
  if (payload.is_private !== undefined) updateData.isPrivate = payload.is_private

  if (Object.keys(updateData).length === 0) {
    throw AppError.validationError("No updates provided", [{ field: "payload", message: "At least one field is required" }])
  }

  try {
    const updated = await prisma.channel.update({
      where: { id: channelId },
      data: updateData,
      include: {
        ...CHANNEL_BASE_INCLUDE,
        members: {
          include: { user: { select: { id: true, email: true, role: true } } },
        },
      },
    })

    return {
      ...updated,
      currentUserIsMember: hasChannelMembership(updated, user.id),
    }
  } catch (err) {
    if (err?.code === "P2002") {
      throw AppError.conflict("A channel with this name already exists in this scope")
    }
    throw err
  }
}

async function deleteChannel(channelId, user) {
  const existing = await prisma.channel.findUnique({ where: { id: channelId } })
  if (!existing) throw AppError.notFound("Channel not found")

  await assertCanManageChannel(existing, user)

  await prisma.channel.delete({ where: { id: channelId } })
  return { id: channelId, deleted: true }
}

async function listChannelMembers(channelId, user) {
  const channel = await getChannelById(channelId, user)
  const members = await prisma.channelMember.findMany({
    where: { channelId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { addedAt: "asc" },
  })

  return {
    channel: {
      id: channel.id,
      name: channel.name,
      isPrivate: channel.isPrivate,
    },
    members,
  }
}

async function addChannelMembers(channelId, targetUserIds, user) {
  const channel = await prisma.channel.findUnique({ where: { id: channelId } })
  if (!channel) throw AppError.notFound("Channel not found")

  await assertCanManageChannel(channel, user)

  if (channel.projectId) {
    for (const userId of targetUserIds) {
      await assertProjectParticipantOrAdminHr(channel.projectId, userId)
    }
  } else {
    const target = await prisma.user.findUnique({ where: { id: Number(targetUserId) }, select: { id: true } })
    if (!target) throw AppError.notFound("User not found")
  }

  try {
    const created = await prisma.channelMember.create({
      data: {
        channelId,
        userId: Number(targetUserId),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    })
    return created
  } catch (err) {
    if (err?.code === "P2002") {
      throw AppError.conflict("User is already a member of this channel")
    }
    throw err
  }
}

async function addChannelMembers(channelId, targetUserIds = [], user) {
  if (!Array.isArray(targetUserIds) || targetUserIds.length === 0) return []

  const channel = await prisma.channel.findUnique({ where: { id: channelId } })
  if (!channel) throw AppError.notFound("Channel not found")

  await assertCanManageChannel(channel, user)

  const uniqueIds = [...new Set(targetUserIds.map(Number).filter(Boolean))]
  if (uniqueIds.length === 0) return []

  if (channel.projectId) {
    for (const memberUserId of uniqueIds) {
      await assertProjectParticipantOrAdminHr(channel.projectId, memberUserId)
    }
  } else {
    // ensure users exist
    const users = await prisma.user.findMany({ where: { id: { in: uniqueIds } }, select: { id: true } })
    const foundIds = new Set(users.map((u) => u.id))
    for (const id of uniqueIds) {
      if (!foundIds.has(id)) throw AppError.notFound(`User not found: ${id}`)
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.channelMember.createMany({
        data: uniqueIds.map((memberUserId) => ({ channelId, userId: memberUserId })),
        skipDuplicates: true,
      })

      const members = await tx.channelMember.findMany({
        where: { channelId, userId: { in: uniqueIds } },
        include: { user: { select: { id: true, email: true, role: true } } },
      })

      return members
    })
  } catch (err) {
    throw err
  }
}

async function removeChannelMember(channelId, targetUserId, user) {
  const channel = await prisma.channel.findUnique({ where: { id: channelId } })
  if (!channel) throw AppError.notFound("Channel not found")

  await assertCanManageChannel(channel, user)

  if (Number(targetUserId) === Number(channel.createdByUserId)) {
    throw AppError.validationError("Cannot remove channel creator", [
      { field: "user_id", message: "Channel creator must remain a member" },
    ])
  }

  try {
    const removed = await prisma.channelMember.delete({
      where: {
        channelId_userId: {
          channelId,
          userId: Number(targetUserId),
        },
      },
    })
    return removed
  } catch (err) {
    if (err?.code === "P2025") {
      throw AppError.notFound("Channel member not found")
    }
    throw err
  }
}

module.exports = {
  createChannel,
  listChannelsForUser,
  getProjectChannels,
  getChannelById,
  findOrCreateDM,
  updateChannel,
  deleteChannel,
  listChannelMembers,
  addChannelMembers,
  removeChannelMember,
}