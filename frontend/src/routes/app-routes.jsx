import { useEffect, useMemo, useState } from "react"
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom"
import { PanelLeft } from "lucide-react"

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { ChatPage } from "@/features/chat/chat-page"
import { HrPage } from "@/features/hr-management/hr-page"
import { PayrollPage } from "@/features/payroll/payroll-page"
import { DashboardPage } from "@/routes/dashboard-page"
import { AdminPage } from "@/routes/admin-page"
import { PmPage } from "@/routes/pm-page"
import { ForgotPasswordPage, LoginPage } from "@/routes/auth-pages"
import { RoleBarrier } from "@/routes/role-barrier"
import { dashboardRouteMeta, roleDefinitions } from "@/config/constants"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useGlobalStore } from "@/stores/use-global-store"

function RouteAside() {
	const location = useLocation()
	const { role } = useGlobalStore()
	const roleConfig = roleDefinitions[role] ?? roleDefinitions.employee

	const meta = useMemo(() => {
		const routeMeta = {
			...dashboardRouteMeta,
			"/dashboard": {
				...dashboardRouteMeta["/dashboard"],
				bullets: roleConfig.focusPoints,
			},
			"/chat": {
				...dashboardRouteMeta["/chat"],
				bullets: roleConfig.quickActions,
			},
			"/payroll": {
				...dashboardRouteMeta["/payroll"],
				bullets: roleConfig.shortLabel === "HR" || roleConfig.shortLabel === "Admin"
					? ["Payroll approval queue", "Allowance review", "Payout ready"]
					: ["View updates", "Submit request", "Check payout timeline"],
			},
			"/hr": {
				...dashboardRouteMeta["/hr"],
				bullets: roleConfig.shortLabel === "HR" || roleConfig.shortLabel === "Admin"
					? ["Onboarding queue", "Employee records", "Department updates"]
					: ["View tasks", "Log hours", "Update progress"],
			},
		}

		return routeMeta[location.pathname] ?? routeMeta["/dashboard"]
	}, [location.pathname, roleConfig.focusPoints, roleConfig.quickActions, roleConfig.shortLabel])

	return (
		<aside className="flex h-full min-h-0 flex-col overflow-hidden bg-background/90">
			<div className="border-b border-border/60 p-5">
				<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Context</p>
				<h2 className="mt-2 text-lg font-semibold">{meta.title}</h2>
				<p className="mt-2 text-sm leading-6 text-muted-foreground">{meta.description}</p>
			</div>

			<div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
				<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
					<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Key points</p>
					<div className="mt-3 space-y-2 text-sm text-muted-foreground">
						{meta.bullets.map((bullet) => (
							<div key={bullet} className="rounded-xl bg-secondary/60 px-3 py-2">
								{bullet}
							</div>
						))}
					</div>
				</section>

				<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
					<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workflow</p>
					<div className="mt-3 space-y-3 text-sm">
						<div className="flex items-center justify-between rounded-xl bg-background px-3 py-2">
							<span className="text-muted-foreground">Status</span>
							<span className="font-medium">In progress</span>
						</div>
						<div className="flex items-center justify-between rounded-xl bg-background px-3 py-2">
							<span className="text-muted-foreground">Owner</span>
							<span className="font-medium">Operations</span>
						</div>
					</div>
				</section>
			</div>
		</aside>
	)
}

function ShellLayout() {
	const [isDarkMode, setIsDarkMode] = useState(true)
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

	const location = useLocation()
	const { role, asideOpen, asideContent, asideTitle, closeAside } = useGlobalStore()
	const isMobile = useMediaQuery("(max-width: 767px)")

	useEffect(() => {
		document.documentElement.classList.toggle("dark", isDarkMode)
	}, [isDarkMode])

	useEffect(() => {
		if (!isMobile) {
			setIsMobileSidebarOpen(false)
		}
	}, [isMobile])

	useEffect(() => {
		setIsMobileSidebarOpen(false)
	}, [location.pathname])

	useEffect(() => {
		if (asideOpen) {
			setIsMobileSidebarOpen(false)
		}
	}, [asideOpen])

	const toggleMobileSidebar = () => {
		setIsMobileSidebarOpen((value) => !value)
	}

	const closeMobileSidebar = () => {
		setIsMobileSidebarOpen(false)
	}

	return (
		<div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
			<Header
				isDarkMode={isDarkMode}
				onToggleTheme={() => setIsDarkMode((value) => !value)}
				isMobile={isMobile}
				isSidebarOpen={isMobileSidebarOpen}
				onToggleSidebar={toggleMobileSidebar}
			/>

			<div className="relative min-h-0 flex-1 overflow-hidden">
				{isMobile ? (
					<>
						{isMobileSidebarOpen && (
							<>
								<button
									type="button"
									aria-label="Close navigation overlay"
									onClick={closeMobileSidebar}
									className="fixed inset-0 z-30 bg-black/40 md:hidden"
								/>
								<div className="fixed inset-y-0 left-0 z-40 w-[min(86vw,20rem)] border-r border-border/60 bg-background/95 shadow-2xl md:hidden">
									<div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
										<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Navigation</p>
										<button
											type="button"
											onClick={closeMobileSidebar}
											className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-secondary px-3 text-xs font-medium transition-colors hover:bg-accent"
										>
											Close
										</button>
									</div>
									<Sidebar onNavigate={closeMobileSidebar} />
								</div>
							</>
						)}

						{asideOpen ? (
							<div className="absolute inset-0 z-20 bg-background md:hidden">
								<div className="flex h-full min-h-0 flex-col overflow-hidden">
									<div className="border-b border-border/60 p-5">
										<div className="flex items-center justify-between gap-3">
											<div>
												<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Context</p>
												<h2 className="mt-2 text-lg font-semibold">{asideTitle || "Context"}</h2>
											</div>
											<button onClick={closeAside} className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-secondary px-3 text-sm font-medium transition-colors hover:bg-accent">
												<PanelLeft className="h-4 w-4" />
												Close
											</button>
										</div>
									</div>
									<div className="min-h-0 flex-1 overflow-y-auto p-5">{asideContent ?? <RouteAside />}</div>
								</div>
							</div>
						) : (
							<div className="h-full min-h-0 bg-muted/20">
								<Outlet />
							</div>
						)}
					</>
				) : (
					<ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
						<ResizablePanel defaultSize={18} minSize={16} maxSize={24} className="min-h-0 border-r border-border/60 bg-background/95">
							<Sidebar />
						</ResizablePanel>

						<ResizableHandle withHandle />

						<ResizablePanel defaultSize={58} minSize={40} className="min-h-0 bg-muted/20">
							<Outlet />
						</ResizablePanel>

						{asideOpen && (
							<>
								<ResizableHandle withHandle />

								<ResizablePanel defaultSize={24} minSize={18} maxSize={32} className="min-h-0 border-l border-border/60">
									<div className="flex h-full min-h-0 flex-col overflow-hidden bg-background/90">
										<div className="border-b border-border/60 p-5">
											<div className="flex items-center justify-between">
												<h2 className="text-lg font-semibold">{asideTitle || "Context"}</h2>
												<button onClick={closeAside} className="text-sm text-muted-foreground">Close</button>
											</div>
										</div>
										<div className="min-h-0 flex-1 overflow-y-auto p-5">{asideContent ?? <RouteAside />}</div>
									</div>
								</ResizablePanel>
							</>
						)}
					</ResizablePanelGroup>
				)}
			</div>
		</div>
	)
}

export function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<Navigate to="/login" replace />} />
			<Route path="/login" element={<LoginPage />} />
			<Route path="/forgot-password" element={<ForgotPasswordPage />} />

			<Route element={<ShellLayout />}>
				<Route index element={<Navigate to="/dashboard" replace />} />
				<Route path="dashboard" element={<DashboardPage />} />
				<Route path="chat" element={<ChatPage />} />
						<Route path="payroll" element={<RoleBarrier allowedRoles={["admin", "hr"]}><PayrollPage /></RoleBarrier>} />
						<Route path="hr" element={<RoleBarrier allowedRoles={["admin", "hr"]}><HrPage /></RoleBarrier>} />
						<Route path="admin/*" element={<RoleBarrier allowedRoles={["admin"]}><AdminPage /></RoleBarrier>} />
						<Route path="pm" element={<RoleBarrier allowedRoles={["pm","admin"]}><PmPage /></RoleBarrier>} />
				<Route path="*" element={<Navigate to="/dashboard" replace />} />
			</Route>
			<Route path="*" element={<Navigate to="/login" replace />} />
		</Routes>
	)
}
