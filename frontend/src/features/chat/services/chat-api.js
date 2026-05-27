import apiClient from "@/lib/axios"

const BASE_PATH = "/chat"

export const chatApi = {
	listChannels: (params = {}) => apiClient.get(`${BASE_PATH}/channels`, { params }).then((res) => res.data),
	createChannel: (payload) => apiClient.post(`${BASE_PATH}/channels`, payload).then((res) => res.data),
}
