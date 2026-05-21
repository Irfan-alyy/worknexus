const { Router } = require("express")
const { listEmployeesController, createEmployeeController } = require("./employee.controller")
const auth = require("../../middleware/auth")
const rbac = require("../../middleware/rbac")

const router = Router()

router.get("/", auth, rbac(["ADMIN", "HR"]), listEmployeesController)
router.post("/", auth, rbac(["ADMIN", "HR"]), createEmployeeController)

module.exports = router