import { useEffect, useMemo, useState } from "react"
import { Edit, Eye, Loader2, Plus, X } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import apiClient from "@/lib/axios"
import { queryKeys } from "@/config/query-keys"
import { useGlobalStore } from "@/stores/use-global-store"
import { hrApi } from "@/features/hr-management/services/hr-api"
import { Link } from "react-router-dom"

export default function AdminDepartments() {
	const { openAside } = useGlobalStore()
	const queryClient = useQueryClient()
	const [selectedDepartmentId, setSelectedDepartmentId] = useState(null)
	const [modalState, setModalState] = useState({ open: false, mode: "create", department: null })
	const [formError, setFormError] = useState("")
	const [form, setForm] = useState({
		name: "",
	})

	const { data: departmentsResponse, isLoading, isError, error } = useQuery({
		queryKey: queryKeys.hr.departments(),
		queryFn: async () => {
			const response = await hrApi.listDepartments()
			return response
		},
	})

	const departments = useMemo(() => departmentsResponse?.data || [], [departmentsResponse])

	const createDepartment = useMutation({
		mutationFn: (payload) => hrApi.createDepartment(payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.hr.departments() }),
	})

	const updateDepartment = useMutation({
		mutationFn: ({ id, payload }) => hrApi.updateDepartment(id, payload),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.hr.departments() }),
	})

	useEffect(() => {
		if (!selectedDepartmentId && departments.length) {
			setSelectedDepartmentId(departments[0].id)
		}
	}, [departments, selectedDepartmentId])

	const selectedDepartment = departments.find((dept) => dept.id === selectedDepartmentId) || departments[0]

	function openDepartmentDetails(department) {
		setSelectedDepartmentId(department.id)
		openAside(
			`Department detail: ${department.name}`,
			<DepartmentDetailPanel departmentId={department.id} fallbackDepartment={department} />
		)
	}

	function openCreateModal() {
		setFormError("")
		setForm({ name: "" })
		setModalState({ open: true, mode: "create", department: null })
	}

	function openEditModal(department) {
		setFormError("")
		setForm({ name: department.name || "" })
		setModalState({ open: true, mode: "edit", department })
	}

	function closeModal() {
		setModalState({ open: false, mode: "create", department: null })
	}

	function updateField(key, value) {
		setForm((current) => ({ ...current, [key]: value }))
	}

	const isSaving = createDepartment.isPending || updateDepartment.isPending

	async function handleSubmit(event) {
		event.preventDefault()
		setFormError("")

		if (!form.name) {
			setFormError("Department name is required.")
			return
		}

		const payload = { name: form.name }

		try {
			if (modalState.mode === "create") {
				await createDepartment.mutateAsync(payload)
			} else if (modalState.department?.id) {
				await updateDepartment.mutateAsync({
					id: modalState.department.id,
					payload,
				})
			}

			closeModal()
		} catch (requestError) {
			const message = requestError?.response?.data?.message || "Request failed. Please try again."
			setFormError(message)
		}
	}

	return (
		<div className="h-full min-h-0 overflow-y-auto p-4 space-y-4 sm:p-6">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-lg font-semibold">Departments</h2>
					<p className="mt-1 text-sm text-muted-foreground">Manage departments and view team composition.</p>
				</div>
				<button
					type="button"
					onClick={openCreateModal}
					className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
				>
					<Plus className="h-4 w-4" />
					Add department
				</button>
			</div>

			<div className="space-y-3">
				{isLoading ? (
					<div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin inline mr-2" />
						Loading departments...
					</div>
				) : null}

				{isError ? (
					<div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
						{error?.response?.data?.message || "Unable to load departments."}
					</div>
				) : null}

				{!isLoading && !isError && departments.length === 0 ? (
					<div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
						No departments found. Create a new department to get started.
					</div>
				) : null}

				{departments.map((department) => (
					<div
						key={department.id}
						role="button"
						tabIndex={0}
						onClick={() => openDepartmentDetails(department)}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault()
								openDepartmentDetails(department)
							}
						}}
						className={`group relative flex cursor-pointer items-start justify-between rounded-2xl border border-border bg-background p-4 pr-16 transition-colors ${
							selectedDepartment?.id === department.id ? "bg-secondary/60" : "hover:bg-secondary/30"
						}`}
					>
						<div>
							<h3 className="font-medium">{department.name}</h3>
							<p className="mt-1 text-sm text-muted-foreground">Created: {new Date(department.createdAt).toLocaleDateString()}</p>
						</div>
						<div className="absolute -right-1 -top-1 z-10 rounded-full border border-border bg-background p-1 opacity-100 shadow-sm transition-all duration-150 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
							<div className="flex items-center gap-1">
								<button
									type="button"
									onClick={(event) => {
										event.stopPropagation()
										openDepartmentDetails(department)
									}}
									className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
									title="View"
									aria-label={`View ${department.name}`}
								>
									<Eye className="h-3.5 w-3.5" />
								</button>
								<button
									type="button"
									onClick={(event) => {
										event.stopPropagation()
										openEditModal(department)
									}}
									className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
									title="Edit"
									aria-label={`Edit ${department.name}`}
								>
									<Edit className="h-3.5 w-3.5" />
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Selected department detail</p>
				<p className="mt-2 text-sm text-muted-foreground">Click a department above to open the full detail aside.</p>
			</section>

			<DepartmentModal
				modalState={modalState}
				form={form}
				onChange={updateField}
				onClose={closeModal}
				onSubmit={handleSubmit}
				errorMessage={formError}
				isSaving={isSaving}
			/>
		</div>
	)
}

function DepartmentDetailPanel({ departmentId, fallbackDepartment }) {
	const { data: departmentResponse, isLoading, isError, error } = useQuery({
		queryKey: queryKeys.hr.departments({departmentId}),
		queryFn: async () => {
			const response = await hrApi.getDepartment(departmentId)
			return response
		},
		enabled: Boolean(departmentId),
	})
	const department = departmentResponse?.data || fallbackDepartment || null
	const employees = useMemo(() => department?.employees || [], [department])
  const getEmployeeRole = (employee) => {
    const mapRolesName={
      "admin":"Admin",
      "employee":"Employee",
      "pm":"Project Manager",
      "hr":"HR"
    }
    return employee.user?.role ? mapRolesName[employee.user.role] || employee.user.role : "N/A"
  }


	return (
		<div className="space-y-4">
			<div>
				<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Department profile</p>
				{isLoading ? (
					<div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						Loading department details...
					</div>
				) : isError ? (
					<p className="mt-3 text-sm text-red-600">{error?.response?.data?.message || "Unable to load department details."}</p>
				) : (
					<>
						<h3 className="mt-1 text-xl font-semibold">{department?.name}</h3>
						<p className="mt-1 text-sm text-muted-foreground">
							Created on {department?.createdAt ? new Date(department.createdAt).toLocaleDateString() : "Unknown"}
						</p>
					</>
				)}
			</div>

			<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Team composition</p>
				<div className="mt-2 text-sm">
					<p className="text-muted-foreground">
						Total employees: <span className="font-semibold text-foreground">{employees.length}</span>
					</p>
				</div>
			</section>

			<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Employees in this department</p>
				<div className="mt-3 space-y-2 text-sm">
					{employees.length ? (
						employees.map((employee) => (
							<div key={employee.id} className="rounded-xl border border-border bg-background px-3 py-2">
								<Link to={`/admin/employees?employeeId=${employee.id}`} className="flex items-start justify-between">
									<div>
										<p className="font-medium">{employee.firstName} {employee.lastName}</p>
										<p className="mt-1 text-xs text-muted-foreground">{employee.user?.email}</p>
									</div>
									<span className="rounded-full bg-secondary px-2 py-1 text-xs font-medium">
										{getEmployeeRole(employee)}
									</span>
								</Link>
							</div>
						))
					) : (
						<p className="text-sm text-muted-foreground">No employees assigned to this department yet.</p>
					)}
				</div>
			</section>
		</div>
	)
}

function DepartmentModal({ modalState, form, onChange, onClose, onSubmit, errorMessage, isSaving }) {
	if (!modalState.open) return null

	const isEdit = modalState.mode === "edit"

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<div className="w-full max-w-xl rounded-3xl border border-border bg-card p-4 shadow-2xl sm:max-w-2xl sm:p-6">
				<div className="flex items-center justify-between gap-3">
					<div>
						<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Departments</p>
						<h3 className="mt-1 text-xl font-semibold">{isEdit ? "Edit department" : "Create department"}</h3>
						<p className="mt-2 text-sm text-muted-foreground">
							{isEdit ? "Update department details." : "Create a new department."}
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
						aria-label="Close modal"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<form onSubmit={onSubmit} className="mt-6 space-y-4">
					<div>
						<label className="text-sm font-medium">Department name</label>
						<input
							className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
							value={form.name}
							onChange={(event) => onChange("name", event.target.value)}
							placeholder="Engineering, HR, Sales, etc."
						/>
					</div>

					{errorMessage ? (
						<div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
							{errorMessage}
						</div>
					) : null}

					<div className="flex justify-end gap-2">
						<button
							type="button"
							onClick={onClose}
							className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
							disabled={isSaving}
						>
							{isSaving ? "Saving..." : isEdit ? "Save changes" : "Create department"}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}