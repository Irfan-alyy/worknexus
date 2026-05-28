import { useEffect, useMemo, useRef, useState } from "react"
import { Edit, Eye, Loader2, Plus, X } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import apiClient from "@/lib/axios"
import { queryKeys } from "@/config/query-keys"
import { useGlobalStore } from "@/stores/use-global-store"
import ProjectTasksPanel from "@/features/projects/ProjectTasksPanel"

const roleOptions = [
  { value: "employee", label: "Employee" },
  { value: "pm", label: "Project Manager" },
]

const paymentModels = [
  { value: "fixed", label: "Fixed" },
  { value: "hourly", label: "Hourly" },
  { value: "revenue_share", label: "Revenue share" },
]

const roleLabel = (role) => roleOptions.find((option) => option.value === role)?.label || role

export default function AdminEmployees() {
  const { openAside } = useGlobalStore()
  const location = useLocation()
  const queryClient = useQueryClient()
  const lastOpenedEmployeeIdRef = useRef(null)
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
  const [modalState, setModalState] = useState({ open: false, mode: "create", employee: null })
  const [formError, setFormError] = useState("")
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    department_id: "",
    payment_model: "fixed",
    base_salary: "",
    hourly_rate: "",
    revenue_share_percent: "",
    role: "employee",
  })

  const urlEmployeeId = useMemo(() => {
    const params = new URLSearchParams(location.search)
    const rawEmployeeId = params.get("employeeId")
    if (!rawEmployeeId) return null

    const parsedEmployeeId = Number(rawEmployeeId)
    return Number.isInteger(parsedEmployeeId) && parsedEmployeeId > 0 ? parsedEmployeeId : null
  }, [location.search])

  const { data: employeesResponse, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.hr.employees(),
    queryFn: async () => {
      const response = await apiClient.get("/employees")
      return response.data
    },
  })

  const employees = useMemo(() => employeesResponse?.data || [], [employeesResponse])

  const createEmployee = useMutation({
    mutationFn: (payload) => apiClient.post("/employees", payload).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.hr.employees() }),
  })

  const updateEmployee = useMutation({
    mutationFn: ({ id, payload }) => apiClient.patch(`/employees/${id}`, payload).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.hr.employees() }),
  })

  useEffect(() => {
    if (!employees.length) return

    if (urlEmployeeId) {
      const employeeFromUrl = employees.find((employee) => employee.id === urlEmployeeId)
      if (employeeFromUrl) {
        setSelectedEmployeeId(employeeFromUrl.id)
        
        if (lastOpenedEmployeeIdRef.current !== employeeFromUrl.id) {
          lastOpenedEmployeeIdRef.current = employeeFromUrl.id
          openAside(
            `Employee detail: ${employeeFromUrl?.user?.email || "Employee"}`,
            <EmployeeDetailPanel employeeId={employeeFromUrl.id} fallbackEmployee={employeeFromUrl} />
          )
        }

        return
      }
    }

    if (!selectedEmployeeId) {
      setSelectedEmployeeId(employees[0].id)
    }
  }, [employees, openAside, selectedEmployeeId, urlEmployeeId])

  const selectedEmployee = employees.find((employee) => employee.id === selectedEmployeeId) || employees[0]

  function openEmployeeDetails(employee) {
    setSelectedEmployeeId(employee.id)
    openAside(`Employee detail: ${employee?.user?.email || "Employee"}`, <EmployeeDetailPanel employeeId={employee.id} fallbackEmployee={employee} />)
  }

  function openCreateModal() {
    setFormError("")
    setForm({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      department_id: "",
      payment_model: "fixed",
      base_salary: "",
      hourly_rate: "",
      revenue_share_percent: "",
      role: "employee",
    })
    setModalState({ open: true, mode: "create", employee: null })
  }

  function openEditModal(employee) {
    setFormError("")
    setForm({
      email: employee?.user?.email || "",
      password: "",
      first_name: employee?.firstName || "",
      last_name: employee?.lastName || "",
      department_id: employee?.departmentId ? String(employee.departmentId) : "",
      payment_model: employee?.paymentModel || "fixed",
      base_salary: employee?.baseSalary ? String(employee.baseSalary) : "",
      hourly_rate: employee?.hourlyRate ? String(employee.hourlyRate) : "",
      revenue_share_percent: employee?.revenueSharePercent ? String(employee.revenueSharePercent) : "",
      role: employee?.user?.role || "employee",
    })
    setModalState({ open: true, mode: "edit", employee })
  }

  function closeModal() {
    setModalState({ open: false, mode: "create", employee: null })
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const isSaving = createEmployee.isPending || updateEmployee.isPending

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError("")

    if (!form.email) {
      setFormError("Email is required.")
      return
    }

    if (!form.first_name || !form.last_name) {
      setFormError("First and last name are required.")
      return
    }

    if (modalState.mode === "create" && !form.password) {
      setFormError("Password is required to create an employee.")
      return
    }

    const payload = {
      email: form.email,
      password: form.password,
      first_name: form.first_name,
      last_name: form.last_name,
      payment_model: form.payment_model,
      role: form.role,
    }

    if (form.department_id) payload.department_id = Number(form.department_id)
    if (form.base_salary) payload.base_salary = Number(form.base_salary)
    if (form.hourly_rate) payload.hourly_rate = Number(form.hourly_rate)
    if (form.revenue_share_percent) payload.revenue_share_percent = Number(form.revenue_share_percent)

    try {
      if (modalState.mode === "create") {
        await createEmployee.mutateAsync(payload)
      } else if (modalState.employee?.id) {
        const updatePayload = { ...payload }
        delete updatePayload.email
        delete updatePayload.password

        if (!Object.keys(updatePayload).length) {
          setFormError("Provide at least one field to update.")
          return
        }

        await updateEmployee.mutateAsync({ id: modalState.employee.id, payload: updatePayload })
      }

      closeModal()
    } catch (requestError) {
      const message = requestError?.response?.data?.message || "Request failed. Please try again."
      setFormError(message)
    }
  }

  return (
    <div className="h-full min-h-0 overflow-y-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Employees</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage employee profiles and project manager accounts.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Add employee
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            Loading employees...
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
            {error?.response?.data?.message || "Unable to load employees."}
          </div>
        ) : null}

        {!isLoading && !isError && employees.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No employees found. Create a new employee profile to get started.
          </div>
        ) : null}

        {employees.map((employee) => (
          <div
            key={employee.id}
            role="button"
            tabIndex={0}
            onClick={() => openEmployeeDetails(employee)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                openEmployeeDetails(employee)
              }
            }}
            className={`group relative flex cursor-pointer items-start justify-between rounded-2xl border border-border bg-background p-4 pr-16 transition-colors ${selectedEmployee?.id === employee.id ? "bg-secondary/60" : "hover:bg-secondary/30"}`}
          >
            <div>
              <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{employee.user?.email}</p>
              <p className="mt-2 text-xs text-muted-foreground">Role: {roleLabel(employee.user?.role)}</p>
            </div>
            <div className="absolute -right-1 -top-1 z-10 rounded-full border border-border bg-background p-1 opacity-0 shadow-sm transition-all duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    openEmployeeDetails(employee)
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="View"
                  aria-label={`View ${employee.firstName} ${employee.lastName}`}
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    openEditModal(employee)
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="Edit"
                  aria-label={`Edit ${employee.firstName} ${employee.lastName}`}
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Selected employee detail</p>
        <p className="mt-2 text-sm text-muted-foreground">Click an employee above to open the full detail aside.</p>
      </section>

      <EmployeeModal
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

function EmployeeDetailPanel({ employeeId, fallbackEmployee }) {
  const navigate = useNavigate()
  const { data: employeeResponse, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.hr.employee(employeeId),
    queryFn: async () => {
      const response = await apiClient.get(`/employees/${employeeId}`)
      return response.data
    },
    enabled: Boolean(employeeId),
  })

  const employee = employeeResponse?.data || fallbackEmployee || null
  const isPm = employee?.user?.role === "pm"
  const isEmployee = employee?.user?.role === "employee"
  const managedProjects = Array.isArray(employee?.managedProjects) ? employee.managedProjects : []
  const teamProjects = Array.isArray(employee?.teamProjects) ? employee.teamProjects : []
  const recentTasks = Array.isArray(employee?.recentTasks) ? employee.recentTasks : []
  const accountDetails = [
    { label: "Employee ID", value: employee?.id },
    { label: "User ID", value: employee?.user?.id },
    { label: "Role", value: employee?.user?.role ? roleLabel(employee.user.role) : null },
    { label: "Department", value: employee?.department?.name || employee?.departmentId },
    { label: "Payment model", value: employee?.paymentModel },
    { label: "Base salary", value: employee?.baseSalary },
    { label: "Hourly rate", value: employee?.hourlyRate },
    { label: "Revenue share %", value: employee?.revenueSharePercent },
  ].filter(({ value }) => value !== null && value !== undefined && value !== "")

  const openProject = (projectId) => {
    if (!projectId) return
    navigate(`/projects?projectId=${projectId}`)
  }

  const openTask = (taskId, projectId) => {
    if (!taskId) return
    const params = new URLSearchParams()
    if (projectId) params.set("projectId", projectId)
    params.set("taskId", taskId)
    navigate(`/projects?${params.toString()}`)
  }

  function statusBadgeClass(status) {
    if (!status) return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
    if (status === "completed" || status === "Completed") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
    if (status === "in_progress" || status === "In Progress") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
    if (status === "pending" || status === "Pending") return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
    return "bg-zinc-200 text-zinc-700"
  }

  function priorityBadgeClass(priority) {
    if (!priority) return "bg-secondary text-foreground"
    const p = String(priority).toLowerCase()
    if (p.includes("high") || p === "high") return "bg-rose-100 text-rose-700"
    if (p.includes("critical") || p === "critical") return "bg-red-100 text-red-700"
    if (p.includes("low") || p === "low") return "bg-emerald-100 text-emerald-700"
    return "bg-secondary text-foreground"
  }

  function formatDate(date) {
    if (!date) return null
    try {
      const d = new Date(date)
      return d.toLocaleDateString()
    } catch {
      return date
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Employee profile</p>
        {isLoading ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading employee details...
          </div>
        ) : isError ? (
          <p className="mt-3 text-sm text-red-600">{error?.response?.data?.message || "Unable to load employee details."}</p>
        ) : (
          <>
            <h3 className="mt-1 text-xl font-semibold">{employee?.firstName} {employee?.lastName}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{employee?.user?.email}</p>
          </>
        )}
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Account details</p>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          {accountDetails.length ? (
            accountDetails.map((item) => (
              <p key={item.label}>
                <span className="font-medium text-foreground">{item.label}:</span> {item.value}
              </p>
            ))
          ) : (
            <p>No account details available.</p>
          )}
        </div>
      </section>

      {isPm ? (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium">Managed projects (PM)</p>
          <div className="mt-3 space-y-2 text-sm">
            {managedProjects.length ? managedProjects.map((project) => (
              <button
                key={project.id || project.name}
                type="button"
                onClick={() => openProject(project.id)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-left text-sm text-foreground hover:bg-secondary/60"
              >
                {project.name || `Project #${project.id}`}
              </button>
            )) : (
              <p className="text-sm text-muted-foreground">
                Managed projects will appear here when available.
              </p>
            )}
          </div>
        </section>
      ) : null}

      {isEmployee ? (
        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium">Assigned projects</p>
          <div className="mt-3 space-y-2 text-sm">
            {teamProjects.length ? teamProjects.map((project) => (
              <button
                key={project.id || project.name}
                type="button"
                onClick={() => openProject(project.id)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-left text-sm text-foreground hover:bg-secondary/60"
              >
                {project.name || `Project #${project.id}`}
              </button>
            )) : (
              <p className="text-sm text-muted-foreground">
                Assigned projects will appear here when available.
              </p>
            )}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Recent tasks</p>
          <div>
            <button
              type="button"
              onClick={() => {
                navigate('/projects')
                openAside('Project Tasks', <ProjectTasksPanel />)
              }}
              className="text-sm text-primary"
            >
              Show all
            </button>
          </div>
        </div>

        <div className="mt-3 space-y-2 text-sm">
          {recentTasks.length ? recentTasks.map((task) => (
            <button
              key={task.id || task.title}
              type="button"
              onClick={() => openTask(task.id, task.projectId)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-left text-sm text-foreground hover:bg-secondary/60"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 text-left">
                  <p className="font-medium">{task.title || `Task #${task.id}`}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{task.project?.name || (task.projectId ? `Project #${task.projectId}` : '')} {task.dueDate ? `• Due ${formatDate(task.dueDate)}` : ''}</p>
                </div>
                <div className="ml-3 flex flex-col items-end gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${priorityBadgeClass(task.priority)}`}>{task.priority ?? 'N/A'}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClass(task.status)}`}>{task.status ?? 'Unknown'}</span>
                </div>
              </div>
            </button>
          )) : (
            <p className="text-sm text-muted-foreground">
              Recent tasks will appear here when the employee details endpoint is enriched.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

function EmployeeModal({ modalState, form, onChange, onClose, onSubmit, errorMessage, isSaving }) {
  if (!modalState.open) return null

  const isEdit = modalState.mode === "edit"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Employees</p>
            <h3 className="mt-1 text-xl font-semibold">{isEdit ? "Edit employee" : "Create employee"}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {isEdit ? "Update employee profile details." : "Create a new employee profile and login account."}
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">First name</label>
              <input
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={form.first_name}
                onChange={(event) => onChange("first_name", event.target.value)}
                placeholder="First name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Last name</label>
              <input
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={form.last_name}
                onChange={(event) => onChange("last_name", event.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={form.email}
              onChange={(event) => onChange("email", event.target.value)}
              placeholder="employee@worknexus.com"
              disabled={isEdit}
            />
            {isEdit ? (
              <p className="mt-1 text-xs text-muted-foreground">Email updates happen via user settings.</p>
            ) : null}
          </div>

          {!isEdit ? (
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={form.password}
                onChange={(event) => onChange("password", event.target.value)}
                placeholder="Set a temporary password"
              />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Role</label>
              <select
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={form.role}
                onChange={(event) => onChange("role", event.target.value)}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Department ID</label>
              <input
                type="number"
                min="1"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={form.department_id}
                onChange={(event) => onChange("department_id", event.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Payment model</label>
              <select
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={form.payment_model}
                onChange={(event) => onChange("payment_model", event.target.value)}
              >
                {paymentModels.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Base salary</label>
              <input
                type="number"
                min="0"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={form.base_salary}
                onChange={(event) => onChange("base_salary", event.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Hourly rate</label>
              <input
                type="number"
                min="0"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={form.hourly_rate}
                onChange={(event) => onChange("hourly_rate", event.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Revenue share %</label>
              <input
                type="number"
                min="0"
                max="100"
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={form.revenue_share_percent}
                onChange={(event) => onChange("revenue_share_percent", event.target.value)}
                placeholder="Optional"
              />
            </div>
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
              {isSaving ? "Saving..." : isEdit ? "Save changes" : "Create employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
