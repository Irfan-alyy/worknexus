import { useState, useRef, useEffect } from "react"
import { MoreVertical } from "lucide-react"

export default function ActionMenu({ items = [] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener("click", onDoc)
    return () => document.removeEventListener("click", onDoc)
  }, [])

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className="inline-flex items-center justify-center rounded-md p-2 border"
        title="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-44 origin-top-right rounded-md border border-border bg-popover text-foreground shadow-lg z-50">
          <div className="py-1">
            {items && items.length > 0 ? (
              items.map((it, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setOpen(false)
                    it.onClick && it.onClick()
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50"
                >
                  {it.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">No actions</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
