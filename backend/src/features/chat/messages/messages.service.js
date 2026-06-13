const prisma = require("../../../config/db.config")
const AppError = require("../../../utils/app-error")
const { getChannelById } = require("../channels/channels.service")

const normalizeListLimit = (value, fallback = 10) => {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) return fallback
  return Math.min(parsed, 100)
}

async function listChannelMessages(channelId, user, options = {}) {
  await getChannelById(channelId, user)

  const limit = normalizeListLimit(options.limit, 50)
  const where = { channelId }

  if (options.before) {
    const before = new Date(options.before)
    if (Number.isNaN(before.getTime())) {
      throw AppError.validationError("Invalid before cursor", [
        { field: "before", message: "Must be a valid ISO datetime" },
      ])
    }
    where.createdAt = { lt: before }
  }

  const messages = await prisma.message.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          employee:{
            select: {
              firstName: true,
              lastName: true,
            }
          }
        },
      },
      reactions: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  })

  return {
    channelId,
    messages: messages.reverse(),
  }
}

async function createMessage(payload, user) {
  await getChannelById(payload.channel_id, user)

  if (payload.parent_id) {
    const parent = await prisma.message.findUnique({
      where: { id: payload.parent_id },
      select: { id: true, channelId: true },
    })

    if (!parent || parent.channelId !== payload.channel_id) {
      throw AppError.validationError("Invalid parent message", [
        { field: "parent_id", message: "Parent message must belong to the same channel" },
      ])
    }
  }

  return await prisma.message.create({
    data: {
      channelId: payload.channel_id,
      userId: Number(user.id),
      content: payload.content,
      parentId: payload.parent_id ?? null,
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
}

async function toggleReaction(messageId, emoji, user, action) {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { id: true, channelId: true }
  })
  
  if (!message) {
    throw AppError.notFound("Message not found")
  }

  // Authorize check for channel access
  await getChannelById(message.channelId, user)

  const userId = Number(user.id)

  if (action === "add") {
    const reaction = await prisma.reaction.upsert({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
      update: {},
      create: {
        messageId,
        userId,
        emoji,
      },
      include: {
        user: { select: { id: true, email: true, role: true } }
      }
    })
    return { reaction, channelId: message.channelId }
  } else if (action === "remove") {
    await prisma.reaction.delete({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
    }).catch(() => {
      // Ignore if doesn't exist
    })
    return { channelId: message.channelId }
  }
}

async function updateMessage(messageId, payload, user) {
  const id = messageId

  const existing = await prisma.message.findUnique({
    where: { id },
    select: { id: true, channelId: true },
  })

  if (!existing) throw AppError.notFound("Message not found")

  // Authorize
  await getChannelById(existing.channelId, user)

  const updated = await prisma.message.update({
    where: { id },
    data: {
      content: payload.content,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          employee: {
            select: { firstName: true, lastName: true },
          },
        },
      },
      reactions: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  })

  return updated
}

async function deleteMessage(messageId, user) {
  const id = messageId

  const existing = await prisma.message.findUnique({
    where: { id },
    select: { id: true, channelId: true },
  })

  if (!existing) throw AppError.notFound("Message not found")

  // Authorize
  await getChannelById(existing.channelId, user)

  // Delete
  await prisma.message.delete({ where: { id } })

  return { messageId: id, channelId: existing.channelId }
}

module.exports = {
  listChannelMessages,
  createMessage,
  toggleReaction,
  updateMessage,
  deleteMessage,
}
