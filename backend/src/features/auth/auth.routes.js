const { Router } = require("express")
const { loginController, logoutController, meController } = require("./auth.controller")
const auth = require("../../middleware/auth")

const router = Router()

router.post("/login", loginController)
router.post("/logout", auth, logoutController)
router.get("/me", auth, meController)

module.exports = router