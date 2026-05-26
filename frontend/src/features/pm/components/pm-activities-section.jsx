export function PmActivitiesSection({ items, selectedActivity, setSelectedActivity, onEdit }) {
	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-lg font-semibold">Activities</h2>
				<p className="mt-1 text-sm text-muted-foreground">A simple feed of recent project updates and delivery changes.</p>
			</div>

			<div className="grid gap-3">
				{items.map((activity) => (
					<button
						key={activity.id}
						type="button"
						onClick={() => {
							setSelectedActivity(activity)
							onEdit(`Activity: ${activity.title}`, <ActivityDetail activity={activity} />)
						}}
						className={`rounded-2xl border p-4 text-left transition-colors ${selectedActivity.id === activity.id ? "border-border bg-secondary/60" : "border-border bg-background hover:bg-secondary/30"}`}
					>
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{activity.title}</p>
								<h3 className="mt-1 text-base font-medium">{activity.note}</h3>
							</div>
							<span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">{activity.time}</span>
						</div>
					</button>
				))}
			</div>
		</div>
	)
}

function ActivityDetail({ activity }) {
	return (
		<div className="space-y-3">
			<p className="text-sm">Activity detail for <strong>{activity.title}</strong></p>
			<div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Note</p>
				<p className="mt-2 text-sm text-muted-foreground">{activity.note}</p>
			</div>
			<div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Details</p>
				<div className="mt-3 space-y-2">
					{activity.details.map((detail) => (
						<div key={detail} className="rounded-xl border border-border bg-background px-3 py-2 text-sm">{detail}</div>
					))}
				</div>
			</div>
		</div>
	)
}