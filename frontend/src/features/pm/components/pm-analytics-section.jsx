import { Activity, BarChart3, Folder } from "lucide-react"

export function PmAnalyticsSection() {
	const stats = [
		{ label: "Active projects", value: "7", icon: Folder },
		{ label: "At risk", value: "2", icon: Activity },
		{ label: "On track", value: "5", icon: BarChart3 },
	]

	return (
		<div className="space-y-4">
			<div>
				<h2 className="text-lg font-semibold">Analytics</h2>
				<p className="mt-1 text-sm text-muted-foreground">A quick summary of delivery health and progress.</p>
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				{stats.map((stat) => {
					const Icon = stat.icon
					return (
						<div key={stat.label} className="rounded-2xl border border-border bg-background p-4">
							<div className="flex items-center justify-between gap-3">
								<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{stat.label}</p>
								<Icon className="h-4 w-4 text-muted-foreground" />
							</div>
							<p className="mt-2 text-2xl font-semibold">{stat.value}</p>
						</div>
					)
				})}
			</div>

			<div className="rounded-2xl border border-border bg-background p-4">
				<p className="text-sm font-medium">Delivery snapshot</p>
				<div className="mt-3 space-y-2 text-sm text-muted-foreground">
					<div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2"><span>Planning</span><span>32%</span></div>
					<div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2"><span>Development</span><span>54%</span></div>
					<div className="flex items-center justify-between rounded-xl bg-secondary/50 px-3 py-2"><span>Delivery</span><span>14%</span></div>
				</div>
			</div>
		</div>
	)
}