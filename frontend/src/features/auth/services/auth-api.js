import apiClient from "@/lib/axios"

const BASE_PATH = "/auth"

export const authApi = {
  login: (payload) => apiClient.post(`${BASE_PATH}/login`, payload).then((res) => res.data),
  register: (payload) => apiClient.post(`${BASE_PATH}/register`, payload).then((res) => res.data),
  me: () => apiClient.get(`${BASE_PATH}/me`).then((res) => res.data),
  logout: () => apiClient.post(`${BASE_PATH}/logout`).then((res) => res.data),
}
