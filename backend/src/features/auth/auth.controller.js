const { login } = require("./auth.service")
const { validateLoginPayload } = require("./auth.schema")

function loginController(req, res) {
  const validation = validateLoginPayload(req.body)

  if (!validation.valid) {
    return res.status(400).json({ success: false, message: validation.errors.join(", ") })
  }

  const result = login(req.body)

  return res.json({ success: true, data: result })
}

function logoutController(req, res) {
  return res.json({ success: true, message: "Logged out" })
}

function meController(req, res) {
  return res.json({ success: true, data: req.user || null })
}

module.exports = {
  loginController,
  logoutController,
  meController,
}