import { useState } from "react"
import { useGlobalStore } from "@/stores/use-global-store"

const managers = [
  {
    id: 1,
    name: "Aisha Khan",
    role: "HR Manager",
    projects: ["Onboarding Revamp", "Policy Sync"],
    status: "Active",
    notes: "Tracking hiring pipeline and employee support tasks.",
  },
  {
    id: 2,
    name: "Imran Shah",
    role: "Project Manager",
    projects: ["Website Redesign", "Mobile App v2"],
    status: "Active",
    notes: "Oversees delivery timelines and client updates.",
  },
]

const ongoingProjects = [
  {
    title: "Website Redesign",
    owner: "Imran Shah",
    progress: "74%",
    status: "In progress",
  },
  {
    title: "Onboarding Revamp",
    owner: "Aisha Khan",
    progress: "58%",
    status: "In progress",
  },
  {
    title: "Mobile App v2",
    owner: "Imran Shah",
    progress: "41%",
    status: "At risk",
  },
]

export default function AdminManagers({ onEdit }) {
  const { openAside } = useGlobalStore()
  const [selectedManager, setSelectedManager] = useState(managers[0])

  function openManagerDetails(manager) {
    setSelectedManager(manager)
    openAside(`Manager detail: ${manager.name}`, <ManagerDetailPanel manager={manager} />)
  }

  return (
    <div className="space-y-4">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Managers</h2>
            <p className="mt-1 text-sm text-muted-foreground">Manage HR and Project Managers with their active work.</p>
          </div>
          <button
            type="button"
            onClick={() => onEdit("Add manager", <ManagerEditor manager={{ name: "New Manager", role: "HR Manager" }} />)}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Add manager
          </button>
        </div>

        <div className="space-y-3">
          {managers.map((manager) => (
            <button
              key={manager.id}
              type="button"
              onClick={() => openManagerDetails(manager)}
              className={`flex w-full items-start justify-between rounded-2xl border p-4 text-left transition-colors ${selectedManager.id === manager.id ? "border-border bg-secondary/60" : "border-border bg-background hover:bg-secondary/30"}`}
            >
              <div>
                <h3 className="font-medium">{manager.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{manager.role}</p>
                <p className="mt-2 text-sm text-muted-foreground">Projects: {manager.projects.join(", ")}</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600">
                {manager.status}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Selected manager detail</p>
        <p className="mt-2 text-sm text-muted-foreground">Click a manager above to open the full detail aside.</p>
      </section>

    </div>
  )
}

function ManagerDetailPanel({ manager }) {
  const projects = ongoingProjects.filter((project) => project.owner === manager.name)

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Manager profile</p>
        <h3 className="mt-1 text-xl font-semibold">{manager.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{manager.role}</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Summary</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{manager.notes}</p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Projects handled</p>
        <div className="mt-3 space-y-3">
          {manager.projects.map((project) => (
            <div key={project} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {project}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Ongoing work</p>
        <div className="mt-3 space-y-3">
          {projects.map((project) => (
            <div key={project.title} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium">{project.title}</span>
                <span className="text-xs text-muted-foreground">{project.progress}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Status: {project.status}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ManagerEditor({ manager }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Edit manager: {manager.name}</p>
      <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" defaultValue={manager.name} />
      <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" defaultValue={manager.role} />
      <textarea className="min-h-28 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" defaultValue={manager.notes} />
      <div className="flex justify-end">
        <button type="button" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Save changes
        </button>
      </div>
    </div>
  )
}

function ManagerDetails({ manager }) {
  return (
    <div className="space-y-3 text-sm">
      <p><span className="font-medium">Name:</span> {manager.name}</p>
      <p><span className="font-medium">Role:</span> {manager.role}</p>
      <p><span className="font-medium">Projects:</span> {manager.projects.join(", ")}</p>
      <p><span className="font-medium">Status:</span> {manager.status}</p>
      <p className="leading-6 text-muted-foreground">{manager.notes}</p>
    </div>
  )
}
