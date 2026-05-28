import { useState } from "react"
import { useGlobalStore } from "@/stores/use-global-store"

const departments = [
  {
    id: 1,
    name: "Product Delivery",
    createdAt: "2024-02-14",
    projectManager: "Imran Shah",
    teams: ["Frontend Team", "QA Team", "UX Team"],
    projects: ["Website Redesign", "Mobile App v2"],
    notes: "Handles client-facing delivery and feature releases.",
  },
  {
    id: 2,
    name: "People Operations",
    createdAt: "2023-11-01",
    projectManager: "Aisha Khan",
    teams: ["HR Team", "Recruitment Team", "Payroll Support"],
    projects: ["Onboarding Revamp", "Policy Sync"],
    notes: "Coordinates hiring, onboarding, employee support, and policy work.",
  },
]

export default function AdminDepartments({ onEdit }) {
  const { openAside } = useGlobalStore()
  const [selectedDepartment, setSelectedDepartment] = useState(departments[0])

  function openDepartmentDetail(department) {
    setSelectedDepartment(department)
    openAside(`Department detail: ${department.name}`, <DepartmentDetailPanel department={department} />)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Departments</h2>
          <p className="mt-1 text-sm text-muted-foreground">Click a department to see its created date, teams, and project manager.</p>
        </div>
        <button
          type="button"
          onClick={() => onEdit?.("Add department", <DepartmentEditor department={{ name: "New Department", createdAt: "2026-01-01", projectManager: "Assign later", teams: [], projects: [], notes: "" }} />)}
          className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Add department
        </button>
      </div>

      <div className="grid gap-3">
        {departments.map((department) => (
          <button
            key={department.id}
            type="button"
            onClick={() => openDepartmentDetail(department)}
            className={`flex items-start justify-between rounded-2xl border p-4 text-left transition-colors ${selectedDepartment.id === department.id ? "border-border bg-secondary/60" : "border-border bg-background hover:bg-secondary/30"}`}
          >
            <div>
              <h3 className="font-medium">{department.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Created: {department.createdAt}</p>
              <p className="mt-2 text-sm text-muted-foreground">Project Manager: {department.projectManager}</p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
              {department.projects.length} projects
            </span>
          </button>
        ))}
      </div>

    </div>
  )
}

function DepartmentDetailPanel({ department }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Department profile</p>
        <h3 className="mt-1 text-xl font-semibold">{department.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Created on {department.createdAt}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{department.notes}</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Project Manager</p>
        <p className="mt-2 text-sm text-muted-foreground">{department.projectManager}</p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Teams working here</p>
        <div className="mt-3 space-y-2">
          {department.teams.map((team) => (
            <div key={team} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {team}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Projects in this department</p>
        <div className="mt-3 space-y-2">
          {department.projects.map((project) => (
            <div key={project} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {project}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function DepartmentEditor({ department }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Edit department: {department.name}</p>
      <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" defaultValue={department.name} />
      <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" defaultValue={department.createdAt} />
      <input className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" defaultValue={department.projectManager} />
      <textarea className="min-h-28 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm" defaultValue={department.notes} />
      <div className="flex justify-end">
        <button type="button" className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Save changes
        </button>
      </div>
    </div>
  )
}