import apiClient from "@/lib/axios"

const BASE_PATH = "/chat"

export const chatApi = {
	listChannels: (params = {}) => apiClient.get(`${BASE_PATH}/channels`, { params }).then((res) => res.data),
	createChannel: (payload) => apiClient.post(`${BASE_PATH}/channels`, payload).then((res) => res.data),
	getChannel: (channelId) => apiClient.get(`${BASE_PATH}/channels/${channelId}`).then((res) => res.data),
	findOrCreateDM: (receiverId) => apiClient.post(`${BASE_PATH}/dms/${receiverId}`).then((res) => res.data),
	listChannelMembers: (channelId) => apiClient.get(`${BASE_PATH}/channels/${channelId}/members`).then((res) => res.data),
}

export default chatApi
