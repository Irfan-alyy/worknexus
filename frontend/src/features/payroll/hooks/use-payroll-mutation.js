import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { payrollApi } from "../services/payroll-api"

export const useCalculatePayrollMutation = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: payrollApi.calculatePayroll,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payroll.list() })
      onSuccess?.(...args)
    },
    ...rest,
  })
}
