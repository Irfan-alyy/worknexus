export function DashboardHero({ roleLabel, title, description }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{roleLabel} dashboard</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
    </section>
  )
}