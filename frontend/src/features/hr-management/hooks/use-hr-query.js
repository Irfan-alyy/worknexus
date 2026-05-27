import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { hrApi } from "../services/hr-api"

export const useEmployeesQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: queryKeys.hr.employees(params),
    queryFn: () => hrApi.listEmployees(params),
    ...options,
  })
