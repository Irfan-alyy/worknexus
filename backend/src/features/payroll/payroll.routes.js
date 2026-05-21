const { Router } = require("express")
const { getPayrollController, calculatePayrollController } = require("./payroll.controller")
const auth = require("../../middleware/auth")
const rbac = require("../../middleware/rbac")

const router = Router()

router.get("/", auth, rbac(["ADMIN", "HR"]), getPayrollController)
router.post("/calculate", auth, rbac(["ADMIN", "HR"]), calculatePayrollController)

module.exports = router