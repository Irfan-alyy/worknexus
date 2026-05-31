import apiClient from "@/lib/axios"

/**
 * Fetch aggregated activities for the current project manager
 */
export async function fetchPmActivities() {
  const { data } = await apiClient.get(`/pm/activities`)
  return data.data || []
}

/**
 * Fetch activity metrics for the current project manager
 */
export async function fetchPmActivityMetrics() {
  const { data } = await apiClient.get(`/pm/activities/metrics`)
  return data.data || {}
}
