import { useMutation, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { companySettingsApi } from "../services/company-settings-api"

export const useUpdateCompanySettingsMutation = (options = {}) => {
  const queryClient = useQueryClient()
  const { onSuccess, ...rest } = options

  return useMutation({
    mutationFn: companySettingsApi.updateSettings,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.company() })
      onSuccess?.(...args)
    },
    ...rest,
  })
}
