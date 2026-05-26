const { z } = require("zod")

const normalizeCreateMessagePayload = (payload = {}) => ({
  channel_id: payload.channel_id ?? payload.channelId,
  content: payload.content ?? payload.message,
  parent_id: payload.parent_id ?? payload.parentId,
})

const createMessageSchema = z.preprocess(
  normalizeCreateMessagePayload,
  z.object({
    channel_id: z.string().uuid(),
    content: z.string().min(1),
    parent_id: z.string().uuid().nullable().optional(),
  })
)

module.exports = {
  createMessageSchema,
}