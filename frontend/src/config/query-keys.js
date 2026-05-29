const authKeys = {
  all: ["auth"],
  me: () => [...authKeys.all, "me"],
}

const chatKeys = {
  all: ["chat"],
  channels: (filters = {}) => [...chatKeys.all, "channels", filters],
  channel: (channelId) => [...chatKeys.all, "channel", channelId],
  messages: (channelId, filters = {}) => [...chatKeys.all, "messages", channelId, filters],
}

const payrollKeys = {
  all: ["payroll"],
  list: (filters = {}) => [...payrollKeys.all, "list", filters],
  detail: (payrollId) => [...payrollKeys.all, "detail", payrollId],
}

const hrKeys = {
  all: ["hr"],
  employees: (filters = {}) => [...hrKeys.all, "employees", filters],
  employee: (employeeId) => [...hrKeys.all, "employee", employeeId],
  departments: (filters = {}) => [...hrKeys.all, "departments", filters],
}

const settingsKeys = {
  all: ["settings"],
  company: () => [...settingsKeys.all, "company"],
  roles: () => [...settingsKeys.all, "roles"],
}

const adminKeys = {
  all: ["admin"],
  managers: () => [...adminKeys.all, "managers"],
  manager: (userId) => [...adminKeys.all, "manager", userId],
  clients: () => [...adminKeys.all, "clients"],
  projects: () => [...adminKeys.all, "projects"],
  project: (projectId) => [...adminKeys.all, "project", projectId],
}

const projectKeys = {
  all: ["projects"],
  list: (scope = "default") => [...projectKeys.all, "list", scope],
  detail: (projectId, scope = "default") => [...projectKeys.all, "detail", projectId, scope],
  tasks: (projectId, scope = "default") => [...projectKeys.all, "tasks", projectId, scope],
  task: (taskId, scope = "default") => [...projectKeys.all, "task", taskId, scope],
}

export const queryKeys = {
  auth: authKeys,
  chat: chatKeys,
  payroll: payrollKeys,
  hr: hrKeys,
  settings: settingsKeys,
  admin: adminKeys,
  projects: projectKeys,
}
