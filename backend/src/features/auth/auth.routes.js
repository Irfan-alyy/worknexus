const { Router } = require("express")
const {
  registerController,
  loginController,
  logoutController,
  meController,
} = require("./auth.controller")
const auth = require("../../middleware/auth")

const router = Router()

/**
 * Public auth routes (no authentication required)
 */
router.post("/register", registerController)
router.post("/login", loginController)

/**
 * Protected auth routes (authentication required)
 */
router.post("/logout", auth, logoutController)
router.get("/me", auth, meController)

module.exports = router