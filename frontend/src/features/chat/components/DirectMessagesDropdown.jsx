import { useMemo, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { useGlobalStore } from "@/stores/use-global-store"
import { hrApi } from "@/features/hr-management/services/hr-api"
import * as projectService from "@/features/projects/projects-service"
import { useFindOrCreateDMMutation } from "@/features/chat/hooks/use-chat-mutation"
import apiClient from "@/lib/axios"

export default function DirectMessagesDropdown({ isOpen, activeDmId, onNavigate }) {
    const navigate = useNavigate()
    const { user, role } = useGlobalStore()
    const [viewingAllEmployees, setViewingAllEmployees] = useState(false)
    // Fetch employees for HR/Admin/PM
    const { data: employeesResp } = useQuery({
        queryKey: queryKeys.hr.employees(),
        queryFn: () => hrApi.listEmployees(),
        enabled: role === "hr" || role === "admin" || role === "pm",
        retry: false,
    })

    const employees = employeesResp?.data || []
    console.log("employees for role", role, employees)
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
    console.log("Users for role", role, users)
    const { data: projectsResp } = useQuery({
        queryKey: queryKeys.projects.list(),
        queryFn: () => projectService.getProjects(),
    })
    const projects = projectsResp?.data || []
    //   console.log("All projects:", projects)
    // Resolve the current employee id for project/team lookups
    const userEmployeeId = user?.employee?.id || user?.employeeId || null

    const { data: pmTeamsResp } = useQuery({
        queryKey: ["pm", "managedTeams", user.id],
        queryFn: async () => {
            console.log("Fetching PM teams for user:", projects)
            const teams = await Promise.all(projects.map((p) => projectService.getProjectTeam(p.id)))
            const teamsArray = teams.map(team => team.data || team) // Handle both { data: [...] } and [...] formats
            console.log("PM teams for projects:", teamsArray.flat())
            return teamsArray.flat()
        },
        enabled: role === "pm" && !!user.id && projects.length > 0,
    })

    //   console.log("PM teams:", pmTeamsResp)

    const pmTeamMembers = pmTeamsResp || []

    // For employees, backend already returns only the projects they belong to.
    // Map those projects to their team members.
    const { data: employeeTeamsResp } = useQuery({
        queryKey: ["employee", "assignedTeams", projects.map((project) => project.id).join("-")],
        queryFn: async () => {
            const projectIds = projects.map((project) => project.id)
            if (!projectIds.length) return []

            const teams = await Promise.all(projectIds.map((projectId) => projectService.getProjectTeam(projectId)))
            console.log("teams for employee:", teams)
            const teamsArray = teams.map(team => team.data || team) // Handle both { data: [...] } and [...] formats
            console.log("teamsArray for employee:", teamsArray.flat())
            return teamsArray.flat()
        },
        enabled: role === "employee" && projects.length > 0,
    })

    const employeeTeamMembers = employeeTeamsResp?.filter(emp => emp?.employee?.userId !== user.id) || []
    //   console.log("Employee team members:", employeeTeamMembers)
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
            if (viewingAllEmployees) {
                // Show every employee when "View all" is active
                employees.forEach(addUser);
            } else {
                // Show only HR and PM by default
                employees.filter((e) => ["hr", "pm"].includes(e.user?.role)).forEach(addUser);
            }
            // Always include users from /users endpoint that aren't already added
            users.filter((u) => !byUserId.has(u.id)).forEach(addUserEntity);
        } else if (role === "employee") {
            // Employee sees team members from projects they're assigned to
            employeeTeamMembers.forEach((t) => addUser(t.employee || t))
        }

        return Array.from(byUserId.values())
    }, [employees, pmTeamMembers, employeeTeamMembers, users, role, viewingAllEmployees])

    function viewAllEmployees() {
        setViewingAllEmployees(!viewingAllEmployees)
    }
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
                <button
                    onClick={viewAllEmployees}
                    className="block text-xs text-muted-foreground hover:underline mt-2"
                >
                   {viewingAllEmployees?"View all employees": "View HR/PM only"}
                </button>
            )}
        </div>
    )
}
