import { useState } from "react"
import { ChevronDown } from "lucide-react"

export function CollapsibleListSection({ title, description, items, renderItem }) {
  const [open, setOpen] = useState(false)

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="border-t border-border/60 px-5 py-4">
          <div className="space-y-3">
            {items.map((item) => renderItem(item))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
