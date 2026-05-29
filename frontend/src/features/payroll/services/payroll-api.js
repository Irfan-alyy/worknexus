import apiClient from "@/lib/axios"

const BASE_PATH = "/payroll"

export const payrollApi = {
	listPayrolls: (params = {}) => apiClient.get(BASE_PATH, { params }).then((res) => res.data),
	getPayrollById: (payrollId) => apiClient.get(`${BASE_PATH}/${payrollId}`).then((res) => res.data),
	calculatePayroll: (payload) => apiClient.post(`${BASE_PATH}/calculate`, payload).then((res) => res.data),
	updatePayrollStatus: (payrollId, paymentStatus) =>
		apiClient.patch(`${BASE_PATH}/${payrollId}`, { payment_status: paymentStatus }).then((res) => res.data),
}
