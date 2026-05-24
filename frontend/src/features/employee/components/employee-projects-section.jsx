import { employeeProjects } from "@/features/employee/employee-data"

function statusBadgeClass(status) {
	if (status === "Completed") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
	if (status === "In Progress") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
	return "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
}

function projectTone(status) {
	if (status === "In Progress") return "border-amber-300/50"
	if (status === "At Risk") return "border-rose-300/50"
	if (status === "Planning") return "border-sky-300/50"
	return "border-border"
}

function summarizeTasks(tasks) {
	return tasks.reduce(
		(result, task) => {
			if (task.status === "Completed") result.completed += 1
			if (task.status === "In Progress") result.inProgress += 1
			if (task.status === "Pending") result.pending += 1
			return result
		},
		{ completed: 0, inProgress: 0, pending: 0 },
	)
}

export function EmployeeProjectsSection({ onOpenDetail }) {
	const totals = employeeProjects.reduce(
		(result, project) => {
			const summary = summarizeTasks(project.tasks)
			result.completed += summary.completed
			result.inProgress += summary.inProgress
			result.pending += summary.pending
			return result
		},
		{ completed: 0, inProgress: 0, pending: 0 },
	)

	return (
		<div className="space-y-6">
			<section className="grid gap-4 sm:grid-cols-3">
				<StatCard label="Completed tasks" value={String(totals.completed)} note="Approved and closed" />
				<StatCard label="In progress" value={String(totals.inProgress)} note="Currently active" />
				<StatCard label="Pending" value={String(totals.pending)} note="Next in queue" />
			</section>

			<section className="space-y-3">
				{employeeProjects.map((project) => {
					const summary = summarizeTasks(project.tasks)
					return (
						<article key={project.id} className={`rounded-3xl border bg-card p-5 shadow-sm ${projectTone(project.status)}`}>
							<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
								<button
									type="button"
									onClick={() => onOpenDetail(`Project: ${project.name}`, <ProjectDetail project={project} />)}
									className="text-left"
								>
									<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{project.projectCode}</p>
									<h3 className="mt-1 text-lg font-semibold">{project.name}</h3>
									<p className="mt-2 text-sm text-muted-foreground">
										Manager: {project.manager} • Channel: {project.channel} • Due: {project.dueDate}
									</p>
								</button>

								<div className="min-w-[11rem] rounded-2xl border border-border bg-background p-3">
									<p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Project health</p>
									<p className="mt-1 text-sm font-medium">{project.status}</p>
									<div className="mt-2 h-2 rounded-full bg-secondary">
										<div className="h-2 rounded-full bg-primary" style={{ width: `${project.completion}%` }} />
									</div>
									<p className="mt-1 text-xs text-muted-foreground">{project.completion}% complete</p>
								</div>
							</div>

							<div className="mt-4 grid gap-2 sm:grid-cols-3">
								<MiniCount label="Completed" value={summary.completed} />
								<MiniCount label="In Progress" value={summary.inProgress} />
								<MiniCount label="Pending" value={summary.pending} />
							</div>

							<div className="mt-4 space-y-2">
								{project.tasks.map((task) => (
									<button
										key={task.id}
										type="button"
										onClick={() => onOpenDetail(`Task: ${task.title}`, <TaskDetail task={task} project={project} />)}
										className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background px-3 py-2 text-left transition-colors hover:bg-secondary/50"
									>
										<div>
											<p className="text-sm font-medium">{task.title}</p>
											<p className="text-xs text-muted-foreground">{task.id} • Due {task.due} • Est {task.estimate}</p>
										</div>
										<div className="flex items-center gap-2">
											<span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">{task.priority}</span>
											<span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClass(task.status)}`}>{task.status}</span>
										</div>
									</button>
								))}
							</div>
						</article>
					)
				})}
			</section>
		</div>
	)
}

function StatCard({ label, value, note }) {
	return (
		<div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
			<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
			<p className="mt-2 text-2xl font-semibold">{value}</p>
			<p className="mt-1 text-xs text-muted-foreground">{note}</p>
		</div>
	)
}

function MiniCount({ label, value }) {
	return (
		<div className="rounded-2xl border border-border bg-background px-3 py-2">
			<p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
			<p className="mt-1 text-sm font-semibold">{value}</p>
		</div>
	)
}

function ProjectDetail({ project }) {
	const summary = summarizeTasks(project.tasks)

	return (
		<div className="space-y-4">
			<div>
				<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Project overview</p>
				<h3 className="mt-1 text-xl font-semibold">{project.name}</h3>
				<p className="mt-1 text-sm text-muted-foreground">{project.projectCode} • {project.status}</p>
			</div>

			<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Task distribution</p>
				<div className="mt-3 grid gap-2 sm:grid-cols-3">
					<MiniCount label="Completed" value={summary.completed} />
					<MiniCount label="In Progress" value={summary.inProgress} />
					<MiniCount label="Pending" value={summary.pending} />
				</div>
			</section>

			<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Details</p>
				<div className="mt-3 space-y-2 text-sm text-muted-foreground">
					<div className="rounded-xl border border-border bg-background px-3 py-2">Manager: {project.manager}</div>
					<div className="rounded-xl border border-border bg-background px-3 py-2">Channel: {project.channel}</div>
					<div className="rounded-xl border border-border bg-background px-3 py-2">Due: {project.dueDate}</div>
				</div>
			</section>

			<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Timeline checkpoints</p>
				<div className="mt-3 space-y-2">
					{project.timeline.map((step) => (
						<div key={step} className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
							{step}
						</div>
					))}
				</div>
			</section>

			<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Dependencies</p>
				<div className="mt-3 space-y-2">
					{project.dependencies.map((dependency) => (
						<div key={dependency} className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
							{dependency}
						</div>
					))}
				</div>
			</section>
		</div>
	)
}

function TaskDetail({ task, project }) {
	return (
		<div className="space-y-4">
			<div>
				<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Task detail</p>
				<h3 className="mt-1 text-xl font-semibold">{task.title}</h3>
				<p className="mt-1 text-sm text-muted-foreground">{task.id} • {project.name}</p>
			</div>

			<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Assignment info</p>
				<div className="mt-3 space-y-2 text-sm text-muted-foreground">
					<div className="rounded-xl border border-border bg-background px-3 py-2">Status: {task.status}</div>
					<div className="rounded-xl border border-border bg-background px-3 py-2">Priority: {task.priority}</div>
					<div className="rounded-xl border border-border bg-background px-3 py-2">Due date: {task.due}</div>
					<div className="rounded-xl border border-border bg-background px-3 py-2">Estimate: {task.estimate}</div>
					<div className="rounded-xl border border-border bg-background px-3 py-2">Blocker: {task.blocker}</div>
					<div className="rounded-xl border border-border bg-background px-3 py-2">Project manager: {project.manager}</div>
				</div>
			</section>
		</div>
	)
}
