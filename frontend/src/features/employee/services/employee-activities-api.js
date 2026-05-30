import apiClient from "@/lib/axios"

/**
 * Fetch all activities for an employee
 */
export async function fetchEmployeeActivities(employeeId) {
	const { data } = await apiClient.get(`/employees/${employeeId}/activities`)
	return data.data || []
}

/**
 * Fetch activity metrics for an employee
 */
export async function fetchEmployeeActivityMetrics(employeeId) {
	const { data } = await apiClient.get(`/employees/${employeeId}/activities/metrics`)
	return data.data || {}
}
