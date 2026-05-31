import { useQuery } from "@tanstack/react-query"
import { fetchEmployeeActivities, fetchEmployeeActivityMetrics } from "../services/employee-activities-api"
import { queryKeys } from "@/config/query-keys"

/**
 * Hook to fetch employee activities
 */
export function useEmployeeActivities(employeeId, options = {}) {
	return useQuery({
		queryKey: queryKeys.employeeActivities.activities(employeeId),
		queryFn: () => fetchEmployeeActivities(employeeId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!employeeId,
		...options,
	})
}

/**
 * Hook to fetch employee activity metrics
 */
export function useEmployeeActivityMetrics(employeeId, options = {}) {
	return useQuery({
		queryKey: queryKeys.employeeActivities.metrics(employeeId),
		queryFn: () => fetchEmployeeActivityMetrics(employeeId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		enabled: !!employeeId,
		...options,
	})
}
