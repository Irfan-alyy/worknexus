function getChannelHistory(channelId) {
  return {
    channelId,
    messages: [],
  }
}

function createMessage(payload) {
  return {
    id: `msg-${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
  }
}

module.exports = {
  getChannelHistory,
  createMessage,
}