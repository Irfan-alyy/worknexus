function calculatePayroll(input = {}) {
  const basePay = Number(input.basePay || 0)
  const allowance = Number(input.allowance || 0)

  return {
    grossPay: basePay + allowance,
    deductions: Number(input.deductions || 0),
    netPay: basePay + allowance - Number(input.deductions || 0),
  }
}

module.exports = {
  calculatePayroll,
}