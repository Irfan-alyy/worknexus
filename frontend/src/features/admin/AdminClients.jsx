import { Eye, Edit, Plus, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import apiClient from "@/lib/axios"
import { queryKeys } from "@/config/query-keys"
import { useGlobalStore } from "@/stores/use-global-store"

export default function AdminClients() {
  const { openAside } = useGlobalStore()
  const queryClient = useQueryClient()
  const [selectedClientId, setSelectedClientId] = useState(null)
  const [modalState, setModalState] = useState({ open: false, mode: "create", client: null })
  const [form, setForm] = useState({ name: "", email: "", company: "" })
  const [formError, setFormError] = useState("")

  const { data: clientsResponse, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.admin.clients(),
    queryFn: async () => {
      const response = await apiClient.get("/clients")
      return response.data
    },
  })

  const clients = useMemo(() => clientsResponse?.data || [], [clientsResponse])

  const createClient = useMutation({
    mutationFn: (payload) => apiClient.post("/clients", payload).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.clients() }),
  })

  const updateClient = useMutation({
    mutationFn: ({ id, payload }) => apiClient.patch(`/clients/${id}`, payload).then((res) => res.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.clients() }),
  })

  useEffect(() => {
    if (!selectedClientId && clients.length) {
      setSelectedClientId(clients[0].id)
    }
  }, [clients, selectedClientId])

  const selectedClient = clients.find((client) => client.id === selectedClientId) || clients[0]

  function openClientDetails(client) {
    setSelectedClientId(client.id)
    openAside(`Client detail: ${client.name}`, <ClientDetail client={client} />)
  }

  function openCreateModal() {
    setFormError("")
    setForm({ name: "", email: "", company: "" })
    setModalState({ open: true, mode: "create", client: null })
  }

  function openEditModal(client) {
    setFormError("")
    setForm({ name: client.name || "", email: client.email || "", company: client.company || "" })
    setModalState({ open: true, mode: "edit", client })
  }

  function closeModal() {
    setModalState({ open: false, mode: "create", client: null })
  }

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const isSaving = createClient.isPending || updateClient.isPending

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError("")

    if (!form.name || !form.email) {
      setFormError("Name and email are required.")
      return
    }

    const payload = {
      name: form.name,
      email: form.email,
      company: form.company,
    }

    try {
      if (modalState.mode === "create") {
        await createClient.mutateAsync(payload)
      } else if (modalState.client?.id) {
        const updatePayload = {}
        if (form.name) updatePayload.name = form.name
        if (form.email) updatePayload.email = form.email
        if (form.company) updatePayload.company = form.company

        if (!Object.keys(updatePayload).length) {
          setFormError("Provide at least one field to update.")
          return
        }

        await updateClient.mutateAsync({ id: modalState.client.id, payload: updatePayload })
      }

      closeModal()
    } catch (requestError) {
      const message = requestError?.response?.data?.message || "Request failed. Please try again."
      setFormError(message)
    }
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Clients</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage client contacts and companies.</p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Add client
        </button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            Loading clients...
          </div>
        ) : null}

        {isError ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600">
            {error?.response?.data?.message || "Unable to load clients."}
          </div>
        ) : null}

        {!isLoading && !isError && clients.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No clients found. Create a client to get started.
          </div>
        ) : null}

        {clients.map((client) => (
          <div
            key={client.id}
            role="button"
            tabIndex={0}
            onClick={() => openClientDetails(client)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                openClientDetails(client)
              }
            }}
            className={`group relative flex cursor-pointer items-start justify-between rounded-2xl border border-border bg-background p-4 pr-16 transition-colors ${selectedClient?.id === client.id ? "bg-secondary/60" : "hover:bg-secondary/30"}`}
          >
            <div>
              <h3 className="font-medium">{client.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{client.email}</p>
              {client.company ? (
                <p className="mt-2 text-xs text-muted-foreground">Company: {client.company}</p>
              ) : null}
            </div>
            <div className="absolute -right-1 -top-1 z-10 rounded-full border border-border bg-background p-1 opacity-0 shadow-sm transition-all duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    openClientDetails(client)
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="View"
                  aria-label={`View ${client.name}`}
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    openEditModal(client)
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  title="Edit"
                  aria-label={`Edit ${client.name}`}
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Selected client detail</p>
        <p className="mt-2 text-sm text-muted-foreground">Click a client above to open the full detail aside.</p>
      </section>

      <ClientModal
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

function ClientDetail({ client }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Client profile</p>
        <h3 className="mt-1 text-xl font-semibold">{client.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{client.email}</p>
      </div>
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Account details</p>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <p><span className="font-medium text-foreground">Client ID:</span> {client.id}</p>
          <p><span className="font-medium text-foreground">Company:</span> {client.company || "-"}</p>
          <p><span className="font-medium text-foreground">Email:</span> {client.email}</p>
        </div>
      </section>
    </div>
  )
}

function ClientModal({ modalState, form, onChange, onClose, onSubmit, errorMessage, isSaving }) {
  if (!modalState.open) return null

  const isEdit = modalState.mode === "edit"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Clients</p>
            <h3 className="mt-1 text-xl font-semibold">{isEdit ? "Edit client" : "Create client"}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {isEdit ? "Update the client details." : "Create a new client record."}
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
            <label className="text-sm font-medium">Client name</label>
            <input
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="Acme Corp"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={form.email}
              onChange={(event) => onChange("email", event.target.value)}
              placeholder="billing@acme.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Company</label>
            <input
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              value={form.company}
              onChange={(event) => onChange("company", event.target.value)}
              placeholder="Acme Holdings"
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
              {isSaving ? "Saving..." : isEdit ? "Save changes" : "Create client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
