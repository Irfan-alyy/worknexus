const projects = [
  {
    id: 1,
    title: "Website Redesign",
    description: "Frontend revamp for ACME",
    client: "Acme Corp",
    status: "In Progress",
    completion: 46,
    manager: "Imran Shah",
    channel: "#acme-website",
    dueDate: "2026-08-01",
    members: ["Imran Shah", "Waqar Ahmed", "Areeba Noor"],
    tasks: [
      { id: "T-101", title: "Design header", assignee: "Waqar Ahmed", status: "Completed", due: "2026-05-10", estimate: "2h", priority: "Low", blocker: "", timelogs: [{ id: 1, minutes: 30, note: 'Initial design' }] },
      { id: "T-102", title: "Implement responsive nav", assignee: "Areeba Noor", status: "In Progress", due: "2026-05-25", estimate: "8h", priority: "High", blocker: "API", timelogs: [] },
      { id: "T-103", title: "Footer accessibility", assignee: "Waqar Ahmed", status: "Pending", due: "2026-06-05", estimate: "3h", priority: "Medium", blocker: "", timelogs: [] },
      { id: "T-104", title: "Hero image optimization", assignee: "Waqar Ahmed", status: "Pending", due: "2026-06-08", estimate: "1h", priority: "Low", blocker: "", timelogs: [] },
      { id: "T-105", title: "Contact form integration", assignee: "Areeba Noor", status: "Pending", due: "2026-06-10", estimate: "4h", priority: "High", blocker: "API", timelogs: [] },
      { id: "T-106", title: "Setup analytics", assignee: "Waqar Ahmed", status: "Pending", due: "2026-06-12", estimate: "2h", priority: "Medium", blocker: "", timelogs: [] },
    ],
  },
  {
    id: 2,
    title: "API Migration",
    description: "Migrate to new payments API",
    client: "Beta Ltd",
    status: "Planning",
    completion: 12,
    manager: "Aisha Khan",
    channel: "#payments",
    dueDate: "2026-09-15",
    members: ["Aisha Khan", "Mariam Ali", "Waqar Ahmed"],
    tasks: [
      { id: "T-201", title: "Inventory endpoints", assignee: "Mariam Ali", status: "Pending", due: "2026-06-01", estimate: "5h", priority: "Medium", blocker: "", timelogs: [] },
      { id: "T-202", title: "Payments auth", assignee: "Waqar Ahmed", status: "Pending", due: "2026-06-15", estimate: "6h", priority: "High", blocker: "", timelogs: [] },
      { id: "T-203", title: "Webhook handlers", assignee: "Mariam Ali", status: "Pending", due: "2026-06-20", estimate: "4h", priority: "Medium", blocker: "", timelogs: [] },
    ],
  },
  {
    id: 3,
    title: "Mobile App Launch",
    description: "Release mobile app v1",
    client: "Gamma Co",
    status: "In Progress",
    completion: 34,
    manager: "Bilal Khan",
    channel: "#mobile-launch",
    dueDate: "2026-07-01",
    members: ["Bilal Khan", "Waqar Ahmed", "Mariam Ali"],
    tasks: [
      { id: "T-301", title: "Onboarding flow", assignee: "Waqar Ahmed", status: "In Progress", due: "2026-05-30", estimate: "6h", priority: "High", blocker: "UX", timelogs: [] },
      { id: "T-302", title: "Push notifications", assignee: "Mariam Ali", status: "Pending", due: "2026-06-02", estimate: "3h", priority: "Medium", blocker: "", timelogs: [] },
      { id: "T-303", title: "Crash reporting", assignee: "Waqar Ahmed", status: "Pending", due: "2026-06-04", estimate: "2h", priority: "Low", blocker: "", timelogs: [] },
      { id: "T-304", title: "App store listing", assignee: "Mariam Ali", status: "Pending", due: "2026-06-06", estimate: "1h", priority: "Low", blocker: "Copy", timelogs: [] },
      { id: "T-305", title: "Beta feedback triage", assignee: "Waqar Ahmed", status: "Pending", due: "2026-06-08", estimate: "4h", priority: "Medium", blocker: "", timelogs: [] },
      { id: "T-306", title: "Analytics events", assignee: "Waqar Ahmed", status: "Pending", due: "2026-06-10", estimate: "3h", priority: "Medium", blocker: "", timelogs: [] },
      { id: "T-307", title: "Localization", assignee: "Mariam Ali", status: "Pending", due: "2026-06-12", estimate: "5h", priority: "Low", blocker: "", timelogs: [] },
    ],
  },
  {
    id: 4,
    title: "Internal Tools",
    description: "Improve internal dashboards",
    client: "Worknexus",
    status: "At Risk",
    completion: 20,
    manager: "Sara Ahmed",
    channel: "#internal",
    dueDate: "2026-10-01",
    members: ["Sara Ahmed", "Waqar Ahmed"],
    tasks: [
      { id: "T-401", title: "Metrics dashboard", assignee: "Waqar Ahmed", status: "Pending", due: "2026-07-01", estimate: "8h", priority: "High", blocker: "API", timelogs: [] },
      { id: "T-402", title: "Admin permissions", assignee: "Sara Ahmed", status: "Pending", due: "2026-07-10", estimate: "6h", priority: "Medium", blocker: "", timelogs: [] },
      { id: "T-403", title: "Export reports", assignee: "Waqar Ahmed", status: "Pending", due: "2026-07-15", estimate: "4h", priority: "Low", blocker: "", timelogs: [] },
    ],
  },
  {
    id: 5,
    title: "Marketing Site",
    description: "Landing page improvements",
    client: "Delta Ads",
    status: "Planning",
    completion: 5,
    manager: "Nadia Rizvi",
    channel: "#marketing",
    dueDate: "2026-11-01",
    members: ["Nadia Rizvi", "Waqar Ahmed", "Areeba Noor"],
    tasks: [
      { id: "T-501", title: "Hero A/B tests", assignee: "Areeba Noor", status: "Pending", due: "2026-08-01", estimate: "8h", priority: "Medium", blocker: "", timelogs: [] },
      { id: "T-502", title: "Pricing table update", assignee: "Waqar Ahmed", status: "Pending", due: "2026-08-05", estimate: "3h", priority: "Low", blocker: "Copy", timelogs: [] },
      { id: "T-503", title: "SEO fixes", assignee: "Waqar Ahmed", status: "Pending", due: "2026-08-10", estimate: "5h", priority: "High", blocker: "", timelogs: [] },
      { id: "T-504", title: "Contact CTA", assignee: "Areeba Noor", status: "Pending", due: "2026-08-12", estimate: "2h", priority: "Low", blocker: "", timelogs: [] },
      { id: "T-505", title: "Image refresh", assignee: "Waqar Ahmed", status: "Pending", due: "2026-08-15", estimate: "4h", priority: "Medium", blocker: "Assets", timelogs: [] },
      { id: "T-506", title: "CMS migration", assignee: "Nadia Rizvi", status: "Pending", due: "2026-08-20", estimate: "10h", priority: "High", blocker: "Hosting", timelogs: [] },
    ],
  },
  {
    id: 6,
    title: "Security Audit",
    description: "Third-party security review",
    client: "Worknexus",
    status: "Planning",
    completion: 0,
    manager: "Adeel Khan",
    channel: "#security",
    dueDate: "2026-12-01",
    members: ["Adeel Khan", "Waqar Ahmed"],
    tasks: [
      { id: "T-601", title: "Penetration testing", assignee: "Waqar Ahmed", status: "Pending", due: "2026-09-01", estimate: "16h", priority: "High", blocker: "", timelogs: [] },
      { id: "T-602", title: "Dependency review", assignee: "Waqar Ahmed", status: "Pending", due: "2026-09-10", estimate: "8h", priority: "Medium", blocker: "", timelogs: [] },
    ],
  },
  {
    id: 7,
    title: "Customer Onboarding",
    description: "Streamline onboarding",
    client: "Epsilon",
    status: "In Progress",
    completion: 58,
    manager: "Zainab Farooq",
    channel: "#onboarding",
    dueDate: "2026-06-30",
    members: ["Zainab Farooq", "Mariam Ali"],
    tasks: [
      { id: "T-701", title: "Welcome emails", assignee: "Mariam Ali", status: "In Progress", due: "2026-05-28", estimate: "2h", priority: "Low", blocker: "Copy", timelogs: [] },
    ],
  },
  {
    id: 8,
    title: "Data Migration",
    description: "Migrate legacy data",
    client: "Omega",
    status: "Planning",
    completion: 2,
    manager: "Aisha Khan",
    channel: "#data",
    dueDate: "2027-01-01",
    members: ["Aisha Khan", "Waqar Ahmed", "Mariam Ali"],
    tasks: [
      { id: "T-801", title: "Schema mapping", assignee: "Mariam Ali", status: "Pending", due: "2026-10-01", estimate: "8h", priority: "High", blocker: "", timelogs: [] },
      { id: "T-802", title: "ETL pipeline", assignee: "Waqar Ahmed", status: "Pending", due: "2026-10-15", estimate: "20h", priority: "High", blocker: "Infra", timelogs: [] },
      { id: "T-803", title: "Data validation", assignee: "Waqar Ahmed", status: "Pending", due: "2026-10-20", estimate: "10h", priority: "Medium", blocker: "", timelogs: [] },
      { id: "T-804", title: "Sampling checks", assignee: "Mariam Ali", status: "Pending", due: "2026-10-25", estimate: "4h", priority: "Low", blocker: "", timelogs: [] },
      { id: "T-805", title: "Rollback plan", assignee: "Aisha Khan", status: "Pending", due: "2026-10-30", estimate: "3h", priority: "Medium", blocker: "", timelogs: [] },
      { id: "T-806", title: "Dry run migration", assignee: "Waqar Ahmed", status: "Pending", due: "2026-11-01", estimate: "12h", priority: "High", blocker: "", timelogs: [] },
      { id: "T-807", title: "Final migration", assignee: "Waqar Ahmed", status: "Pending", due: "2026-12-01", estimate: "24h", priority: "High", blocker: "Window", timelogs: [] },
      { id: "T-808", title: "Post-migration checks", assignee: "Mariam Ali", status: "Pending", due: "2026-12-05", estimate: "6h", priority: "Medium", blocker: "", timelogs: [] },
    ],
  },
]

// Add extra projects for testing (projects 9-12)
projects.push(
  {
    id: 9,
    title: "Client Portal",
    description: "Self-service portal",
    client: "Sigma",
    status: "Planning",
    completion: 0,
    manager: "Imran Shah",
    channel: "#client-portal",
    dueDate: "2026-12-01",
    members: ["Imran Shah", "Waqar Ahmed"],
    tasks: [
      { id: "T-901", title: "Auth flow", assignee: "Waqar Ahmed", status: "Pending", due: "2026-09-01", estimate: "8h", priority: "High", blocker: "", timelogs: [] },
      { id: "T-902", title: "Settings page", assignee: "Imran Shah", status: "Pending", due: "2026-09-10", estimate: "5h", priority: "Medium", blocker: "", timelogs: [] },
    ],
  },
  {
    id: 10,
    title: "Billing Revamp",
    description: "Improve billing UX",
    client: "Theta",
    status: "In Progress",
    completion: 22,
    manager: "Aisha Khan",
    channel: "#billing",
    dueDate: "2026-10-01",
    members: ["Aisha Khan", "Waqar Ahmed", "Mariam Ali"],
    tasks: [
      { id: "T-1001", title: "Invoice redesign", assignee: "Waqar Ahmed", status: "In Progress", due: "2026-08-01", estimate: "6h", priority: "Medium", blocker: "", timelogs: [] },
      { id: "T-1002", title: "Refund flow", assignee: "Mariam Ali", status: "Pending", due: "2026-08-15", estimate: "4h", priority: "High", blocker: "Payments API", timelogs: [] },
    ],
  },
  {
    id: 11,
    title: "Analytics Upgrade",
    description: "Event pipeline improvements",
    client: "Kappa",
    status: "Planning",
    completion: 5,
    manager: "Bilal Khan",
    channel: "#analytics",
    dueDate: "2026-11-01",
    members: ["Bilal Khan", "Waqar Ahmed"],
    tasks: [
      { id: "T-1101", title: "Event schema", assignee: "Waqar Ahmed", status: "Pending", due: "2026-09-20", estimate: "8h", priority: "High", blocker: "", timelogs: [] },
      { id: "T-1102", title: "Dashboard widgets", assignee: "Mariam Ali", status: "Pending", due: "2026-09-25", estimate: "6h", priority: "Medium", blocker: "", timelogs: [] },
    ],
  },
  {
    id: 12,
    title: "Maintenance Sprint",
    description: "Technical debt and cleanup",
    client: "Worknexus",
    status: "In Progress",
    completion: 10,
    manager: "Sara Ahmed",
    channel: "#maintenance",
    dueDate: "2026-07-30",
    members: ["Sara Ahmed", "Waqar Ahmed", "Mariam Ali"],
    tasks: [
      { id: "T-1201", title: "Refactor utils", assignee: "Waqar Ahmed", status: "Pending", due: "2026-06-30", estimate: "10h", priority: "Medium", blocker: "", timelogs: [] },
      { id: "T-1202", title: "Upgrade deps", assignee: "Mariam Ali", status: "Pending", due: "2026-06-25", estimate: "8h", priority: "High", blocker: "", timelogs: [] },
    ],
  },
)

let nextTimelogId = 1000

export function getProjects() {
  return JSON.parse(JSON.stringify(projects))
}

export function getProjectById(id) {
  const p = projects.find((x) => x.id === Number(id))
  return p ? JSON.parse(JSON.stringify(p)) : null
}

export function createTask(projectId, task) {
  const p = projects.find((x) => x.id === Number(projectId))
  if (!p) throw new Error("Project not found")
  const id = task.id || `T-${Math.floor(Math.random() * 9000) + 100}`
  const newTask = { ...task, id, timelogs: task.timelogs || [] }
  p.tasks.push(newTask)
  return JSON.parse(JSON.stringify(newTask))
}

export function updateTask(projectId, taskId, updates) {
  const p = projects.find((x) => x.id === Number(projectId))
  if (!p) throw new Error("Project not found")
  const t = p.tasks.find((tt) => tt.id === taskId)
  if (!t) throw new Error("Task not found")
  Object.assign(t, updates)
  return JSON.parse(JSON.stringify(t))
}

export function addTimelog(projectId, taskId, { minutes, note }) {
  const p = projects.find((x) => x.id === Number(projectId))
  if (!p) throw new Error("Project not found")
  const t = p.tasks.find((tt) => tt.id === taskId)
  if (!t) throw new Error("Task not found")
  const entry = { id: nextTimelogId++, minutes: Number(minutes) || 0, note: note || "" }
  t.timelogs = t.timelogs || []
  t.timelogs.push(entry)
  return JSON.parse(JSON.stringify(entry))
}

export default { getProjects, getProjectById, createTask, updateTask, addTimelog }
