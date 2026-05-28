import { X } from "lucide-react"

export function Dialog({ open, title, children, onClose }) {
	if (!open) return null

	return (
		<div
			role="presentation"
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-[1px]"
			onMouseDown={onClose}
			onKeyDown={(event) => {
				if (event.key === "Escape") {
					onClose?.()
				}
			}}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={title || "Dialog"}
				className="w-full max-w-2xl rounded-3xl border border-border bg-card shadow-2xl"
				onMouseDown={(event) => event.stopPropagation()}
			>
				<div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
					<div>
						<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Popup</p>
						<h2 className="mt-1 text-lg font-semibold">{title || "Dialog"}</h2>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
						aria-label="Close dialog"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
				<div className="max-h-[calc(100vh-8rem)] overflow-y-auto px-6 py-5">
					{children}
				</div>
			</div>
		</div>
	)
}

export default Dialog
