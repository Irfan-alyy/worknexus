import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { payrollApi } from "../services/payroll-api"

export const usePayrollsQuery = (params = {}, options = {}) =>
  useQuery({
    queryKey: queryKeys.payroll.list(params),
    queryFn: () => payrollApi.listPayrolls(params),
    ...options,
  })
