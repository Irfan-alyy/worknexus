import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1"

const apiClient = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
})

export const setAuthToken = (token) => {
	if (token) {
		apiClient.defaults.headers.common.Authorization = `Bearer ${token}`
		return
	}

	delete apiClient.defaults.headers.common.Authorization
}

export default apiClient
