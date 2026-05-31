import axios from "@/lib/axios"

/**
 * Fetch HR activities with optional filters
 * @param {Object} options - Filter options
 * @param {string} options.type - Activity type (employee, payroll, department, project, task, timelog)
 * @param {string} options.dateRange - Date range (today, week, month)
 * @param {string} options.status - Activity status (new, all, archived)
 * @param {number} options.limit - Max number of activities to return
 * @returns {Promise<Array>} Array of activity objects
 */
export const fetchHRActivities = async (options = {}) => {
	const { limit = 50, ...filters } = options

	const params = new URLSearchParams()
	if (limit) params.append("limit", limit)
	if (filters.type) params.append("type", filters.type)
	if (filters.dateRange) params.append("dateRange", filters.dateRange)
	if (filters.status) params.append("status", filters.status)

	const response = await axios.get(`/hr/activities?${params.toString()}`)
	return response.data?.data || []
}

export default {
	fetchHRActivities,
}
