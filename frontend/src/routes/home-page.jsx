import { ArrowRight, BarChart3, Briefcase, CalendarDays, CheckCircle2, MessageSquare, ShieldCheck, Sparkles, Users } from "lucide-react"
import { Link } from "react-router-dom"

const highlights = [
	{
		title: "Role-aware workspace",
		description: "Tailored views for admin, HR, PM, and employees keep every team focused on the right work.",
		icon: Users,
	},
	{
		title: "Operations in one place",
		description: "Chat, payroll, HR, and project delivery stay connected instead of scattered across separate tools.",
		icon: Briefcase,
	},
	{
		title: "Readable by design",
		description: "Clear hierarchy, progressive disclosure, and strong contrast keep the interface easy to scan.",
		icon: CheckCircle2,
	},
]

const audiences = [
	{
		title: "For leaders",
		description: "See what is moving, what needs attention, and where the organization is spending time.",
		meta: "Administration and oversight",
	},
	{
		title: "For HR teams",
		description: "Coordinate onboarding, payroll preparation, employee records, and policy follow-up.",
		meta: "People operations",
	},
	{
		title: "For delivery teams",
		description: "Track projects, chat, activities, and milestones without losing the work context.",
		meta: "PM and execution",
	},
	{
		title: "For employees",
		description: "Focus on tasks, updates, and the next items that keep personal work moving forward.",
		meta: "Daily productivity",
	},
]

const trustPoints = [
	"Built around a three-tier architecture with a clear frontend, API, and data separation.",
	"Designed with Material Design 3 principles, consistency, and accessibility in mind.",
	"Structured for progressive disclosure so the workspace stays calm even as the product grows.",
]

const capabilityCards = [
	{
		title: "Project delivery",
		description: "Track work, milestones, and team activity from planning to delivery.",
		icon: BarChart3,
	},
	{
		title: "Communication",
		description: "Keep channels and direct messages close to the work that needs action.",
		icon: MessageSquare,
	},
	{
		title: "HR readiness",
		description: "Coordinate onboarding, departments, and payroll workflows with less friction.",
		icon: CalendarDays,
	},
	{
		title: "Secure access",
		description: "Role-based views keep sensitive data scoped to the right people.",
		icon: ShieldCheck,
	},
]

function SectionEyebrow({ children }) {
	return <p className="text-xs uppercase tracking-[0.28em] text-white/55">{children}</p>
}

function StatPill({ label, value }) {
	return (
		<div className="rounded-2xl border border-white/10 bg-white/7 px-4 py-3 backdrop-blur-sm">
			<p className="text-xs uppercase tracking-[0.2em] text-white/55">{label}</p>
			<p className="mt-2 text-lg font-semibold text-white">{value}</p>
		</div>
	)
}

function FeatureCard({ title, description, icon: Icon }) {
	return (
		<article className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm transition-transform duration-200 hover:-translate-y-1">
			<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
				<Icon className="h-5 w-5" />
			</div>
			<h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
			<p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
		</article>
	)
}

export function HomePage() {
	return (
		<div id="top" className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_30%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.98))] text-white">
			<main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
				<header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.28em] text-white/55">WorkNexus</p>
						<p className="mt-1 text-sm text-white/70">Workspace operations for HR, projects, chat, and payroll.</p>
					</div>

					<nav className="flex flex-wrap items-center gap-3 text-sm">
						<a href="#capabilities" className="rounded-full border border-white/10 px-4 py-2 text-white/75 transition-colors hover:bg-white/8 hover:text-white">
							Capabilities
						</a>
						<a href="#audiences" className="rounded-full border border-white/10 px-4 py-2 text-white/75 transition-colors hover:bg-white/8 hover:text-white">
							Who it serves
						</a>
						<Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-slate-950 transition-transform hover:-translate-y-0.5">
							Login
							<ArrowRight className="h-4 w-4" />
						</Link>
					</nav>
				</header>

				<section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
					<div className="space-y-8">
						<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
							<Sparkles className="h-4 w-4 text-sky-300" />
							Designed for a clean first impression and a focused daily workspace.
						</div>

						<div className="space-y-5">
							<SectionEyebrow>Public homepage</SectionEyebrow>
							<h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
								Bring HR, delivery, and team communication into one professional workspace.
							</h1>
							<p className="max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
								WorkNexus helps teams move from scattered tools to a structured, role-aware workspace. The experience stays readable, accessible, and calm while still surfacing what matters most.
							</p>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Link
								to="/login"
								className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950 shadow-[0_12px_35px_rgba(15,23,42,0.25)] transition-transform hover:-translate-y-0.5"
							>
								Login to WorkNexus
								<ArrowRight className="h-4 w-4" />
							</Link>
							<a
								href="#capabilities"
								className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/12 bg-white/6 px-5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10"
							>
								See capabilities
							</a>
						</div>

						<div className="grid gap-3 sm:grid-cols-3">
							<StatPill label="Workspace layers" value="3-tier architecture" />
							<StatPill label="Design direction" value="Material Design 3" />
							<StatPill label="Experience model" value="Role-based access" />
						</div>
					</div>

					<div className="relative">
						<div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_38%)] blur-2xl" />
						<div className="rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_35px_100px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-6">
							<div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
								<div className="flex items-center justify-between gap-3">
									<div>
										<SectionEyebrow>At a glance</SectionEyebrow>
										<h2 className="mt-2 text-xl font-semibold text-white">Operations snapshot</h2>
									</div>
									<span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
										Live workspace
									</span>
								</div>

								<div className="mt-6 grid gap-3 sm:grid-cols-2">
									<div className="rounded-2xl border border-white/10 bg-white/6 p-4">
										<p className="text-xs uppercase tracking-[0.2em] text-white/50">Primary focus</p>
										<p className="mt-2 text-sm leading-6 text-white/80">A calm entry point that leads users into the right role-specific workspace.</p>
									</div>
									<div className="rounded-2xl border border-white/10 bg-white/6 p-4">
										<p className="text-xs uppercase tracking-[0.2em] text-white/50">UX principle</p>
										<p className="mt-2 text-sm leading-6 text-white/80">Expose only the right amount of detail and keep the hierarchy predictable.</p>
									</div>
								</div>

								<div className="mt-5 grid gap-3 sm:grid-cols-2">
									{highlights.map(({ title, description, icon: Icon }) => (
										<div key={title} className="rounded-2xl border border-white/10 bg-white/6 p-4">
											<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
												<Icon className="h-5 w-5" />
											</div>
											<p className="mt-3 text-sm font-semibold text-white">{title}</p>
											<p className="mt-1 text-sm leading-6 text-white/72">{description}</p>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				</section>

				<section id="capabilities" className="grid gap-4 py-4 sm:grid-cols-2 xl:grid-cols-4">
					{capabilityCards.map((card) => (
						<FeatureCard key={card.title} {...card} />
					))}
				</section>

				<section id="audiences" className="grid gap-6 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-14">
					<div className="rounded-[2rem] border border-white/10 bg-white/6 p-4 shadow-sm backdrop-blur-sm sm:p-6">
						<SectionEyebrow>Why it fits</SectionEyebrow>
						<h2 className="mt-3 text-2xl font-semibold text-white">One workspace, different views</h2>
						<p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
							WorkNexus is designed to keep the homepage simple, then reveal the right tools once a user signs in. That matches the product’s role-based structure and keeps the public entry clean.
						</p>

						<ul className="mt-6 space-y-3 text-sm text-white/78">
							{trustPoints.map((point) => (
								<li key={point} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 leading-6">
									<CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-300" />
									<span>{point}</span>
								</li>
							))}
						</ul>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						{audiences.map((audience) => (
							<article key={audience.title} className="rounded-[1.75rem] border border-border/70 bg-card p-5 text-foreground shadow-sm">
								<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{audience.meta}</p>
								<h3 className="mt-3 text-lg font-semibold">{audience.title}</h3>
								<p className="mt-2 text-sm leading-6 text-muted-foreground">{audience.description}</p>
							</article>
						))}
					</div>
				</section>

				<section className="mt-2 rounded-[2rem] border border-white/10 bg-white/6 px-6 py-6 backdrop-blur-sm sm:px-8">
					<div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
						<div className="max-w-2xl">
							<SectionEyebrow>Ready to begin</SectionEyebrow>
							<h2 className="mt-3 text-2xl font-semibold text-white">Login to open the workspace for your role</h2>
							<p className="mt-2 text-sm leading-6 text-white/70">
								The homepage explains the product. The login flow unlocks the full role-aware shell, dashboards, and operational tools.
							</p>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Link to="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5">
								Login now
								<ArrowRight className="h-4 w-4" />
							</Link>
							<a href="#top" className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/12 bg-white/6 px-5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10">
								Back to top
							</a>
						</div>
					</div>
				</section>

				<footer className="flex flex-col gap-4 py-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
					<p>WorkNexus. A focused workspace for teams that need clarity, structure, and speed.</p>
					<div className="flex flex-wrap gap-4">
						<Link to="/login" className="transition-colors hover:text-white">
							Login
						</Link>
						<Link to="/forgot-password" className="transition-colors hover:text-white">
							Forgot password
						</Link>
						<a href="#capabilities" className="transition-colors hover:text-white">
							Capabilities
						</a>
					</div>
				</footer>
			</main>
		</div>
	)
}