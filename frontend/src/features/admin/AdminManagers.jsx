import { useEffect, useMemo, useState } from "react"
import { Edit, Eye, Loader2, Plus, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import apiClient from "@/lib/axios"
import { queryKeys } from "@/config/query-keys"
import { useGlobalStore } from "@/stores/use-global-store"

const roleOptions = [
  { value: "hr", label: "HR Manager" },
  { value: "pm", label: "Project Manager" },
]

const roleLabel = (role) => roleOptions.find((option) => option.value === role)?.label || role

export default function AdminManagers({ onEdit }) {
  const { openAside } = useGlobalStore()
  const queryClient = useQueryClient()
  const [selectedManagerId, setSelectedManagerId] = useState(null)
  const [modalState, setModalState] = useState({ open: false, mode: "create", user: null })
  const [form, setForm] = useState({ email: "", password: "", role: "hr" })
  const [formError, setFormError] = useState("")

  const { data: usersResponse, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.managers(),
    queryFn: async () => {
      const response = await apiClient.get("/users")
      return response.data
    },
  })

  const managers = useMemo(() => {
    const users = usersResponse?.data || []
    return users.filter((user) => user?.role === "hr" || user?.role === "pm")
  }, [usersResponse])

  const createManager = useMutation({
    mutationFn: (payload) => apiClient.post("/users", payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.managers() })
    },
  })

  const updateManager = useMutation({
    mutationFn: ({ id, payload }) => apiClient.patch(`/users/${id}`, payload).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.managers() })
    },
  })

  useEffect(() => {
    if (!selectedManagerId && managers.length) {
      setSelectedManagerId(managers[0].id)
    }
  }, [managers, selectedManagerId])

  const selectedManager = managers.find((manager) => manager.id === selectedManagerId) || managers[0]

  function openManagerDetails(manager) {
    setSelectedManagerId(manager.id)
    openAside(`Manager detail: ${manager.email}`, <ManagerDetailPanel userId={manager.id} fallbackManager={manager} />)
  }

  function openCreateModal() {
    setFormError("")
    setForm({ email: "", password: "", role: "hr" })
    setModalState({ open: true, mode: "create", user: null })
  }

  function openEditModal(manager) {
    setFormError("")
    setForm({ email: manager.email || "", password: "", role: manager.role || "hr" })
    setModalState({ open: true, mode: "edit", user: manager })
  }

  function closeModal() {
    setModalState({ open: false, mode: "create", user: null })
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const isSaving = createManager.isPending || updateManager.isPending

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError("")

    if (!form.email) {
      setFormError("Email is required.")
      return
    }

    if (!form.role) {
      setFormError("Role is required.")
      return
    }

    if (modalState.mode === "create" && !form.password) {
      setFormError("Password is required to create a manager.")
      return
    }

    try {
      if (modalState.mode === "create") {
        await createManager.mutateAsync({
          email: form.email,
          password: form.password,
          role: form.role,
        })
      } else if (modalState.user?.id) {
        const payload = {}
        if (form.email) payload.email = form.email
        if (form.password) payload.password = form.password
        if (form.role) payload.role = form.role

        if (!Object.keys(payload).length) {
          setFormError("Provide at least one field to update.")
          return
        }

        await updateManager.mutateAsync({ id: modalState.user.id, payload })
      }

      closeModal()
    } catch (requestError) {
      const message = requestError?.response?.data?.message || "Request failed. Please try again."
      setFormError(message)
    }
  }

  return (
    <div className="space-y-4 p-6">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Managers</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage HR and Project Managers with their active work.</p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Add manager
          </button>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Loading managers...
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
              {error?.response?.data?.message || "Unable to load managers."}
            </div>
          ) : null}

          {!isLoading && !isError && managers.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              No managers found. Create HR or Project Manager accounts to get started.
            </div>
          ) : null}

          {managers.map((manager) => (
            <div
              key={manager.id}
              role="button"
              tabIndex={0}
              onClick={() => openManagerDetails(manager)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  openManagerDetails(manager)
                }
              }}
              className={`group relative flex cursor-pointer items-start justify-between rounded-2xl border border-border bg-background p-4 pr-16 transition-colors ${selectedManager?.id === manager.id ? "bg-secondary/60" : "hover:bg-secondary/30"}`}
            >
              <div>
                <h3 className="font-medium">{manager.email}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{roleLabel(manager.role)}</p>
                <p className="mt-2 text-xs text-muted-foreground">User ID: {manager.id}</p>
              </div>
              <div className="absolute -right-1 -top-1 z-10 rounded-full border border-border bg-background p-1 opacity-100 shadow-sm transition-all duration-150 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      openManagerDetails(manager)
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title="View"
                    aria-label={`View ${manager.email}`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      openEditModal(manager)
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    title="Edit"
                    aria-label={`Edit ${manager.email}`}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Selected manager detail</p>
        <p className="mt-2 text-sm text-muted-foreground">Click a manager above to open the full detail aside.</p>
      </section>

      <ManagerModal
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

function ManagerDetailPanel({ userId, fallbackManager }) {
  const navigate = useNavigate()
  const { data: userResponse, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.manager(userId),
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}`)
      return response.data
    },
    enabled: Boolean(userId),
  })

  const user = userResponse?.data || fallbackManager || null
  const isPm = user?.role === "pm"
  const employeeId = user?.employee?.id

  const { data: employeeResponse, isLoading: isLoadingEmployee } = useQuery({
    queryKey: queryKeys.hr.employee(employeeId),
    queryFn: async () => {
      const response = await apiClient.get(`/employees/${employeeId}`)
      return response.data
    },
    enabled: Boolean(isPm && employeeId),
  })

  const employee = employeeResponse?.data || null
  const managedProjects = Array.isArray(employee?.managedProjects) ? employee.managedProjects : []
  const recentTasks = Array.isArray(employee?.recentTasks) ? employee.recentTasks : []
  const accountDetails = [
    { label: "User ID", value: user?.id },
    { label: "Employee ID", value: user?.employee?.id || null },
    { label: "Name", value: user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : null },
    { label: "Role", value: user?.role ? roleLabel(user.role) : null },
    { label: "Email", value: user?.email },
    { label: "Created at", value: user?.createdAt },
    { label: "Updated at", value: user?.updatedAt },
  ].filter(({ value }) => value !== null && value !== undefined && value !== "")

  const openProject = (projectId) => {
    if (!projectId) return
    navigate(`/projects?projectId=${projectId}`)
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Manager profile</p>
        {isLoading ? (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading manager details...
          </div>
        ) : isError ? (
          <p className="mt-3 text-sm text-red-600">{error?.response?.data?.message || "Unable to load manager details."}</p>
        ) : (
          <>
            <h3 className="mt-1 text-xl font-semibold">{user?.email}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{user?.role ? roleLabel(user.role) : "-"}</p>
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
        <>
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
                  No managed projects found.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <p className="text-sm font-medium">Recent tasks</p>
            <div className="mt-3 space-y-2 text-sm">
              {recentTasks.length ? recentTasks.map((task) => (
                <button
                  key={task.id || task.title}
                  type="button"
                  onClick={() => openTask(task.id, task.projectId)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-left text-sm text-foreground hover:bg-secondary/60"
                >
                  {task.title || `Task #${task.id}`}
                </button>
              )) : (
                <p className="text-sm text-muted-foreground">
                  Recent tasks will appear here when the user details endpoint includes task data.
                </p>
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}

function ManagerModal({ modalState, form, onChange, onClose, onSubmit, errorMessage, isSaving }) {
  if (!modalState.open) return null

  const isEdit = modalState.mode === "edit"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Managers</p>
            <h3 className="mt-1 text-xl font-semibold">{isEdit ? "Edit manager" : "Create manager"}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {isEdit ? "Update manager access details." : "Create a new HR or Project Manager account."}
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
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={form.email}
              onChange={(event) => onChange("email", event.target.value)}
              placeholder="manager@worknexus.com"
            />
          </div>

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
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={form.password}
              onChange={(event) => onChange("password", event.target.value)}
              placeholder={isEdit ? "Leave blank to keep existing" : "Set an initial password"}
            />
            {isEdit ? (
              <p className="mt-1 text-xs text-muted-foreground">Optional for edits. Leave empty to keep the current password.</p>
            ) : null}
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
              {isSaving ? "Saving..." : isEdit ? "Save changes" : "Create manager"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
