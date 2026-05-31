import { useQuery } from "@tanstack/react-query"
import { fetchHRActivities, fetchHRActivityMetrics } from "../services/hr-activities-api"
import { hrActivitiesKeys } from "@/config/query-keys"

/**
 * Hook to fetch HR activities with filtering
 * @param {Object} filters - Filter options
 * @returns {Object} React Query result with data, isLoading, error
 */
export const useHRActivities = (filters = {}) => {
	return useQuery({
		queryKey: hrActivitiesKeys.list(filters),
		queryFn: () => fetchHRActivities(filters),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 30, // 30 minutes
		retry: 2,
	})
}

/**
 * Hook to fetch HR activity metrics
 * @returns {Object} React Query result with data, isLoading, error
 */
export const useHRActivityMetrics = (options = {}) => {
	return useQuery({
		queryKey: hrActivitiesKeys.metrics(),
		queryFn: () => fetchHRActivityMetrics(),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 30, // 30 minutes
		retry: 2,
		...options,
	})
}

export default useHRActivities
