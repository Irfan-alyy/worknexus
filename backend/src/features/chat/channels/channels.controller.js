const {
  createChannel,
  listChannelsForUser,
  getProjectChannels,
  getChannelById,
  findOrCreateDM,
  updateChannel,
  deleteChannel,
  listChannelMembers,
  addChannelMember,
  addChannelMembers,
  removeChannelMember,
} = require("./channels.service")
const { successResponse } = require("../../../utils/response")

async function findOrCreateDMController(req, res, next) {
  try {
    const data = await findOrCreateDM(req.params.receiverId, req.user)
    const { response, statusCode } = successResponse(data, "DM channel retrieved")
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function listChannelsController(req, res, next) {
  try {
    const data = await listChannelsForUser(req.user, { projectId: req.query.projectId })
    const { response, statusCode } = successResponse(data)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function listProjectChannelsController(req, res, next) {
  try {
    const data = await getProjectChannels(req.params.projectId, req.user)
    const { response, statusCode } = successResponse(data)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function getChannelController(req, res, next) {
  try {
    const data = await getChannelById(req.params.channelId, req.user)
    const { response, statusCode } = successResponse(data)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function createChannelController(req, res, next) {
  try {
    const payload = req.validatedBody || req.body
    const created = await createChannel(payload, req.user)
    const { response, statusCode } = successResponse(created, "Channel created", 201)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function updateChannelController(req, res, next) {
  try {
    const payload = req.validatedBody || req.body
    const updated = await updateChannel(req.params.channelId, payload, req.user)
    const { response, statusCode } = successResponse(updated, "Channel updated")
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function deleteChannelController(req, res, next) {
  try {
    const deleted = await deleteChannel(req.params.channelId, req.user)
    const { response, statusCode } = successResponse(deleted, "Channel deleted")
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function listChannelMembersController(req, res, next) {
  try {
    const data = await listChannelMembers(req.params.channelId, req.user)
    const { response, statusCode } = successResponse(data)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function addChannelMemberController(req, res, next) {
  try {
    const payload = req.validatedBody || req.body
    // support bulk add: validated body may contain `user_ids` (array) or `user_id` (single)
    const userIds = payload.user_ids || (payload.user_id ? [payload.user_id] : [])
    if (!userIds || userIds.length === 0) {
      const { response, statusCode } = successResponse(null)
      return res.status(statusCode).json(response)
    }

    const created = await addChannelMembers(req.params.channelId, userIds, req.user)
    const { response, statusCode } = successResponse(created, "Channel members added", 201)
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

async function removeChannelMemberController(req, res, next) {
  try {
    const removed = await removeChannelMember(req.params.channelId, req.params.userId, req.user)
    const { response, statusCode } = successResponse(removed, "Channel member removed")
    return res.status(statusCode).json(response)
  } catch (err) {
    return next(err)
  }
}

module.exports = {
  findOrCreateDMController,
  listChannelsController,
  listProjectChannelsController,
  getChannelController,
  createChannelController,
  updateChannelController,
  deleteChannelController,
  listChannelMembersController,
  addChannelMemberController,
  removeChannelMemberController,
}
