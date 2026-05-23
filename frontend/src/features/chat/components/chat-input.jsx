import { Send } from "lucide-react"
import { useRef, useEffect } from "react"

export function ChatInput() {
	const textareaRef = useRef(null)

	useEffect(() => {
		const ta = textareaRef.current
		if (!ta) return
		const resize = () => {
			const style = window.getComputedStyle(ta)
			const lineHeight = parseFloat(style.lineHeight) || 20
			const maxLines = 5
			const maxHeight = lineHeight * maxLines

			ta.style.height = "auto"
			const newHeight = Math.min(ta.scrollHeight, maxHeight)
			ta.style.height = `${newHeight}px`
			ta.style.maxHeight = `${maxHeight}px`
			ta.style.overflowY = ta.scrollHeight > maxHeight ? "auto" : "hidden"
			ta.style.boxSizing = "border-box"
		}
		// initial size
		resize()
		// resize on input
		ta.addEventListener("input", resize)
		return () => ta.removeEventListener("input", resize)
	}, [])

	return (
		<div className="rounded-3xl border border-border bg-background p-3 shadow-sm focus-within:ring-2 focus-within:ring-ring/40">
			<textarea
				ref={textareaRef}
				rows={2}
				placeholder="Write a message"
				className="w-full resize-none border-0 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
			/>
			<div className="mt-3 flex items-center justify-between border-t border-border pt-3">
				<p className="text-xs text-muted-foreground">Press Enter to send</p>
				<button
					type="button"
					className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
				>
					<Send className="h-4 w-4" />
					Send
				</button>
			</div>
		</div>
	)
}
