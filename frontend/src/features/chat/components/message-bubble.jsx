export function MessageBubble({ author, time, text, tone = "neutral" }) {
	const palette =
		tone === "highlight"
			? "border-primary/30 bg-primary/10"
			: tone === "muted"
				? "border-border bg-muted/40"
				: "border-border bg-background"

	const initials = author
		.split(" ")
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase()

	return (
		<article className={`rounded-3xl border p-4 shadow-sm ${palette}`}>
			<div className="flex items-start gap-3">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-xs font-semibold">
					{initials}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-baseline justify-between gap-3">
						<h4 className="text-sm font-semibold">{author}</h4>
						<span className="text-xs text-muted-foreground">{time}</span>
					</div>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
				</div>
			</div>
		</article>
	)
}
