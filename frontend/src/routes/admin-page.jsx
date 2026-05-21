import { useState, useEffect } from "react"
import { useGlobalStore } from "@/stores/use-global-store"
import { useLocation, useNavigate } from "react-router-dom"
import AdminProjects from "@/features/admin/AdminProjects"
import AdminClients from "@/features/admin/AdminClients"
import AdminEmployees from "@/features/admin/AdminEmployees"

export function AdminPage() {
  const { user, openAside } = useGlobalStore()
  const [activeTab, setActiveTab] = useState("projects")
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const path = location.pathname.replace(/\/+$/, "")
    if (path.endsWith("/projects")) setActiveTab("projects")
    else if (path.endsWith("/clients")) setActiveTab("clients")
    else if (path.endsWith("/employees")) setActiveTab("employees")
    else setActiveTab("projects")
  }, [location.pathname])

  function openDrawer(title, content) {
    openAside(title, content)
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin Console</h1>
          <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.name || "Guest"}.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/admin/projects")} className={`px-3 py-2 rounded ${activeTab === "projects" ? "bg-secondary text-foreground" : "bg-background"}`}>
            Projects
          </button>
          <button onClick={() => navigate("/admin/clients")} className={`px-3 py-2 rounded ${activeTab === "clients" ? "bg-secondary text-foreground" : "bg-background"}`}>
            Clients
          </button>
          <button onClick={() => navigate("/admin/employees")} className={`px-3 py-2 rounded ${activeTab === "employees" ? "bg-secondary text-foreground" : "bg-background"}`}>
            Employees
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === "projects" && <AdminProjects onEdit={openDrawer} />}
        {activeTab === "clients" && <AdminClients onEdit={openDrawer} />}
        {activeTab === "employees" && <AdminEmployees onEdit={openDrawer} />}
      </div>

      {/* Aside is handled globally via the store (openAside/closeAside) */}
    </div>
  )
}

export default AdminPage
