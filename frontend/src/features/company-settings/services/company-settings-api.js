import apiClient from "@/lib/axios"

const BASE_PATH = "/company/settings"

export const companySettingsApi = {
  getSettings: () => apiClient.get(BASE_PATH).then((res) => res.data),
  updateSettings: (payload) => apiClient.patch(BASE_PATH, payload).then((res) => res.data),
}
