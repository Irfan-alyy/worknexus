import { useEffect, useRef, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

export function RoleSelector({ value, options, onChange }) {
	const [open, setOpen] = useState(false)
	const containerRef = useRef(null)
	const selectedRole = options.find((option) => option.value === value) ?? options[0]

	useEffect(() => {
		const handleOutsideClick = (event) => {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setOpen(false)
			}
		}

		document.addEventListener("mousedown", handleOutsideClick)
		return () => document.removeEventListener("mousedown", handleOutsideClick)
	}, [])

	return (
		<div ref={containerRef} className="relative">
			<button
				type="button"
				onClick={() => setOpen((current) => !current)}
				className="inline-flex h-12 w-full items-center justify-between rounded-2xl border border-border bg-background px-4 text-left text-sm font-medium transition-colors hover:bg-secondary/60"
			>
				<span>{selectedRole?.label ?? "Choose temporary role"}</span>
				<ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
			</button>

			{open ? (
				<div className="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
					<div className="border-b border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
						Temporary roles
					</div>
					<div className="p-2">
						{options.map((option) => {
							const active = option.value === value

							return (
								<button
									key={option.value}
									type="button"
									onClick={() => {
										onChange(option.value)
										setOpen(false)
									}}
									className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "hover:bg-secondary/70"}`}
								>
									<span>{option.label}</span>
									{active ? <Check className="h-4 w-4" /> : null}
								</button>
							)
						})}
					</div>
				</div>
			) : null}
		</div>
	)
}