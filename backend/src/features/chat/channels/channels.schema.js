const { z } = require("zod")

const normalizeCreateChannelPayload = (payload = {}) => ({
  name: payload.name,
  description: payload.description,
  project_id: payload.project_id ?? payload.projectId,
  is_private: payload.is_private ?? payload.isPrivate,
  member_user_ids: payload.member_user_ids ?? payload.memberUserIds,
})

const normalizeUpdateChannelPayload = (payload = {}) => ({
  name: payload.name,
  description: payload.description,
  is_private: payload.is_private ?? payload.isPrivate,
})

const createChannelSchema = z.preprocess(
  normalizeCreateChannelPayload,
  z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(1000).optional(),
    project_id: z.string().uuid().optional(),
    is_private: z.boolean().default(false),
    member_user_ids: z.array(z.number().int().positive()).optional(),
  })
)

const updateChannelSchema = z.preprocess(
  normalizeUpdateChannelPayload,
  z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(1000).nullable().optional(),
    is_private: z.boolean().optional(),
  })
)

const addChannelMemberSchema = z.object({
  // Accept either a single `user_id` or an array `user_ids` for bulk add
  user_id: z.number().int().positive().optional(),
  user_ids: z.array(z.number().int().positive()).optional(),
})

const normalizeAddMembersPayload = (payload = {}) => ({
  user_ids: Array.isArray(payload.user_ids)
    ? payload.user_ids
    : payload.user_id
    ? [payload.user_id]
    : [],
})

const addChannelMembersSchema = z.preprocess(
  normalizeAddMembersPayload,
  z.object({ user_ids: z.array(z.number().int().positive()).nonempty() })
)

module.exports = {
  createChannelSchema,
  updateChannelSchema,
  addChannelMemberSchema,
  addChannelMembersSchema,
}