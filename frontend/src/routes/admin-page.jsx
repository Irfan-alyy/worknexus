import { useState, useEffect } from "react"
import { useGlobalStore } from "@/stores/use-global-store"
import { useLocation, useNavigate } from "react-router-dom"
import AdminProjects from "@/features/admin/AdminProjects"
import AdminClients from "@/features/admin/AdminClients"
import AdminEmployees from "@/features/admin/AdminEmployees"
import AdminManagers from "@/features/admin/AdminManagers"
import AdminDepartments from "@/features/admin/AdminDepartments"
import AdminActivities from "@/features/admin/AdminActivities"

export function AdminPage() {
  const { user, role, openAside } = useGlobalStore()
  const [activeTab, setActiveTab] = useState("projects")
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const path = location.pathname.replace(/\/+$/, "")
    if (path.endsWith("/projects")) setActiveTab("projects")
    else if (path.endsWith("/clients")) setActiveTab("clients")
    else if (path.endsWith("/employees")) setActiveTab("employees")
    else if (path.endsWith("/managers")) setActiveTab("managers")
    else if (path.endsWith("/departments")) setActiveTab("departments")
    else if (path.endsWith("/activities")) setActiveTab("activities")
    else setActiveTab("projects")
  }, [location.pathname])

  function openDrawer(title, content) {
    openAside(title, content)
  }

  const titles = {
    projects: "Projects",
    clients: "Clients",
    employees: "Employees",
    managers: "Managers",
    departments: "Departments",
    activities: "Activities",
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <div>
          <h1 className="text-2xl font-semibold">{titles[activeTab] || "Admin Console"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.name || "Guest"}.</p>
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === "projects" && <AdminProjects onEdit={openDrawer} />}
        {activeTab === "clients" && <AdminClients onEdit={openDrawer} />}
        {activeTab === "employees" && <AdminEmployees onEdit={openDrawer} />}
        {activeTab === "managers" && role === "admin" && <AdminManagers onEdit={openDrawer} />}
        {activeTab === "departments" && role === "admin" && <AdminDepartments onEdit={openDrawer} />}
        {activeTab === "activities" && role === "admin" && <AdminActivities />}
      </div>

      {/* Aside is handled globally via the store (openAside/closeAside) */}
    </div>
  )
}

export default AdminPage
