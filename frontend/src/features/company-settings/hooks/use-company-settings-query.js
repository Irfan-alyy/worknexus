import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { companySettingsApi } from "../services/company-settings-api"

export const useCompanySettingsQuery = (options = {}) =>
  useQuery({
    queryKey: queryKeys.settings.company(),
    queryFn: companySettingsApi.getSettings,
    ...options,
  })
