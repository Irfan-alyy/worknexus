function validateLoginPayload(payload = {}) {
  const errors = []

  if (!payload.email) errors.push("email is required")
  if (!payload.password) errors.push("password is required")

  return { valid: errors.length === 0, errors }
}

module.exports = {
  validateLoginPayload,
}