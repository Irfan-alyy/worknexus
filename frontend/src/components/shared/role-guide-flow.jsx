import { useEffect, useMemo, useRef, useState } from "react"
import {
	Activity,
	BarChart3,
	Briefcase,
	CircleHelp,
	Folder,
	Hash,
	LayoutDashboard,
	Layers,
	MessageSquare,
	ReceiptText,
	Settings2,
	ShieldCheck,
	User,
	UserCheck,
	Users,
	Workflow,
} from "lucide-react"

const TAB_ICONS = {
	Dashboard: LayoutDashboard,
	Departments: Layers,
	Projects: Briefcase,
	Clients: Workflow,
	Managers: UserCheck,
	Employees: Users,
	Tasks: Folder,
	Activities: Activity,
	Payroll: ReceiptText,
	Channels: Hash,
	"Direct messages": MessageSquare,
	Recruitments: ShieldCheck,
	Analytics: BarChart3,
	Milestones: Settings2,
	Profile: User,
}

export function RoleGuideFlow({ tabs = [], roleLabel }) {
	const [activeIndex, setActiveIndex] = useState(-1)
	const lastInput = useRef("mouse")

	useEffect(() => {
		setActiveIndex(-1)
	}, [tabs])

	useEffect(() => {
		function handleKey(e) {
			if (e.key === "Tab") lastInput.current = "keyboard"
		}

		function handlePointer() {
			lastInput.current = "mouse"
		}

		document.addEventListener("keydown", handleKey)
		document.addEventListener("pointerdown", handlePointer)

		return () => {
			document.removeEventListener("keydown", handleKey)
			document.removeEventListener("pointerdown", handlePointer)
		}
	}, [])

	const activeTab = useMemo(() => {
		if (activeIndex < 0 || activeIndex >= tabs.length) return null
		return tabs[activeIndex]
	}, [activeIndex, tabs])

	if (!tabs.length) return null

	return (
		<div className="space-y-5">
			<div className="flex items-center justify-between gap-3">
				<div>
					<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Guide</p>
					<h3 className="mt-1 text-lg font-semibold">How {roleLabel} navigates the dashboard</h3>
				</div>
				<div className="hidden items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground sm:flex">
					<CircleHelp className="h-3.5 w-3.5" />
					Hover a tab for help
				</div>
			</div>

			<div className="relative rounded-[2rem] border border-border/70 bg-gradient-to-br from-background via-background to-secondary/20 p-4 shadow-sm sm:p-6">
				<div className="hidden max-w-full py-6 md:flex md:items-center md:justify-center md:gap-2" onMouseLeave={() => setActiveIndex(-1)}>
					{tabs.map((tab, index) => {
						const isActive = activeIndex === index
						const Icon = TAB_ICONS[tab.label] ?? CircleHelp

						return (
							<div key={tab.label} className="group relative flex min-w-0 items-center justify-center">
								<button
									type="button"
									aria-label={tab.label}
									aria-pressed={isActive}
									title={tab.label}
									onMouseEnter={() => setActiveIndex(index)}
									onMouseLeave={() => setActiveIndex(-1)}
									onFocus={(e) => {
										if (lastInput.current === "keyboard") setActiveIndex(index)
									}}
									className={`relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition-all duration-200 ease-out sm:h-11 sm:w-11 ${isActive ? "border-primary/70 bg-primary text-primary-foreground shadow-primary/20 scale-110 ring-4 ring-primary/10" : "border-border/80 hover:border-primary/50 hover:bg-secondary/80 hover:shadow-md hover:scale-105"}`}
								>
									<span className={`absolute inset-0 rounded-full transition-opacity duration-200 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_62%)]`} />
									<Icon className={`relative h-4 w-4 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
								</button>

								{index < tabs.length - 1 && (
									<div className="mx-1 flex w-4 items-center justify-center sm:w-5 md:w-6" aria-hidden="true">
										<span className={`h-px w-full rounded-full transition-colors duration-200 ${isActive ? "bg-primary/60" : "bg-border"}`} />
									</div>
								)}

								{isActive ? (
									<div
										className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-border bg-background/95 px-4 py-3 shadow-lg backdrop-blur"
										role="status"
										aria-live="polite"
									>
										<div className="flex items-start gap-3">
											<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-foreground">
												<Icon className="h-4 w-4" />
											</div>
											<div className="min-w-0">
												<div className="mb-1 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/70 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
													<span>Tab</span>
													<span className="h-1 w-1 rounded-full bg-border" />
													<span className="text-foreground">{tab.label}</span>
												</div>
												<p className="text-sm font-semibold text-foreground">{tab.label}</p>
												<p className="mt-1 text-sm leading-6 text-muted-foreground">{tab.description}</p>
											</div>
										</div>
									</div>
								) : null}
							</div>
						)
					})}
				</div>

				<div className="md:hidden">
					<div className="relative h-[22rem] overflow-hidden rounded-2xl border border-border/70 bg-background/95">
						<div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-background via-background/85 to-transparent" />
						<div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-background via-background/85 to-transparent" />

						<div className="h-full overflow-y-auto px-3 py-4">
							<div className="relative pl-2 pr-2">
								<div className="absolute left-5 top-3 bottom-3 w-px bg-border/70" aria-hidden="true" />

								<div className="space-y-4">
									{tabs.map((tab, index) => {
										const isActive = activeIndex === index
										const Icon = TAB_ICONS[tab.label] ?? CircleHelp

										return (
											<div key={tab.label} className="relative h-12">
												<button
													type="button"
													aria-label={tab.label}
													aria-pressed={isActive}
													onClick={() => setActiveIndex(index)}
													className={`relative z-[1] flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 ease-out ${isActive ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20" : "border-border bg-background text-foreground active:scale-105"}`}
												>
													<Icon className="h-4 w-4" />
												</button>

												{isActive ? (
													<div className="pointer-events-none absolute left-12 top-1/2 z-20 w-[min(15rem,calc(100vw-7.5rem))] -translate-y-1/2 rounded-2xl border border-border bg-background/95 px-3 py-2 shadow-lg">
														<span className="absolute -left-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 border-l border-t border-border bg-background/95" aria-hidden="true" />
														<p className="text-xs font-semibold text-foreground">{tab.label}</p>
														<p className="mt-1 text-xs leading-5 text-muted-foreground">{tab.description}</p>
													</div>
												) : null}
											</div>
										)
									})}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}