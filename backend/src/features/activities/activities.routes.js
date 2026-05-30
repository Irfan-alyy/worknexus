const { Router } = require("express")
const { getActivities, getActivityMetrics } = require("./activities.controller")
const auth = require("../../middleware/auth")

const router = Router({ mergeParams: true })

// GET /api/v1/employees/:id/activities
router.get("/activities", auth, getActivities)

// GET /api/v1/employees/:id/activities/metrics
router.get("/activities/metrics", auth, getActivityMetrics)

module.exports = router
