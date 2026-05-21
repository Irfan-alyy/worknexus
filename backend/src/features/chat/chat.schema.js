function validateMessagePayload(payload = {}) {
  const errors = []

  if (!payload.channelId) errors.push("channelId is required")
  if (!payload.message) errors.push("message is required")

  return { valid: errors.length === 0, errors }
}

module.exports = {
  validateMessagePayload,
}