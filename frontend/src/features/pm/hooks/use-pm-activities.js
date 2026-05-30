import { useQuery } from "@tanstack/react-query"
import { fetchPmActivities, fetchPmActivityMetrics } from "../services/pm-activities-api"
import { queryKeys } from "@/config/query-keys"

export function usePmActivities(options = {}) {
  return useQuery({
    queryKey: queryKeys.pmActivities.activities(),
    queryFn: () => fetchPmActivities(),
    staleTime: 5 * 60 * 1000,
    enabled: true,
    ...options,
  })
}

export function usePmActivityMetrics(options = {}) {
  return useQuery({
    queryKey: queryKeys.pmActivities.metrics(),
    queryFn: () => fetchPmActivityMetrics(),
    staleTime: 5 * 60 * 1000,
    enabled: true,
    ...options,
  })
}
