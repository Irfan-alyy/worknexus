export function SalaryCard({ title, value, note }) {
	return (
		<article className="rounded-3xl border border-border bg-card p-5 shadow-sm">
			<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{title}</p>
			<h3 className="mt-3 text-3xl font-semibold tracking-tight">{value}</h3>
			<p className="mt-2 text-sm text-muted-foreground">{note}</p>
		</article>
	)
}
