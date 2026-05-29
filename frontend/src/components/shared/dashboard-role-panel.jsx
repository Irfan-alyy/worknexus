export function DashboardRolePanel({ focusPoints, quickActions }) {
  return (
    <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Role focus</p>

      <div className="mt-4 space-y-3">
        {focusPoints.map((item) => (
          <div key={item} className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
            {item}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Quick actions</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {quickActions.map((item) => (
            <span key={item} className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground">
              {item}
            </span>
          ))}
        </div>
      </div>
    </aside>
  )
}