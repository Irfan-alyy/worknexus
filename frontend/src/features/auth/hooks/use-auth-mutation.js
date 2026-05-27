import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { authApi } from "../services/auth-api"

export const useLoginMutation = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
      onSuccess?.(...args)
    },
    ...rest,
  })
}

export const useLogoutMutation = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() })
      onSuccess?.(...args)
    },
    ...rest,
  })
}
