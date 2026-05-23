export function DashboardHero({ roleLabel, title, description }) {
  return (
    <div className="mb-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as {roleLabel || "Guest"}. {description}
        </p>
      </div>
    </div>
  )
}