import apiClient from "@/lib/axios"

const BASE_PATH = "/users"

export const usersApi = {
	getUser: (id) => apiClient.get(`${BASE_PATH}/${id}`).then((res) => res.data),
	updateUser: (id, payload) => apiClient.patch(`${BASE_PATH}/${id}`, payload).then((res) => res.data),
}