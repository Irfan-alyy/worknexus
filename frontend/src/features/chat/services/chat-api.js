import apiClient from "@/lib/axios"

const BASE_PATH = "/chat"

export const chatApi = {
	// ========================================================================
	// CHANNELS
	// ========================================================================
	listChannels: (params = {}) => apiClient.get(`${BASE_PATH}/channels`, { params }).then((res) => res.data),
	createChannel: (payload) => apiClient.post(`${BASE_PATH}/channels`, payload).then((res) => res.data),
	getChannel: (channelId) => apiClient.get(`${BASE_PATH}/channels/${channelId}`).then((res) => res.data),
	updateChannel: (channelId, payload) => apiClient.patch(`${BASE_PATH}/channels/${channelId}`, payload).then((res) => res.data),
	deleteChannel: (channelId) => apiClient.delete(`${BASE_PATH}/channels/${channelId}`).then((res) => res.data),

	// ========================================================================
	// CHANNEL MEMBERS
	// ========================================================================
	listChannelMembers: (channelId) => apiClient.get(`${BASE_PATH}/channels/${channelId}/members`).then((res) => res.data),
	addChannelMembers: (channelId, payload) => apiClient.post(`${BASE_PATH}/channels/${channelId}/members`, payload).then((res) => res.data),
	removeChannelMember: (channelId, userId) => apiClient.delete(`${BASE_PATH}/channels/${channelId}/members/${userId}`).then((res) => res.data),

	// ========================================================================
	// DIRECT MESSAGES
	// ========================================================================
	findOrCreateDM: (receiverId) => apiClient.post(`${BASE_PATH}/dms/${receiverId}`).then((res) => res.data),

	// ========================================================================
	// MESSAGES
	// ========================================================================
	listMessages: (channelId, params = {}) =>
		apiClient.get(`${BASE_PATH}/channels/${channelId}/messages`, { params }).then((res) => res.data),
	createMessage: (payload) => apiClient.post(`${BASE_PATH}/messages`, payload).then((res) => res.data),
	updateMessage: (messageId, payload) => apiClient.patch(`${BASE_PATH}/messages/${messageId}`, payload).then((res) => res.data),
	deleteMessage: (messageId) => apiClient.delete(`${BASE_PATH}/messages/${messageId}`).then((res) => res.data),

	// ========================================================================
	// REACTIONS
	// ========================================================================
	addReaction: (payload) => apiClient.post(`${BASE_PATH}/reactions`, payload).then((res) => res.data),
	removeReaction: (messageId, emoji) => 
		apiClient.delete(`${BASE_PATH}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`).then((res) => res.data),
}

export default chatApi
