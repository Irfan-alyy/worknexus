import { useState } from "react"
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  SlidersHorizontal,
  Sparkle,
  UserRound,
  Users,
  Workflow,
} from "lucide-react"
import { Link } from "react-router-dom"

import { roleDefinitions } from "@/config/constants"

const highlights = [
	{
		title: "One product, many journeys",
		description: "Every role sees the same platform through a focused view, so the experience stays clear and consistent.",
		icon: Workflow,
	},
	{
		title: "Operations without clutter",
		description: "Projects, chat, HR, and payroll sit in one calm interface instead of feeling scattered across separate tools.",
		icon: Briefcase,
	},
	{
		title: "Built to look production-ready",
		description: "Strong hierarchy, premium spacing, and clean surfaces give the homepage a finished commercial feel.",
		icon: ShieldCheck,
	},
]

const storyCards = [
	{
		title: "Clear from the first glance",
		description: "WorkNexus gives teams one place to understand what is happening, who owns it, and what comes next.",
		meta: "Home page",
		icon: LayoutDashboard,
	},
	{
		title: "Different roles, same platform",
		description: "Guests, employees, PMs, HR, and admins use the same product with different access and priorities.",
		meta: "Role-based views",
		icon: Users,
	},
	{
		title: "Everything stays connected",
		description: "Tasks, messages, approvals, and progress updates stay tied together so the product feels complete.",
		meta: "Connected workflow",
		icon: MessageSquare,
	},
	{
		title: "Easy to trust",
		description: "The homepage feels polished enough for a recruiter, clear enough for an examiner, and practical enough for a team.",
		meta: "Product confidence",
		icon: BadgeCheck,
	},
]

const audienceCards = [
	{
		key: "guest",
		label: "Guest",
		title: "Preview the product before login",
		description: "A guest sees the story, the value, and a clear path to sign in or explore the demo.",
		actions: ["Explore homepage", "View demo", "Start here"],
		panelTitle: "Public landing view",
		panelNote: "No account required",
		previewTitle: "First impression",
		previewBullets: ["Simple product promise", "Premium visuals", "Clear CTA path"],
		accent: "from-sky-400/20 via-white/10 to-emerald-400/15",
	},
	{
		key: "employee",
		label: "Registered User",
		title: "Enter a focused personal workspace",
		description: "A signed-in user lands on a clean workbench with tasks, updates, and team communication.",
		actions: ["Open tasks", "Check updates", "Message team"],
		panelTitle: "Personal workbench",
		panelNote: "Daily work in one place",
		previewTitle: "What they feel",
		previewBullets: ["Current tasks", "Recent comments", "Upcoming priorities"],
		accent: "from-emerald-400/20 via-white/10 to-sky-400/15",
	},
	{
		key: "pm",
		label: "Project Manager",
		title: "Watch projects and delivery health",
		description: "A PM sees project status, milestones, activity, and follow-up work without losing the bigger picture.",
		actions: ["Review projects", "Check milestones", "Track risks"],
		panelTitle: "Delivery command center",
		panelNote: "Coordination and oversight",
		previewTitle: "Dashboard focus",
		previewBullets: ["Active projects", "Client follow-ups", "Risk signals"],
		accent: "from-amber-400/20 via-white/10 to-orange-400/15",
	},
	{
		key: "hr",
		label: "HR Manager",
		title: "Run people operations smoothly",
		description: "HR manages onboarding, employees, payroll readiness, and the health of the people workflow.",
		actions: ["Review onboarding", "Manage employees", "Prepare payroll"],
		panelTitle: "People operations center",
		panelNote: "Policy and coordination",
		previewTitle: "Operational focus",
		previewBullets: ["Open onboarding", "Employee records", "Payroll readiness"],
		accent: "from-fuchsia-400/20 via-white/10 to-violet-400/15",
	},
	{
		key: "admin",
		label: "Admin",
		title: "Oversee the whole system",
		description: "Admin sees accounts, approvals, access, and the overall health of the platform.",
		actions: ["Review access", "Manage accounts", "Check audit"],
		panelTitle: "System oversight",
		panelNote: "Governance and control",
		previewTitle: "Oversight view",
		previewBullets: ["User access", "Settings review", "Audit status"],
		accent: "from-slate-200/20 via-white/10 to-cyan-400/15",
	},
]

const featureExperiences = [
	{
		title: "Authentication that feels intentional",
		description: "The sign-in path gives users a simple entry into the right role without adding friction to the story.",
		icon: ShieldCheck,
	},
	{
		title: "Dashboard experiences that stay focused",
		description: "Each dashboard keeps the most important work visible first, so the interface feels useful at a glance.",
		icon: LayoutDashboard,
	},
	{
		title: "Communication that stays close to work",
		description: "Channel and direct-message moments feel like part of the workflow, not a separate chat app.",
		icon: MessageSquare,
	},
	{
		title: "Management that looks operational",
		description: "HR, projects, and approvals are framed as real day-to-day operations instead of abstract admin screens.",
		icon: Briefcase,
	},
	{
		title: "Tracking that creates confidence",
		description: "Progress, activity, and status indicators make the system feel active and reliable.",
		icon: BarChart3,
	},
	{
		title: "Flow that removes guesswork",
		description: "The interface leads users from entry to action in a way that feels clean, modern, and complete.",
		icon: Workflow,
	},
]

const flowSteps = [
	{ title: "Guest arrives", description: "A visitor lands on the homepage and sees the product story, the audience, and the call to action." },
	{ title: "User signs in", description: "The login step moves them into a role-specific space without changing the overall product language." },
	{ title: "Role is applied", description: "Admin, HR, PM, and employee views adapt to the right tools and priorities." },
	{ title: "Actions happen", description: "People can inspect work, manage updates, review progress, or handle approvals in context." },
	{ title: "Work stays connected", description: "Messages, dashboards, and operational screens keep the system feeling like one platform." },
]

const credibilityPoints = [
	"Clear hierarchy and premium spacing make the page read like a commercial product site.",
	"Role-aware previews explain who uses the platform without requiring login.",
	"The public homepage stays separate from the protected shell, so the product story remains clean.",
	"The entire layout is responsive, polished, and built for a recruiter or examiner to scroll through once and understand quickly.",
]

const roleSequence = ["guest", "employee", "pm", "hr", "admin"]

const roleAtlas = {
	guest: {
		badge: "Public view",
		icon: UserRound,
		accent: "from-sky-400/20 via-white/10 to-cyan-300/10",
		panelGlow: "shadow-[0_35px_120px_rgba(56,189,248,0.16)]",
		tone: "Visitor experience",
		headline: "Guest / Visitor",
		summary: "A visitor can understand the product, see the value quickly, and move toward login or a demo without friction.",
		journey: ["Sees the promise", "Checks the visual demo", "Moves to login"],
		focus: ["Understand the platform", "Compare roles quickly", "Reach the sign-in path easily"],
		cta: "Explore the homepage",
	},
	employee: {
		badge: "Daily execution",
		icon: Users,
		accent: "from-emerald-400/20 via-white/10 to-teal-300/10",
		panelGlow: "shadow-[0_35px_120px_rgba(16,185,129,0.16)]",
		tone: "Daily workspace",
		headline: "Registered User / Employee",
		summary: "The employee view stays focused: tasks, updates, hours, and personal progress sit together in one work area.",
		journey: ["Opens assigned work", "Updates progress", "Keeps the board current"],
		focus: ["Track assigned tasks", "Review hours and updates", "Stay aligned with team work"],
		cta: "Open the workspace",
	},
	pm: {
		badge: "Delivery control",
		icon: Briefcase,
		accent: "from-amber-400/20 via-white/10 to-orange-300/10",
		panelGlow: "shadow-[0_35px_120px_rgba(245,158,11,0.16)]",
		tone: "Delivery overview",
		headline: "Project Manager / Delivery Lead",
		summary: "The PM view surfaces project status, milestones, risks, and client follow-ups so delivery stays on track.",
		journey: ["Checks project health", "Reviews milestones", "Unblocks delivery risks"],
		focus: ["Monitor active projects", "Track client feedback", "Keep milestones moving"],
		cta: "Review delivery",
	},
	hr: {
		badge: "People operations",
		icon: CalendarDays,
		accent: "from-fuchsia-400/20 via-white/10 to-violet-300/10",
		panelGlow: "shadow-[0_35px_120px_rgba(217,70,239,0.16)]",
		tone: "People operations",
		headline: "HR Manager / People Ops",
		summary: "HR gets a clean surface for onboarding, employee records, payroll readiness, and policy coordination.",
		journey: ["Reviews onboarding", "Updates employee records", "Prepares payroll"],
		focus: ["Manage employee records", "Coordinate onboarding", "Finalize payroll readiness"],
		cta: "Open HR tools",
	},
	admin: {
		badge: "System governance",
		icon: ShieldCheck,
		accent: "from-slate-200/20 via-white/10 to-cyan-300/10",
		panelGlow: "shadow-[0_35px_120px_rgba(148,163,184,0.16)]",
		tone: "System oversight",
		headline: "Admin / Platform Owner",
		summary: "Admin combines access control, approvals, account oversight, and system health in one view.",
		journey: ["Reviews access", "Checks audit state", "Keeps governance tight"],
		focus: ["Manage roles and permissions", "Review system health", "Approve key actions"],
		cta: "Inspect system health",
	},
}

function SectionEyebrow({ children }) {
	return <p className="text-xs uppercase tracking-[0.3em] text-white/55">{children}</p>
}

function StatPill({ label, value }) {
	return (
		<div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 shadow-[0_12px_32px_rgba(2,6,23,0.14)] backdrop-blur-sm">
			<p className="text-[11px] uppercase tracking-[0.22em] text-white/50">{label}</p>
			<p className="mt-2 text-lg font-semibold text-white">{value}</p>
		</div>
	)
}

function FeatureCard({ title, description, icon: Icon }) {
	return (
		<article className="group rounded-[1.75rem] border border-white/10 bg-white/6 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.18)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-white/18">
			<div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white transition-transform duration-200 group-hover:scale-105">
				<Icon className="h-5 w-5" />
			</div>
			<h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
			<p className="mt-2 text-sm leading-6 text-white/70">{description}</p>
		</article>
	)
}

function RoleBadge({ active, label, onClick, icon: Icon }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${active ? "border-white/20 bg-white text-slate-950 shadow-lg shadow-black/10" : "border-white/10 bg-white/6 text-white/72 hover:border-white/20 hover:bg-white/10 hover:text-white"}`}
		>
			<Icon className={`h-4 w-4 ${active ? "text-slate-950" : "text-white/75"}`} />
			{label}
		</button>
	)
}

function JourneyStep({ title, description, index }) {
	return (
		<div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/6 p-5 shadow-[0_18px_55px_rgba(2,6,23,0.12)] backdrop-blur-sm">
			<div className="absolute inset-x-0 top-0 h-px bg-white/10" />
			<div className="flex items-center justify-between">
				<div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-950">
					{index + 1}
				</div>
				<ChevronRight className="h-4 w-4 text-white/35" />
			</div>
			<h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
			<p className="mt-2 text-sm leading-6 text-white/68">{description}</p>
		</div>
	)
}

function RolePreview({ role }) {
	const roleData = roleAtlas[role.key]
	const roleConfig = roleDefinitions[role.key]
	const label = roleConfig?.label ?? role.label
	const stats = roleConfig?.stats ?? []
	const focusPoints = roleData.focus
	const quickActions = roleConfig?.quickActions ?? role.actions
	const activity = roleConfig?.activity ?? []
	const icons = {
		guest: UserRound,
		employee: Users,
		pm: Briefcase,
		hr: CalendarDays,
		admin: ShieldCheck,
	}
	const Icon = roleData.icon ?? icons[role.key] ?? Users
	const uniqueStats = role.key === "guest"
		? [
			{ label: "Journey", value: "Entry", note: "Explain the platform without sign-in." },
			{ label: "Outcome", value: "Clarity", note: "Show roles, value, and next action." },
			{ label: "CTA", value: "Login", note: "Move toward the workspace." },
		]
		: stats

	return (
		<div className={`relative overflow-hidden grid gap-6 rounded-[2rem] border border-white/10 bg-gradient-to-br ${roleData.accent} p-6 ${roleData.panelGlow} backdrop-blur-xl`}>
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_40%)]" />
			<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
				<div className="max-w-3xl space-y-3">
					<div className="flex flex-wrap items-center gap-2">
						<span className="rounded-full border border-white/12 bg-slate-950/30 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/68">
							{roleData.badge}
						</span>
						<span className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-white/68">
							{roleData.tone}
						</span>
					</div>
					<div className="flex items-center gap-3">
						<div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white shadow-lg shadow-black/10">
							<Icon className="h-5 w-5" />
						</div>
						<div>
							<p className="text-xs uppercase tracking-[0.24em] text-white/50">{label}</p>
							<h3 className="mt-1 text-2xl font-semibold text-white">{roleData.headline}</h3>
						</div>
					</div>
					<p className="max-w-2xl text-sm leading-6 text-white/76">{roleData.summary}</p>
				</div>
				<div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-slate-950/30 px-3 py-2 text-xs font-medium text-white/75 backdrop-blur-sm">
					<CircleDot className="h-3.5 w-3.5 text-emerald-300" />
					Role-specific view
				</div>
			</div>

			<div className="relative grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
				<div className="rounded-[1.75rem] border border-white/10 bg-slate-950/45 p-5 shadow-[0_20px_60px_rgba(2,6,23,0.12)] backdrop-blur-xl">
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="text-xs uppercase tracking-[0.24em] text-white/45">Role snapshot</p>
							<h4 className="mt-2 text-lg font-semibold text-white">{roleData.tone}</h4>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/8 px-3 py-2 text-right text-xs text-white/68">
							<p>{roleData.cta}</p>
							<p className="mt-1 font-medium text-white">Clear next step</p>
						</div>
					</div>

					<div className="mt-5 grid gap-3 sm:grid-cols-3">
						{uniqueStats.slice(0, 3).map((item) => (
							<div key={`${item.label}-${item.note}`} className="rounded-2xl border border-white/10 bg-white/6 p-4 shadow-[0_10px_24px_rgba(2,6,23,0.08)]">
								<p className="text-[11px] uppercase tracking-[0.2em] text-white/45">{item.label}</p>
								<p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
								<p className="mt-1 text-xs leading-5 text-white/62">{item.note}</p>
							</div>
						))}
					</div>

					<div className="mt-4 grid gap-3 sm:grid-cols-2">
						<div className="rounded-2xl border border-white/10 bg-white/6 p-4 shadow-[0_10px_24px_rgba(2,6,23,0.08)]">
							<p className="text-xs uppercase tracking-[0.2em] text-white/45">Primary actions</p>
							<div className="mt-3 flex flex-wrap gap-2">
								{quickActions.slice(0, 4).map((action) => (
									<span key={action} className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-xs font-medium text-white/78">
										{action}
									</span>
								))}
							</div>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/6 p-4 shadow-[0_10px_24px_rgba(2,6,23,0.08)]">
							<p className="text-xs uppercase tracking-[0.2em] text-white/45">User experience</p>
							<ul className="mt-3 space-y-2 text-sm text-white/72">
								{focusPoints.map((point) => (
									<li key={point} className="flex gap-2">
										<CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-300" />
										<span>{point}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>

				<div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 shadow-[0_18px_55px_rgba(2,6,23,0.12)] backdrop-blur-sm">
					<div className="flex items-center justify-between gap-3">
						<p className="text-xs uppercase tracking-[0.24em] text-white/45">How it moves</p>
						<SlidersHorizontal className="h-4 w-4 text-white/45" />
					</div>
					<div className="mt-4 space-y-3">
						{roleData.journey.map((item, index) => (
							<div key={item} className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white/74 shadow-[0_10px_24px_rgba(2,6,23,0.08)]">
								<div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-white/42">
									<BadgeCheck className="h-3.5 w-3.5 text-emerald-300" />
									<span>{index === 0 ? "Step one" : index === 1 ? "Step two" : "Step three"}</span>
								</div>
								{item}
							</div>
						))}
					</div>

						<div className="mt-4 rounded-2xl border border-white/10 bg-white/6 p-4 shadow-[0_10px_24px_rgba(2,6,23,0.08)]">
							<p className="text-xs uppercase tracking-[0.2em] text-white/45">Workspace reference</p>
						<p className="mt-2 text-sm leading-6 text-white/72">{roleConfig?.dashboardTitle ?? roleData.headline}</p>
						<p className="mt-2 text-xs leading-5 text-white/55">{roleConfig?.dashboardDescription ?? roleData.summary}</p>
						<div className="mt-3 flex flex-wrap gap-2">
							{(roleConfig?.sidebarItems ?? []).slice(0, 4).map((item) => (
								<span key={item} className="rounded-full border border-white/10 bg-white/8 px-3 py-1.5 text-[11px] font-medium text-white/75">
									{item}
								</span>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export function HomePage() {
	const [activeRole, setActiveRole] = useState("admin")
	const selectedRole = audienceCards.find((role) => role.key === activeRole) ?? audienceCards[0]

	return (
		<div id="top" className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_26%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.14),transparent_22%),linear-gradient(180deg,rgba(2,6,23,0.99),rgba(8,15,32,0.99))] text-white">
			<div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
			<main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
				<header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 px-5 py-4 shadow-[0_20px_60px_rgba(2,6,23,0.22)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.28em] text-white/55">WorkNexus</p>
						<p className="mt-1 text-sm text-white/70">A role-based workspace demo that looks and feels like a real product.</p>
					</div>

					<nav className="flex flex-wrap items-center gap-3 text-sm">
						<a href="#story" className="rounded-full border border-white/10 px-4 py-2 text-white/75 transition-colors hover:bg-white/8 hover:text-white">
							Story
						</a>
						<a href="#roles" className="rounded-full border border-white/10 px-4 py-2 text-white/75 transition-colors hover:bg-white/8 hover:text-white">
							Roles
						</a>
						<a href="#flow" className="rounded-full border border-white/10 px-4 py-2 text-white/75 transition-colors hover:bg-white/8 hover:text-white">
							Flow
						</a>
						<Link to="/login" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-slate-950 transition-transform hover:-translate-y-0.5">
							Login
							<ArrowRight className="h-4 w-4" />
						</Link>
					</nav>
				</header>

				<section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
					<div className="space-y-8">
						<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-4 py-2 text-sm text-white/80 shadow-[0_10px_24px_rgba(2,6,23,0.12)] backdrop-blur-sm">
							<Sparkles className="h-4 w-4 text-sky-300" />
							Role-based workspace for HR, delivery, and operations teams.
						</div>

						<div className="space-y-5">
							<SectionEyebrow>Overview</SectionEyebrow>
							<h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
								A modern workspace demo that shows how every role gets work done.
							</h1>
							<p className="max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
								WorkNexus brings guests, employees, HR, project managers, and admins into one polished experience. Scroll the homepage to understand the product, the roles, and the flow without opening an account.
							</p>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Link to="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950 shadow-[0_12px_35px_rgba(15,23,42,0.25)] transition-transform hover:-translate-y-0.5">
								Get started
								<ArrowRight className="h-4 w-4" />
							</Link>
							<a href="#roles" className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/12 bg-white/6 px-5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10">
								Explore the experience
							</a>
							<a href="#flow" className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/12 bg-white/3 px-5 text-sm font-semibold text-white/75 transition-colors hover:bg-white/8">
								See how it works
							</a>
						</div>

						<div className="grid gap-3 sm:grid-cols-3">
							<StatPill label="Presentation style" value="Premium SaaS" />
							<StatPill label="Roles shown" value="Guest + 4 roles" />
							<StatPill label="Goal" value="Understand in one scroll" />
						</div>
					</div>

						<div className="relative">
							<div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_36%)] blur-2xl" />
							<div className="rounded-[2rem] border border-white/10 bg-white/6 p-5 shadow-[0_35px_100px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-6">
								<div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5 shadow-[0_20px_50px_rgba(2,6,23,0.14)]">
								<div className="flex items-center justify-between gap-3">
									<div>
										<SectionEyebrow>Workspace overview</SectionEyebrow>
										<h2 className="mt-2 text-xl font-semibold text-white">At a glance</h2>
									</div>
									<span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
										Always visible
									</span>
								</div>

								<div className="mt-6 grid gap-3 sm:grid-cols-2">
									<div className="rounded-2xl border border-white/10 bg-white/6 p-4 shadow-[0_10px_24px_rgba(2,6,23,0.08)]">
												<p className="text-[11px] uppercase tracking-[0.22em] text-white/48">For visitors</p>
												<p className="mt-2 text-sm leading-6 text-white/78">They can understand the platform, the roles, and the entry point without needing to sign in.</p>
									</div>
									<div className="rounded-2xl border border-white/10 bg-white/6 p-4 shadow-[0_10px_24px_rgba(2,6,23,0.08)]">
												<p className="text-[11px] uppercase tracking-[0.22em] text-white/48">For teams</p>
												<p className="mt-2 text-sm leading-6 text-white/78">The page keeps the story focused on the product and the people who use it.</p>
									</div>
								</div>

								<div className="mt-5 grid gap-3 sm:grid-cols-2">
									<div className="rounded-2xl border border-white/10 bg-white/6 p-4 shadow-[0_10px_24px_rgba(2,6,23,0.08)]">
										<div className="flex items-center justify-between">
											<p className="text-xs uppercase tracking-[0.2em] text-white/50">Why it works</p>
											<BadgeCheck className="h-4 w-4 text-emerald-300" />
										</div>
										<p className="mt-3 text-sm font-semibold text-white">The entry path is obvious</p>
										<p className="mt-2 text-sm leading-6 text-white/70">The homepage makes the product easy to understand before any login.</p>
									</div>
									<div className="rounded-2xl border border-white/10 bg-white/6 p-4 shadow-[0_10px_24px_rgba(2,6,23,0.08)]">
										<div className="flex items-center justify-between">
											<p className="text-xs uppercase tracking-[0.2em] text-white/50">Design language</p>
											<Sparkle className="h-4 w-4 text-sky-300" />
										</div>
										<p className="mt-3 text-sm font-semibold text-white">Minimal, premium, and polished</p>
										<p className="mt-2 text-sm leading-6 text-white/70">Gradients, glass, and clean cards give the page a commercial SaaS finish.</p>
									</div>
								</div>

								<div className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_12px_30px_rgba(2,6,23,0.1)]">
									<div className="flex items-center justify-between gap-3">
										<div>
											<p className="text-xs uppercase tracking-[0.22em] text-white/48">Quick snapshot</p>
											<p className="mt-2 text-sm text-white/75">The homepage reads like a complete product page, not a slide deck.</p>
										</div>
										<div className="rounded-full border border-white/10 bg-white/7 px-3 py-1 text-xs text-white/65">Responsive</div>
									</div>
									<div className="mt-4 grid gap-3 md:grid-cols-3">
										<div className="rounded-2xl border border-white/10 bg-white/6 p-4 shadow-[0_8px_22px_rgba(2,6,23,0.08)]">
											<p className="text-xs uppercase tracking-[0.2em] text-white/45">Top line</p>
											<p className="mt-2 text-sm font-semibold text-white">Story, roles, flow</p>
										</div>
										<div className="rounded-2xl border border-white/10 bg-white/6 p-4 shadow-[0_8px_22px_rgba(2,6,23,0.08)]">
											<p className="text-xs uppercase tracking-[0.2em] text-white/45">Action</p>
											<p className="mt-2 text-sm font-semibold text-white">Login or explore</p>
										</div>
										<div className="rounded-2xl border border-white/10 bg-white/6 p-4 shadow-[0_8px_22px_rgba(2,6,23,0.08)]">
											<p className="text-xs uppercase tracking-[0.2em] text-white/45">Focus</p>
											<p className="mt-2 text-sm font-semibold text-white">Role previews</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<section id="story" className="grid gap-4 py-4 sm:grid-cols-2 xl:grid-cols-4">
					{storyCards.map((card) => (
						<FeatureCard key={card.title} {...card} />
					))}
				</section>

				<section id="roles" className="py-10 lg:py-14">
					<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
						<div className="max-w-2xl space-y-3">
							<SectionEyebrow>Roles</SectionEyebrow>
							<h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Every role has a distinct, professional workspace.</h2>
							<p className="text-sm leading-7 text-white/70 sm:text-base">
								The role section shows how the product feels for visitors, employees, managers, HR, and admins through distinct workspace panels.
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							{roleSequence.map((role) => {
								const roleConfig = roleDefinitions[role]
								const Icon = role === "guest" ? UserRound : role === "employee" ? Users : role === "pm" ? Briefcase : role === "hr" ? CalendarDays : ShieldCheck

								return (
									<RoleBadge
										key={role}
										active={activeRole === role}
										label={role === "guest" ? "Guest" : roleConfig?.label ?? role}
										onClick={() => setActiveRole(role)}
										icon={Icon}
									/>
								)
							})}
						</div>
					</div>

					<RolePreview role={selectedRole} />
				</section>

				<section id="flow" className="py-10 lg:py-14">
					<div className="max-w-2xl space-y-3">
							<SectionEyebrow>How it works</SectionEyebrow>
							<h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">A visitor can understand the flow in one pass.</h2>
						<p className="text-sm leading-7 text-white/70 sm:text-base">
								The page moves from visitor entry to sign-in, role access, action, and result in a clear sequence.
						</p>
					</div>

					<div className="mt-6 grid gap-4 lg:grid-cols-5">
						{flowSteps.map((step, index) => (
							<JourneyStep key={step.title} {...step} index={index} />
						))}
					</div>
				</section>

				<section className="py-10 lg:py-14">
					<div className="mb-6 max-w-2xl space-y-3">
							<SectionEyebrow>Experience</SectionEyebrow>
							<h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">The features feel like everyday product use.</h2>
						<p className="text-sm leading-7 text-white/70 sm:text-base">
								Each card below describes what people do inside the product and how it feels in practice.
						</p>
					</div>

					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{featureExperiences.map((card) => (
							<FeatureCard key={card.title} {...card} />
						))}
					</div>
				</section>

				<section className="grid gap-6 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-14">
					<div className="rounded-[2rem] border border-white/10 bg-white/6 p-6 shadow-sm backdrop-blur-sm">
							<SectionEyebrow>Why it works</SectionEyebrow>
							<h2 className="mt-3 text-2xl font-semibold text-white">Commercial polish, clear workflows, and role clarity.</h2>
						<p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
								The page is designed to feel like a production SaaS landing page with premium cards, motion, and clear hierarchy.
						</p>

						<ul className="mt-6 space-y-3 text-sm text-white/78">
							{credibilityPoints.map((point) => (
								<li key={point} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 leading-6">
									<CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-300" />
									<span>{point}</span>
								</li>
							))}
						</ul>
					</div>

					<div className="grid gap-4 md:grid-cols-2">
						{highlights.map((item) => (
							<FeatureCard key={item.title} {...item} />
						))}
					</div>
				</section>

				<section className="mt-2 rounded-[2rem] border border-white/10 bg-white/6 px-6 py-6 shadow-[0_24px_70px_rgba(2,6,23,0.2)] backdrop-blur-sm sm:px-8">
					<div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
						<div className="max-w-2xl">
							<SectionEyebrow>Closing</SectionEyebrow>
							<h2 className="mt-3 text-2xl font-semibold text-white">A complete working system with a polished public front door.</h2>
							<p className="mt-2 text-sm leading-6 text-white/70">
								The homepage ends by reinforcing that the platform is clear, professional, and ready to present.
							</p>
						</div>

						<div className="flex flex-col gap-3 sm:flex-row">
							<Link to="/login" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-slate-950 transition-transform hover:-translate-y-0.5">
								Open the workspace
								<ArrowRight className="h-4 w-4" />
							</Link>
							<a href="#top" className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/12 bg-white/6 px-5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10">
								Back to top
							</a>
						</div>
					</div>
				</section>

				<footer className="flex flex-col gap-4 py-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
					<p>WorkNexus. A storytelling homepage for a role-based workspace that feels real at first glance.</p>
					<div className="flex flex-wrap gap-4">
						<Link to="/login" className="transition-colors hover:text-white">
							Login
						</Link>
						<Link to="/forgot-password" className="transition-colors hover:text-white">
							Forgot password
						</Link>
						<a href="#roles" className="transition-colors hover:text-white">
							Roles
						</a>
					</div>
				</footer>
			</main>
		</div>
	)
}
