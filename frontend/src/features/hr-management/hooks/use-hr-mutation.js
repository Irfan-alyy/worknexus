import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { hrApi } from "../services/hr-api"

export const useCreateEmployeeMutation = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: hrApi.createEmployee,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.employees() })
      onSuccess?.(...args)
    },
    ...rest,
  })
}
