const { getCompanySettings } = require("./company.service")

function getCompanySettingsController(req, res) {
  return res.json({ success: true, data: getCompanySettings() })
}

module.exports = {
  getCompanySettingsController,
}