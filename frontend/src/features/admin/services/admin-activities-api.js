import axios from "@/lib/axios"

/**
 * Fetch Admin activities with optional filters
 * @param {Object} options - Filter options
 * @param {string} options.type - Activity type (employee, client, project, task, payroll, department, user)
 * @param {string} options.dateRange - Date range (today, week, month)
 * @param {string} options.status - Activity status (new, all, archived)
 * @param {number} options.limit - Max number of activities to return
 * @returns {Promise<Array>} Array of activity objects
 */
export const fetchAdminActivities = async (options = {}) => {
	const { limit, ...filters } = options
	const hasFilters = Boolean(filters.type || filters.dateRange || filters.status)
	const effectiveLimit = Number.isFinite(limit) ? limit : hasFilters ? 1000 : 50

	const params = new URLSearchParams()
	if (effectiveLimit) params.append("limit", effectiveLimit)
	if (filters.type) params.append("type", filters.type)
	if (filters.dateRange) params.append("dateRange", filters.dateRange)
	if (filters.status) params.append("status", filters.status)

	const response = await axios.get(`/admin/activities?${params.toString()}`)
	return response.data?.data || []
}

/**
 * Fetch Admin activity metrics
 * @returns {Promise<Object>} Metrics object with summary statistics
 */
export const fetchAdminActivityMetrics = async () => {
	const response = await axios.get(`/admin/activities/metrics`)
	return response.data?.data || {}
}

export default {
	fetchAdminActivities,
	fetchAdminActivityMetrics,
}
