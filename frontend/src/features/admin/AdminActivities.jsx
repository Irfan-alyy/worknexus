import { useState } from "react"
import { useGlobalStore } from "@/stores/use-global-store"

const activities = [
  {
    id: 1,
    type: "Project added",
    title: "Website Redesign created",
    actor: "Admin",
    time: "10 minutes ago",
    description: "A new project was created and assigned to the delivery team.",
    details: ["Assigned PM: Imran Shah", "Client: Acme Corp", "Status: Planning"],
  },
  {
    id: 2,
    type: "Manager added",
    title: "Project manager onboarded",
    actor: "Admin",
    time: "25 minutes ago",
    description: "A new project manager was added to oversee an active client project.",
    details: ["Manager: Imran Shah", "Projects: Website Redesign, Mobile App v2", "Role: Project Manager"],
  },
  {
    id: 3,
    type: "Department updated",
    title: "People Operations expanded",
    actor: "Admin",
    time: "1 hour ago",
    description: "A department was updated with extra teams and reporting structure.",
    details: ["Created: 2023-11-01", "Teams: HR Team, Recruitment Team, Payroll Support", "Lead: Aisha Khan"],
  },
  {
    id: 4,
    type: "Client updated",
    title: "Acme Corp details changed",
    actor: "Admin",
    time: "2 hours ago",
    description: "Client contact and project description were updated for active work.",
    details: ["Project: Website Redesign", "Contact synced", "Description refreshed"],
  },
]

export default function AdminActivities() {
  const { openAside } = useGlobalStore()
  const [selectedActivity, setSelectedActivity] = useState(activities[0])

  function openActivityDetail(activity) {
    setSelectedActivity(activity)
    openAside(`Activity detail: ${activity.type}`, <ActivityDetailPanel activity={activity} />)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Admin Activities</h2>
        <p className="mt-1 text-sm text-muted-foreground">All important admin events appear here, from project creation to manager updates.</p>
      </div>

      <div className="grid gap-3">
        {activities.map((activity) => (
          <button
            key={activity.id}
            type="button"
            onClick={() => openActivityDetail(activity)}
            className={`rounded-2xl border p-4 text-left transition-colors ${selectedActivity.id === activity.id ? "border-border bg-secondary/60" : "border-border bg-background hover:bg-secondary/30"}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{activity.type}</p>
                <h3 className="mt-1 text-base font-medium">{activity.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{activity.description}</p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                {activity.time}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function ActivityDetailPanel({ activity }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Activity profile</p>
        <h3 className="mt-1 text-xl font-semibold">{activity.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{activity.type} • {activity.time}</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Description</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{activity.description}</p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Details</p>
        <div className="mt-3 space-y-2">
          {activity.details.map((detail) => (
            <div key={detail} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">
              {detail}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}