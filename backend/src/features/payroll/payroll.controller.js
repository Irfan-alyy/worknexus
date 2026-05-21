const { calculatePayroll } = require("./payroll.service")

function getPayrollController(req, res) {
  return res.json({ success: true, data: [] })
}

function calculatePayrollController(req, res) {
  return res.json({ success: true, data: calculatePayroll(req.body) })
}

module.exports = {
  getPayrollController,
  calculatePayrollController,
}