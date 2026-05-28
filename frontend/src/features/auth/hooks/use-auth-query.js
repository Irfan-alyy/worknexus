import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { authApi } from "../services/auth-api"

export const useAuthMeQuery = (options = {}) =>
  useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: authApi.me,
    ...options,
  })
