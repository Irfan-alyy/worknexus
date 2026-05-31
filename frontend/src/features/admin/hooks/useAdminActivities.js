import { useQuery } from "@tanstack/react-query"
import { fetchAdminActivities } from "../services/admin-activities-api"
import { adminActivitiesKeys } from "@/config/query-keys"

/**
 * Hook to fetch Admin activities with filtering
 * @param {Object} filters - Filter options
 * @returns {Object} React Query result with data, isLoading, error
 */
export const useAdminActivities = (filters = {}) => {
	return useQuery({
		queryKey: adminActivitiesKeys.list(filters),
		queryFn: () => fetchAdminActivities(filters),
		staleTime: 1000 * 60 * 5, // 5 minutes
		gcTime: 1000 * 60 * 30, // 30 minutes
		retry: 2,
	})
}

export default useAdminActivities
