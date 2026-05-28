import { CalendarDays } from "lucide-react"

export function PmMilestonesSection({ items, onOpenDetail }) {
	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-lg font-semibold">Milestones</h2>
				<p className="mt-1 text-sm text-muted-foreground">Track key checkpoints without extra clutter.</p>
			</div>

			<div className="grid gap-3">
				{items.map((milestone) => (
					<div key={milestone.id} className="flex items-start justify-between rounded-2xl border border-border bg-background p-4">
						<button type="button" onClick={() => onOpenDetail?.(`Milestone: ${milestone.name}`, <MilestoneDetail milestone={milestone} />)} className="text-left">
							<h3 className="font-medium">{milestone.name}</h3>
							<p className="mt-1 text-sm text-muted-foreground">{milestone.project}</p>
							<p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{milestone.status} • due {milestone.due}</p>
						</button>
						<CalendarDays className="h-4 w-4 text-muted-foreground" />
					</div>
				))}
			</div>
		</div>
	)
}

function MilestoneDetail({ milestone }) {
	return (
		<div className="space-y-3">
			<p className="text-sm">Milestone detail for <strong>{milestone.name}</strong></p>
			<div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Project</p>
				<p className="mt-2 text-sm text-muted-foreground">{milestone.project}</p>
			</div>
			<div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Status</p>
				<p className="mt-2 text-sm text-muted-foreground capitalize">{milestone.status}</p>
			</div>
		</div>
	)
}