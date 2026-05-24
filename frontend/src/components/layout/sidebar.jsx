import { useMemo, useState } from "react"
import { ChevronDown, Hash, LayoutDashboard, ReceiptText, Folder, Users, Briefcase, User, UserCheck, Layers, Activity, UserPlus, BarChart3, CalendarDays } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import { roleDefinitions } from "@/config/constants"
import { employeeActivityBadgeCount } from "@/features/employee/employee-data"
import { chatChannels, directMessages } from "@/features/chat/chat-data"
import { useGlobalStore } from "@/stores/use-global-store"

export function Sidebar({ onNavigate }) {
	const location = useLocation()
	const { role } = useGlobalStore()
	const roleConfig = roleDefinitions[role] ?? roleDefinitions.employee
	const [isChannelsOpen, setIsChannelsOpen] = useState(true)
	const [isDmsOpen, setIsDmsOpen] = useState(true)

	const isChatRoute = location.pathname.startsWith("/chat")
	const activeChannelId = useMemo(() => {
		const match = location.pathname.match(/^\/chat\/channels\/([^/]+)/)
		return match ? match[1] : ""
	}, [location.pathname])
	const activeDmId = useMemo(() => {
		const match = location.pathname.match(/^\/chat\/dms\/([^/]+)/)
		return match ? match[1] : ""
	}, [location.pathname])

	const navItems = []

	// primary
	navItems.push({ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard })

	// admin sections grouped after primary
	if (role === "admin") {
		navItems.push({ to: "/admin/projects", label: "Projects", icon: Folder })
		navItems.push({ to: "/admin/clients", label: "Clients", icon: Briefcase })
		navItems.push({ to: "/admin/employees", label: "Employees", icon: Users })
		navItems.push({ to: "/admin/managers", label: "Managers", icon: UserCheck })
		navItems.push({ to: "/admin/departments", label: "Departments", icon: Layers })
		navItems.push({ to: "/admin/activities", label: "Activities", icon: Activity })
	}

	if (role === "pm") {
		navItems.push({ to: "/pm/projects", label: "Projects", icon: Folder })
		navItems.push({ to: "/pm/activities", label: "Activities", icon: Activity })
		navItems.push({ to: "/pm/analytics", label: "Analytics", icon: BarChart3 })
		navItems.push({ to: "/pm/milestones", label: "Milestones", icon: CalendarDays })
	}

	if (role === "hr") {
		navItems.push({ to: "/recruitments", label: "Recruitments", icon: UserPlus })
		navItems.push({ to: "/projects", label: "Projects", icon: Folder })
		navItems.push({ to: "/clients", label: "Clients", icon: Briefcase })
		navItems.push({ to: "/employees", label: "Employees", icon: Users })
	}

	if (role === "employee") {
		navItems.push({ to: "/employee/projects", label: "Projects", icon: Folder })
		navItems.push({ to: "/employee/activities", label: "Activities", icon: Activity, badge: employeeActivityBadgeCount })
		navItems.push({ to: "/employee/profile", label: "Profile", icon: User })
	}

	// push payroll near the end for allowed roles (not PM/Employee)
	if (!(role === "pm" || role === "employee")) {
		navItems.push({ to: "/payroll", label: "Payroll", icon: ReceiptText })
	}

	return (
		<aside className="flex h-full min-h-0 flex-col overflow-hidden">
			<div className="border-b border-border/60 p-5">
				<div className="flex items-center gap-3">
					<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
						WN
					</div>
					<div>
						<p className="text-sm font-semibold">Workspace Hub</p>
						<p className="text-xs text-muted-foreground">{roleConfig.label}</p>
					</div>
				</div>
			</div>

			<nav className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
				{navItems.map((item) => {
					const Icon = item.icon
					return (
						<NavLink
							key={item.to}
							to={item.to}
							onClick={onNavigate}
							className={({ isActive }) =>
								`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${isActive ? "border-border bg-accent text-foreground shadow-sm" : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/70"}`
							}
						>
							<Icon className="h-4 w-4" />
							<span className="flex-1">{item.label}</span>
							{item.badge ? (
								<span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
									{item.badge}
								</span>
							) : null}
						</NavLink>
					)
				})}

				<section className={`rounded-2xl border p-2 ${isChatRoute ? "border-border bg-card/80" : "border-border/60 bg-card/40"}`}>
					<div className="space-y-1">
						<button
							type="button"
							onClick={() => setIsChannelsOpen((value) => !value)}
							aria-expanded={isChannelsOpen}
							className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-secondary/70"
						>
							<span>Channels</span>
							<ChevronDown className={`h-4 w-4 transition-transform ${isChannelsOpen ? "rotate-180" : ""}`} />
						</button>
						{isChannelsOpen && (
							<div className="space-y-1 pb-1">
								{chatChannels.map((channel) => {
									const isActive = activeChannelId === channel.id
									return (
										<NavLink
											key={channel.id}
											to={`/chat/channels/${channel.id}`}
											onClick={onNavigate}
											className={`flex items-center justify-between rounded-xl border px-2.5 py-2 text-sm transition-colors ${isActive ? "border-border bg-accent text-foreground" : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/70"}`}
										>
											<span className="flex items-center gap-2">
												<Hash className="h-3.5 w-3.5" />
												{channel.name}
											</span>
											{channel.unread > 0 ? (
												<span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
													{channel.unread}
												</span>
											) : null}
										</NavLink>
									)
								})}
							</div>
						)}
					</div>

					<div className="mt-1 space-y-1 border-t border-border/60 pt-2">
						<button
							type="button"
							onClick={() => setIsDmsOpen((value) => !value)}
							aria-expanded={isDmsOpen}
							className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-secondary/70"
						>
							<span>Direct messages</span>
							<ChevronDown className={`h-4 w-4 transition-transform ${isDmsOpen ? "rotate-180" : ""}`} />
						</button>
						{isDmsOpen && (
							<div className="space-y-1 pb-1">
								{directMessages.map((dm) => {
									const isActive = activeDmId === dm.id
									return (
										<NavLink
											key={dm.id}
											to={`/chat/dms/${dm.id}`}
											onClick={onNavigate}
											className={`flex items-center justify-between rounded-xl border px-2.5 py-2 text-sm transition-colors ${isActive ? "border-border bg-accent text-foreground" : "border-transparent text-muted-foreground hover:border-border hover:bg-secondary/70"}`}
										>
											<span className="truncate">{dm.name}</span>
											<span className={`h-2 w-2 rounded-full ${dm.status === "online" ? "bg-emerald-500" : dm.status === "bot" ? "bg-amber-500" : "bg-zinc-400"}`} />
										</NavLink>
									)
								})}
							</div>
						)}
					</div>
				</section>
			</nav>

			<div className="border-t border-border/60 p-4">
				<div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
					<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workspace status</p>
					<p className="mt-2 text-sm font-medium">{roleConfig.dashboardTitle}</p>
					<p className="mt-1 text-xs text-muted-foreground">Responsive role-based layout</p>
				</div>
			</div>
		</aside>
	)
}
