const { Router } = require("express")
const { getPmActivities, getPmActivityMetrics } = require("./pm.controller")
const auth = require("../../middleware/auth")
const requireRole = require("../../middleware/rbac")

const router = Router()

// PM activities - only accessible to authenticated PMs
router.get("/activities", auth, requireRole(["pm"]), getPmActivities)
router.get("/activities/metrics", auth, requireRole(["pm"]), getPmActivityMetrics)

module.exports = router
