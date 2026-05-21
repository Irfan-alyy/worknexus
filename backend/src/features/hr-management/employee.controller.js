const { listEmployees, createEmployee } = require("./employee.service")

function listEmployeesController(req, res) {
  return res.json({ success: true, data: listEmployees() })
}

function createEmployeeController(req, res) {
  return res.status(201).json({ success: true, data: createEmployee(req.body) })
}

module.exports = {
  listEmployeesController,
  createEmployeeController,
}