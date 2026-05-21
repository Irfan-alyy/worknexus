export function DashboardMetricGrid({ items }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article key={item.label} className="rounded-3xl border border-border bg-background p-5 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight">{item.value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>
        </article>
      ))}
    </div>
  )
}