import { useState } from "react"

export function AllowanceModal() {
	const [open, setOpen] = useState(true)

	return (
		<section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Allowance review</p>
					<h3 className="mt-1 text-lg font-semibold">Pending adjustments</h3>
				</div>
				<button
					type="button"
					onClick={() => setOpen((value) => !value)}
					className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium"
				>
					{open ? "Hide" : "Show"}
				</button>
			</div>

			{open ? (
				<div className="mt-4 space-y-3 rounded-2xl border border-border bg-background p-4">
					<div className="flex items-center justify-between text-sm">
						<span>Transport allowance</span>
						<span className="font-medium">$240</span>
					</div>
					<div className="flex items-center justify-between text-sm">
						<span>Meal allowance</span>
						<span className="font-medium">$180</span>
					</div>
					<p className="pt-2 text-xs text-muted-foreground">
						Finalize these amounts before the payroll batch is locked.
					</p>
				</div>
			) : null}
		</section>
	)
}
