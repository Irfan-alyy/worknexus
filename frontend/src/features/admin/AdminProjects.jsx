import { useEffect, useMemo, useState } from "react"
import { Edit, Eye, Plus, X, Trash2 } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import apiClient from "@/lib/axios"
import { queryKeys } from "@/config/query-keys"
import { useGlobalStore } from "@/stores/use-global-store"

function StatCard({ label, value, note }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  )
}

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

const statusBadgeStyles = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  active: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
}

function formatStatus(status) {
  if (!status) return "Unknown"
  const match = statusOptions.find((option) => option.value === status)
  return match?.label || status
}

export default function AdminProjects({ onEdit }) {
  const { user, openAside } = useGlobalStore()
  const queryClient = useQueryClient()
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [modalState, setModalState] = useState({ open: false, mode: "create", project: null })
  const [formError, setFormError] = useState("")
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "pending",
    client_id: "",
    manager_employee_id: "",
  })

  const openDetail = onEdit ?? openAside

  const { data: projectsResponse, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.projects(),
    queryFn: async () => {
      const response = await apiClient.get("/projects")
      return response.data
    },
  })

  const { data: clientsResponse } = useQuery({
    queryKey: queryKeys.admin.clients(),
    queryFn: async () => {
      const response = await apiClient.get("/clients")
      return response.data
    },
  })

  const { data: employeesResponse } = useQuery({
    queryKey: queryKeys.hr.employees(),
    queryFn: async () => {
      const response = await apiClient.get("/employees")
      return response.data
    },
  })

  const projects = useMemo(() => projectsResponse?.data || [], [projectsResponse])
  const clients = useMemo(() => clientsResponse?.data || [], [clientsResponse])
  const employees = useMemo(() => employeesResponse?.data || [], [employeesResponse])

  const managerOptions = useMemo(() => employees.filter((employee) => employee.user?.role === "pm"), [employees])

  const managerMap = useMemo(() => {
    const map = new Map()
    employees.forEach((employee) => {
      map.set(employee.id, `${employee.firstName || ""} ${employee.lastName || ""}`.trim())
    })
    return map
  }, [employees])

  useEffect(() => {
    if (!selectedProjectId && projects.length) {
      setSelectedProjectId(projects[0].id)
    }
  }, [projects, selectedProjectId])

  const createProject = useMutation({
    mutationFn: (payload) => apiClient.post("/projects", payload).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.projects() }),
  })

  const updateProject = useMutation({
    mutationFn: ({ id, payload }) => apiClient.patch(`/projects/${id}`, payload).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.projects() }),
  })

  const selectedProject = projects.find((project) => project.id === selectedProjectId) || projects[0]

  function openProjectDetails(project) {
    setSelectedProjectId(project.id)
    openDetail(
      `Project detail: ${project.name}`,
      <ProjectDetailPanel projectId={project.id} fallbackProject={project} managerMap={managerMap} />
    )
  }

  function openCreateModal() {
    setFormError("")
    setForm({
      name: "",
      description: "",
      status: "pending",
      client_id: clients[0]?.id ? String(clients[0].id) : "",
      manager_employee_id: "",
    })
    setModalState({ open: true, mode: "create", project: null })
  }

  function openEditModal(project) {
    setFormError("")
    setForm({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "pending",
      client_id: project.clientId ? String(project.clientId) : String(project.client?.id || ""),
      manager_employee_id: project.managerEmployeeId ? String(project.managerEmployeeId) : "",
    })
    setModalState({ open: true, mode: "edit", project })
  }

  function closeModal() {
    setModalState({ open: false, mode: "create", project: null })
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const isSaving = createProject.isPending || updateProject.isPending

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError("")

    if (!form.name.trim()) {
      setFormError("Project name is required.")
      return
    }

    if (!form.client_id) {
      setFormError("Client is required.")
      return
    }

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
      status: form.status,
      client_id: Number(form.client_id),
    }

    if (form.manager_employee_id) {
      payload.manager_employee_id = Number(form.manager_employee_id)
    }

    try {
      if (modalState.mode === "create") {
        await createProject.mutateAsync(payload)
      } else if (modalState.project?.id) {
        const updatePayload = {}
        const project = modalState.project
        const currentClientId = project.clientId || project.client?.id || null
        if (payload.name !== project.name) updatePayload.name = payload.name
        if ((payload.description || "") !== (project.description || "")) updatePayload.description = payload.description || ""
        if (payload.status !== project.status) updatePayload.status = payload.status
        if (payload.client_id !== currentClientId) updatePayload.client_id = payload.client_id
        if (payload.manager_employee_id && payload.manager_employee_id !== project.managerEmployeeId) {
          updatePayload.manager_employee_id = payload.manager_employee_id
        }

        if (!Object.keys(updatePayload).length) {
          setFormError("Provide at least one field to update.")
          return
        }

        await updateProject.mutateAsync({ id: modalState.project.id, payload: updatePayload })
      }

      closeModal()
    } catch (requestError) {
      const message = requestError?.response?.data?.message || "Request failed. Please try again."
      setFormError(message)
    }
  }

  const statusSummary = useMemo(() => {
    return projects.reduce(
      (acc, project) => {
        acc.total += 1
        const status = project.status || "pending"
        acc.byStatus[status] = (acc.byStatus[status] || 0) + 1
        return acc
      },
      { total: 0, byStatus: {} },
    )
  }, [projects])

  return (
    <div className="h-full min-h-0 overflow-y-auto p-4 sm:p-6">
      <div className="space-y-6 rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="mt-1 text-sm text-muted-foreground">Signed in as {user?.email || user?.name || "Guest"}.</p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            title="Add project"
            aria-label="Add project"
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            Add project
          </button>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Projects" value={String(statusSummary.total)} note="Total projects" />
          <StatCard label="Active" value={String(statusSummary.byStatus.active || 0)} note="In progress" />
          <StatCard label="Completed" value={String(statusSummary.byStatus.completed || 0)} note="Delivered" />
        </section>

        <section className="space-y-3">
          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              Loading projects...
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
              {error?.response?.data?.message || "Unable to load projects."}
            </div>
          ) : null}

          {!isLoading && !isError && projects.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
              No projects found. Create a project to get started.
            </div>
          ) : null}

          {projects.map((project) => {
            const statusLabel = formatStatus(project.status)
            return (
              <article
                key={project.id}
                role="button"
                tabIndex={0}
                onClick={() => openProjectDetails(project)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    openProjectDetails(project)
                  }
                }}
                className={`group relative cursor-pointer rounded-3xl border bg-card p-5 shadow-sm transition-colors ${selectedProject?.id === project.id ? "bg-secondary/60" : "hover:bg-secondary/30"}`}
              >
                <div className="absolute -top-4 right-4 z-10 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                  <div className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 shadow-sm">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        openProjectDetails(project)
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-sm"
                      title="View"
                      aria-label={`View ${project.name}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        openEditModal(project)
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-sm"
                      title="Edit"
                      aria-label={`Edit ${project.name}`}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="mt-1 text-lg font-semibold">{project.name}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeStyles[project.status] || "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{project.description || "No description provided."}</p>
                    <p className="mt-2 text-sm text-muted-foreground">Client: {project.client?.name || "N/A"}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Manager: {managerMap.get(project.managerEmployeeId) || "Unassigned"}
                    </p>
                  </div>

                  <div className="min-w-[11rem] rounded-2xl border border-border bg-background p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                    <p className="mt-1 text-sm font-medium">{statusLabel}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Updated from project service</p>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-medium">Selected project detail</p>
          <p className="mt-2 text-sm text-muted-foreground">Click a project to open the full detail aside.</p>
        </section>
      </div>

      <ProjectModal
        modalState={modalState}
        form={form}
        onChange={updateField}
        onClose={closeModal}
        onSubmit={handleSubmit}
        errorMessage={formError}
        isSaving={isSaving}
        clients={clients}
        managerOptions={managerOptions}
      />
    </div>
  )
}

function ProjectModal({ modalState, form, onChange, onClose, onSubmit, errorMessage, isSaving, clients, managerOptions }) {
  if (!modalState.open) return null

  const isEdit = modalState.mode === "edit"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-4 shadow-2xl sm:max-w-3xl sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Projects</p>
            <h3 className="mt-1 text-xl font-semibold">{isEdit ? "Edit project" : "Create project"}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {isEdit ? "Update project details and ownership." : "Create a new project record."}
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
            <label className="text-sm font-medium">Project name</label>
            <input
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="WorkNexus Platform"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={form.description}
              onChange={(event) => onChange("description", event.target.value)}
              placeholder="What is this project about?"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Client</label>
              <select
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={form.client_id}
                onChange={(event) => onChange("client_id", event.target.value)}
              >
                <option value="">Select client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Project manager</label>
              <select
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={form.manager_employee_id}
                onChange={(event) => onChange("manager_employee_id", event.target.value)}
              >
                <option value="">Unassigned</option>
                {managerOptions.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={form.status}
              onChange={(event) => onChange("status", event.target.value)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : isEdit ? "Save changes" : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ProjectDetailPanel({ projectId, fallbackProject, managerMap }) {
  const queryClient = useQueryClient()
  const { user } = useGlobalStore()
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState(new Set())
  const [addMemberError, setAddMemberError] = useState("")

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.project(projectId),
    queryFn: async () => {
      const response = await apiClient.get(`/projects/${projectId}`)
      return response.data
    },
  })

  const { data: employeesResponse } = useQuery({
    queryKey: queryKeys.hr.employees(),
    queryFn: async () => {
      const response = await apiClient.get("/employees")
      return response.data
    },
  })

  const project = data?.data || fallbackProject
  const statusLabel = formatStatus(project?.status)
  const managerLabel = managerMap?.get(project?.managerEmployeeId) || "Unassigned"
  const employees = useMemo(() => employeesResponse?.data || [], [employeesResponse])
  const members = useMemo(() => project?.teamMembers || [], [project?.teamMembers])

  // Get available employees (those not already in the team)
  // If user is PM, exclude other PMs from the list (show only employees)
  // If user is admin/hr, show all available (including PMs)
  const availableEmployees = useMemo(() => {
    const memberIds = new Set(
      members.map((m) => m.employee_id || m.employeeId) // Handle both snake_case and camelCase
    )
    let filtered = employees.filter((emp) => !memberIds.has(emp.id))

    // If current user is a PM, exclude other PMs from the list
    if (user?.role === "pm") {
      filtered = filtered.filter((emp) => emp.user?.role !== "pm")
    }

    return filtered
  }, [employees, members, user?.role])

  // Add team member mutation
  const addTeamMember = useMutation({
    mutationFn: async (employeeIds) => {
      // Send multiple requests for each employee
      const results = []
      const response = await apiClient.post(`/projects/${projectId}/team`, { employee_ids: employeeIds })
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.project(projectId) })
      setShowAddMemberModal(false)
      setSelectedEmployeeIds(new Set())
      setAddMemberError("")
    },
    onError: (err) => {
      setAddMemberError(err?.response?.data?.message || "Failed to add team members")
    },
  })

  // Remove team member mutation
  const removeTeamMember = useMutation({
    mutationFn: (employeeId) => apiClient.delete(`/projects/${projectId}/team/${employeeId}`).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.project(projectId) })
    },
  })

  const canManageTeam = user?.role === "admin" || user?.role === "hr" || user?.role === "pm"

  if (isLoading && !project) {
    return <div className="text-sm text-muted-foreground">Loading project details...</div>
  }

  if (isError && !project) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
        {error?.response?.data?.message || "Unable to load project details."}
      </div>
    )
  }

  function handleAddMember(event) {
    event.preventDefault()
    setAddMemberError("")

    if (selectedEmployeeIds.size === 0) {
      setAddMemberError("Please select at least one employee")
      return
    }

    addTeamMember.mutate(Array.from(selectedEmployeeIds))
  }

  function toggleEmployeeSelection(employeeId) {
    setSelectedEmployeeIds((prev) => {
      const updated = new Set(prev)
      if (updated.has(employeeId)) {
        updated.delete(employeeId)
      } else {
        updated.add(employeeId)
      }
      return updated
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Project overview</p>
        <h3 className="mt-1 text-xl font-semibold">{project?.name || "Project"}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Client: {project?.client?.name || "N/A"} • Manager: {managerLabel}
        </p>
        <div className="mt-2 inline-flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeStyles[project?.status] || "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>
            {statusLabel}
          </span>
          <span className="text-xs text-muted-foreground">Project ID: {project?.id}</span>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Description</p>
        <p className="mt-2 text-sm text-muted-foreground">{project?.description || "No description provided."}</p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Team members</p>
          {canManageTeam && (
            <button
              type="button"
              onClick={() => setShowAddMemberModal(true)}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
              title="Add team member"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          )}
        </div>

        <div className="mt-3 space-y-2">
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">No team members assigned.</p>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2"
              >
                <div className="text-sm">
                  <p className="font-medium text-foreground">
                    {member.employee?.firstName} {member.employee?.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.employee?.user?.email}</p>
                </div>
                {canManageTeam && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Are you sure you want to remove this team member?")) {
                        removeTeamMember.mutate(member.employee_id || member.employeeId)
                      }
                    }}
                    disabled={removeTeamMember.isPending}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Remove team member"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Team Management</p>
                <h3 className="mt-1 text-xl font-semibold">Add team members</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddMemberModal(false)
                  setSelectedEmployeeIds(new Set())
                  setAddMemberError("")
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-medium">Select employees</label>
                <div className="mt-2 max-h-60 space-y-2 overflow-y-auto rounded-xl border border-border bg-background p-3">
                  {availableEmployees.length === 0 ? (
                    <p className="text-sm text-muted-foreground">All employees are already in the project.</p>
                  ) : (
                    availableEmployees.map((employee) => (
                      <label
                        key={employee.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-secondary/50"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEmployeeIds.has(employee.id)}
                          onChange={() => toggleEmployeeSelection(employee.id)}
                          className="h-4 w-4 rounded"
                        />
                        <div className="flex-1 text-sm">
                          <p className="font-medium text-foreground">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">{employee.user?.email}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {addMemberError && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
                  {addMemberError}
                </div>
              )}

              {selectedEmployeeIds.size > 0 && (
                <div className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-600">
                  {selectedEmployeeIds.size} employee{selectedEmployeeIds.size !== 1 ? "s" : ""} selected
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false)
                    setSelectedEmployeeIds(new Set())
                    setAddMemberError("")
                  }}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addTeamMember.isPending || selectedEmployeeIds.size === 0}
                  className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addTeamMember.isPending ? "Adding..." : `Add ${selectedEmployeeIds.size || 0} member${selectedEmployeeIds.size !== 1 ? "s" : ""}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
