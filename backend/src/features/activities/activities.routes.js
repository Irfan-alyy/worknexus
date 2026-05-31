const { Router } = require("express")
const { getActivities, getActivityMetrics, getHRActivitiesController, getAdminActivitiesController } = require("./activities.controller")
const auth = require("../../middleware/auth")

const router = Router({ mergeParams: true })

// GET /api/v1/employees/:id/activities
router.get("/activities", auth, getActivities)

// GET /api/v1/employees/:id/activities/metrics
router.get("/activities/metrics", auth, getActivityMetrics)

// GET /api/v1/hr/activities
router.get("/hr/activities", auth, getHRActivitiesController)

// GET /api/v1/admin/activities
router.get("/admin/activities", auth, getAdminActivitiesController)

module.exports = router
