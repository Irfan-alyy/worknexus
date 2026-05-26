import { employeeActivities } from "@/features/employee/employee-data"

function itemTone(activity) {
	if (activity.new) return "border-primary/40 bg-primary/5"
	return "border-border bg-card"
}

export function EmployeeActivitiesSection({ onOpenDetail }) {
	return (
		<div className="space-y-4">
			<div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
				<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Activity stream</p>
				<h2 className="mt-2 text-lg font-semibold">Everything related to your work updates</h2>
				<p className="mt-1 text-sm text-muted-foreground">Track assignments, channel additions, project moves, and approvals in one feed.</p>
			</div>

			<div className="space-y-3">
				{employeeActivities.map((activity) => (
					<button
						key={activity.id}
						type="button"
						onClick={() => onOpenDetail(`Activity: ${activity.type}`, <ActivityDetail activity={activity} />)}
						className={`w-full rounded-3xl border p-5 text-left shadow-sm transition-colors hover:bg-secondary/30 ${itemTone(activity)}`}
					>
						<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{activity.type}</p>
								<h3 className="mt-1 text-base font-semibold">{activity.title}</h3>
								<p className="mt-2 text-sm text-muted-foreground">{activity.summary}</p>
							</div>
							<div className="flex items-center gap-2">
								{activity.new ? <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">New</span> : null}
								<span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">{activity.time}</span>
							</div>
						</div>
					</button>
				))}
			</div>
		</div>
	)
}

function ActivityDetail({ activity }) {
	return (
		<div className="space-y-4">
			<div>
				<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Activity profile</p>
				<h3 className="mt-1 text-xl font-semibold">{activity.title}</h3>
				<p className="mt-1 text-sm text-muted-foreground">{activity.type} • {activity.time}</p>
			</div>

			<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Summary</p>
				<p className="mt-2 text-sm leading-6 text-muted-foreground">{activity.summary}</p>
			</section>

			<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Routing context</p>
				<div className="mt-3 space-y-2">
					<div className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">Source: {activity.source}</div>
					<div className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">Suggested action: {activity.action}</div>
				</div>
			</section>

			<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Related details</p>
				<div className="mt-3 space-y-2">
					{activity.details.map((detail) => (
						<div key={detail} className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
							{detail}
						</div>
					))}
				</div>
			</section>
		</div>
	)
}
