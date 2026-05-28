import { useState, useEffect } from "react"
import { useGlobalStore } from "@/stores/use-global-store"
import { useLocation, useNavigate } from "react-router-dom"
import AdminProjects from "@/features/admin/AdminProjects"
import AdminClients from "@/features/admin/AdminClients"
import AdminEmployees from "@/features/admin/AdminEmployees"
import AdminManagers from "@/features/admin/AdminManagers"
import AdminDepartments from "@/features/admin/AdminDepartments"
import AdminActivities from "@/features/admin/AdminActivities"
import { AdminConversationPanel } from "@/features/admin/AdminConversationPanel"
import { adminChannels, adminDirectMessages, getAdminChannel, getAdminDirectMessage } from "@/features/admin/admin-communications"

export function AdminPage() {
  const { user, role, openAside, openModal } = useGlobalStore()
  const [activeTab, setActiveTab] = useState("projects")
  const location = useLocation()
  const navigate = useNavigate()

  const path = location.pathname.replace(/\/+$/, "")
  const channelSlug = path.match(/^\/admin\/channels\/([^/]+)$/)?.[1]
  const directMessageSlug = path.match(/^\/admin\/direct-messages\/([^/]+)$/)?.[1]

  useEffect(() => {
    const path = location.pathname.replace(/\/+$/, "")
    if (path.endsWith("/projects")) setActiveTab("projects")
    else if (path.endsWith("/clients")) setActiveTab("clients")
    else if (path.endsWith("/employees")) setActiveTab("employees")
    else if (path.endsWith("/managers")) setActiveTab("managers")
    else if (path.endsWith("/departments")) setActiveTab("departments")
    else if (path.endsWith("/activities")) setActiveTab("activities")
    else if (path.startsWith("/admin/channels")) setActiveTab("channels")
    else if (path.startsWith("/admin/direct-messages")) setActiveTab("direct-messages")
    else setActiveTab("projects")
  }, [location.pathname])

  function openEditor(title, content) {
    openModal(title, content)
  }

  const titles = {
    projects: "Projects",
    clients: "Clients",
    employees: "Employees",
    managers: "Managers",
    departments: "Departments",
    activities: "Activities",
    channels: "Channels",
    "direct-messages": "Direct Messages",
  }

  const selectedChannel = getAdminChannel(channelSlug || adminChannels[0]?.slug)
  const selectedDirectMessage = getAdminDirectMessage(directMessageSlug || adminDirectMessages[0]?.slug)

  return (
    <div className="h-full overflow-y-auto">
      {/* <div className="mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{titles[activeTab] || "Admin Console"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.name || "Guest"}.</p>
        </div>
      </div> */}

      <div className="space-y-6">
        {activeTab === "projects" && <AdminProjects onEdit={openEditor} onOpenDetail={openAside} />}
        {activeTab === "clients" && <AdminClients onEdit={openEditor} />}
        {activeTab === "employees" && <AdminEmployees onEdit={openEditor} />}
        {activeTab === "managers" && role === "admin" && <AdminManagers onEdit={openEditor} />}
        {activeTab === "departments" && role === "admin" && <AdminDepartments onEdit={openEditor} />}
        {activeTab === "activities" && role === "admin" && <AdminActivities />}
        {activeTab === "channels" && role === "admin" && (
          <AdminConversationPanel
            title={selectedChannel?.name || "Channels"}
            subtitle={selectedChannel?.description}
            membersLabel={selectedChannel ? `${selectedChannel.members} members active` : undefined}
            messages={selectedChannel?.messages}
            emptyLabel="Choose a channel from the sidebar to open its chat thread."
          />
        )}
        {activeTab === "direct-messages" && role === "admin" && (
          <AdminConversationPanel
            title={selectedDirectMessage?.name || "Direct Messages"}
            subtitle={selectedDirectMessage?.description}
            membersLabel={selectedDirectMessage ? selectedDirectMessage.role : undefined}
            messages={selectedDirectMessage?.messages}
            emptyLabel="Choose a person from the sidebar to open the private chat thread."
          />
        )}
      </div>

      {/* Aside is handled globally via the store (openAside/closeAside) */}
    </div>
  )
}

export default AdminPage
