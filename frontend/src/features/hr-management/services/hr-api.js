import apiClient from "@/lib/axios"

const BASE_PATH = "/employees"

export const hrApi = {
	listEmployees: (params = {}) => apiClient.get(BASE_PATH, { params }).then((res) => res.data),
	createEmployee: (payload) => apiClient.post(BASE_PATH, payload).then((res) => res.data),
}
