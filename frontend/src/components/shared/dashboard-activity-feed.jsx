export function DashboardActivityFeed({ items }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Recent activity</p>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <article key={item.title} className="rounded-2xl border border-border bg-background p-4">
            <p className="text-sm font-medium">{item.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
          </article>
        ))}
      </div>
    </section>
  )
}