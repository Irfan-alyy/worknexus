import apiClient from "@/lib/axios"

const EMPLOYEES_PATH = "/employees"
const DEPARTMENTS_PATH = "/departments"

export const hrApi = {
	// Employees
	listEmployees: (params = {}) => apiClient.get(EMPLOYEES_PATH, { params }).then((res) => res.data),
	createEmployee: (payload) => apiClient.post(EMPLOYEES_PATH, payload).then((res) => res.data),
	getEmployee: (id) => apiClient.get(`${EMPLOYEES_PATH}/${id}`).then((res) => res.data),
	updateEmployee: (id, payload) => apiClient.patch(`${EMPLOYEES_PATH}/${id}`, payload).then((res) => res.data),

	// Departments
	listDepartments: (params = {}) => apiClient.get(DEPARTMENTS_PATH, { params }).then((res) => res.data),
	getDepartment: (id) => apiClient.get(`${DEPARTMENTS_PATH}/${id}`).then((res) => res.data),
	createDepartment: (payload) => apiClient.post(DEPARTMENTS_PATH, payload).then((res) => res.data),
	updateDepartment: (id, payload) => apiClient.patch(`${DEPARTMENTS_PATH}/${id}`, payload).then((res) => res.data),
}
