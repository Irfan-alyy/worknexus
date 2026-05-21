function listEmployees() {
  return []
}

function createEmployee(input) {
  return {
    id: `emp-${Date.now()}`,
    ...input,
  }
}

module.exports = {
  listEmployees,
  createEmployee,
}