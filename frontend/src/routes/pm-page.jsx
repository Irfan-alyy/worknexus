import { useGlobalStore } from "@/stores/use-global-store"

export function PmPage() {
  const { user } = useGlobalStore()

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Project Manager — Placeholder</h1>
        <p className="mt-2 text-sm text-muted-foreground">Signed in as {user.name || "Guest"}.</p>
        <p className="mt-4">This is a placeholder Project Manager screen created from the SDD roles.</p>
      </div>
    </div>
  )
}
