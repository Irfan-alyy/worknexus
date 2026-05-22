import { LayoutDashboard, MessageSquare, ReceiptText, Folder, Users, User, UserCheck, Layers, Activity, BriefcaseBusiness, DollarSign } from "lucide-react"
import { NavLink } from "react-router-dom"

import { roleDefinitions } from "@/config/constants"
import { useGlobalStore } from "@/stores/use-global-store"

export function Sidebar({ onNavigate }) {
	const { role } = useGlobalStore()
	const roleConfig = roleDefinitions[role] ?? roleDefinitions.employee

	const navItems = []

	// primary
	navItems.push({ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard })

	// admin sections grouped after primary
	if (role === "admin") {
		navItems.push({ to: "/admin/projects", label: "Projects", icon: Folder })
		navItems.push({ to: "/admin/clients", label: "Clients", icon: Users })
		navItems.push({ to: "/admin/employees", label: "Employees", icon: User })
		navItems.push({ to: "/admin/managers", label: "Managers", icon: UserCheck })
		navItems.push({ to: "/admin/departments", label: "Departments", icon: Layers })
		navItems.push({ to: "/admin/activities", label: "Activities", icon: Activity })
	}

	if (role === "hr") {
		navItems.push({ to: "/recruitments", label: "Recruitments", icon: BriefcaseBusiness })
		navItems.push({ to: "/projects", label: "Projects", icon: Folder })
		navItems.push({ to: "/clients", label: "Clients", icon: Users })
		navItems.push({ to: "/employees", label: "Employees", icon: User })
	}

	// push payroll near the end for allowed roles (not PM/Employee)
	if (!(role === "pm" || role === "employee")) {
		navItems.push({ to: "/payroll", label: "Payroll", icon: DollarSign })
	}

	// chat at the very end
	navItems.push({ to: "/chat", label: "Chat", icon: MessageSquare })

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

			<nav className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
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
							{item.label}
						</NavLink>
					)
				})}
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
