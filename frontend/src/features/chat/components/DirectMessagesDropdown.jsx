import { useMemo } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { useGlobalStore } from "@/stores/use-global-store"
import { hrApi } from "@/features/hr-management/services/hr-api"
import * as projectService from "@/features/projects/projects-service"
import { useFindOrCreateDMMutation } from "@/features/chat/hooks/use-chat-mutation"
import  apiClient  from "@/lib/axios"

export default function DirectMessagesDropdown({ isOpen, activeDmId, onNavigate }) {
  const navigate = useNavigate()
  const { user, role } = useGlobalStore()

  // Fetch employees for HR/Admin/PM
  const { data: employeesResp } = useQuery({
    queryKey: queryKeys.hr.employees(),
    queryFn: () => hrApi.listEmployees(),
    enabled: role === "hr" || role === "admin" || role === "pm",
    retry: false,
  })

  const employees = employeesResp?.data || []

  // Fetch users with specific roles for HR/Admin to see each other
  const { data: usersResp } = useQuery({
    queryKey: ["users", "by-role", role],
    queryFn: async () => {
      if (role === "hr") {
        // HR fetches admin and pm users
        const res = await apiClient.get("/users", { params: { roles: "admin,pm" } })
        return res.data?.data || []
      } else if (role === "admin") {
        // Admin fetches hr and pm users
        const res = await apiClient.get("/users", { params: { roles: "hr,pm" } })
        return res.data?.data || []
      }
      return []
    },
    enabled: role === "hr" || role === "admin",
    retry: false,
  })

  const users = usersResp || []

  const { data: projectsResp } = useQuery({
    queryKey: queryKeys.projects.list(),
    queryFn: () => projectService.getProjects(),
  })
  const projects = projectsResp?.data || []

  // For PMs, fetch teams for projects they manage (using existing /projects/:id/team endpoint)
  const userEmployeeId = user?.employee?.id || user?.employeeId || null
  const { data: pmTeamsResp } = useQuery({
    queryKey: ["pm", "managedTeams", userEmployeeId],
    queryFn: async () => {
      const managed = projects.filter((p) => p.managerEmployeeId === userEmployeeId || p.manager_employee_id === userEmployeeId)
      const teams = await Promise.all(managed.map((p) => projectService.getProjectTeam(p.id)))
      return teams.flat()
    },
    enabled: role === "pm" && !!userEmployeeId,
  })

  const pmTeamMembers = pmTeamsResp || []

  // For employees, fetch teams for projects they're assigned to
  const { data: employeeTeamsResp } = useQuery({
    queryKey: ["employee", "assignedTeams", userEmployeeId],
    queryFn: async () => {
      // Get all projects the employee is assigned to
      const assigned = projects.filter((p) => 
        p.teamMembers?.some((tm) => tm.employeeId === userEmployeeId || tm.employee_id === userEmployeeId)
      )
      const teams = await Promise.all(assigned.map((p) => projectService.getProjectTeam(p.id)))
      return teams.flat()
    },
    enabled: role === "employee" && !!userEmployeeId,
  })

  const employeeTeamMembers = employeeTeamsResp || []

  const findOrCreateDM = useFindOrCreateDMMutation()

  const candidates = useMemo(() => {
    const byUserId = new Map()

    function addUser(u) {
      if (!u || !u.user) return
      const id = u.user.id
      if (!id) return
      if (!byUserId.has(id)) byUserId.set(id, u)
    }

    function addUserEntity(u) {
      if (!u) return
      const id = u.id
      if (!id) return
      if (!byUserId.has(id)) byUserId.set(id, u)
    }

    if (role === "pm") {
      // PM sees only team members from their managed projects (via /projects/:id/team)
      pmTeamMembers.forEach((t) => addUser(t.employee || t))
    } else if (role === "hr") {
      // HR sees admins and PMs from employees
      employees.filter((e) => ["admin", "pm"].includes(e.user?.role)).forEach(addUser)
      // Also include admin/pm users directly (from /users endpoint)
      users.filter((u) => !byUserId.has(u.id)).forEach(addUserEntity)
    } else if (role === "admin") {
      // Admin sees HR and PMs from employees
      employees.filter((e) => ["hr", "pm"].includes(e.user?.role)).forEach(addUser)
      // Also include hr/pm users directly (from /users endpoint) that aren't already added
      users.filter((u) => !byUserId.has(u.id)).forEach(addUserEntity)
    } else if (role === "employee") {
      // Employee sees team members from projects they're assigned to
      employeeTeamMembers.forEach((t) => addUser(t.employee || t))
    }

    return Array.from(byUserId.values())
  }, [employees, pmTeamMembers, employeeTeamMembers, users, role])

  if (!isOpen) return null

  return (
    <div className="space-y-1 pb-1">
      {candidates.map((dm) => {
        const userObj = dm.user || dm
        const displayName = `${dm.firstName || dm.employee?.firstName || userObj.firstName || ""} ${dm.lastName || dm.employee?.lastName || userObj.lastName || ""}`.trim() || userObj.email || `User ${userObj.id}`
        const isActive = activeDmId === String(userObj.id)

        return (
          <button
            key={userObj.id}
            onClick={() => {
              findOrCreateDM.mutate(
                { receiverId: userObj.id },
                {
                  onSuccess: (channel) => {
                    const channelId = channel?.id || channel?.data?.id
                    if (channelId) navigate(`/chat/dms/${channelId}`)
                    onNavigate && onNavigate()
                  },
                }
              )
            }}
            className={`flex w-full items-center justify-between rounded-xl border px-2.5 py-2 text-sm transition-colors ${isActive ? "border-border bg-accent text-foreground" : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/70"}`}
          >
            <span className="truncate">{displayName}</span>
            <span className={`h-2 w-2 rounded-full ${userObj.status === "online" ? "bg-emerald-500" : "bg-zinc-400"}`} />
          </button>
        )
      })}

      {/* Admin: quick link to view all employees */}
      {role === "admin" && (
        <NavLink
          to="/admin/employees"
          onClick={onNavigate}
          className="block text-xs text-muted-foreground hover:underline mt-2"
        >
          View all employees
        </NavLink>
      )}
    </div>
  )
}
