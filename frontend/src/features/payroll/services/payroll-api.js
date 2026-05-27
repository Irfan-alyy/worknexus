import apiClient from "@/lib/axios"

const BASE_PATH = "/payroll"

export const payrollApi = {
	listPayrolls: (params = {}) => apiClient.get(BASE_PATH, { params }).then((res) => res.data),
	calculatePayroll: (payload) => apiClient.post(`${BASE_PATH}/calculate`, payload).then((res) => res.data),
}
