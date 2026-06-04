import { Paperclip, Send } from "lucide-react"
import { useEffect, useRef } from "react"

export function ChatInput({
	value = "",
	onChange,
	onSend,
	onAttach,
	placeholder = "Write a message",
	helperText = "Press Enter to send",
	attachLabel = "Upload file",
	sendLabel = "Send",
}) {
	const textareaRef = useRef(null)
	const fileInputRef = useRef(null)

	useEffect(() => {
		const ta = textareaRef.current
		if (!ta) return

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
	}, [value])

	const sendMessage = () => {
		const trimmed = value.trim()
		if (!trimmed) return
		onSend?.(trimmed)
	}

	const openFilePicker = () => {
		fileInputRef.current?.click()
	}

	const handleFileChange = (event) => {
		const files = Array.from(event.target.files ?? [])
		if (files.length > 0) {
			onAttach?.(files)
		}
		event.target.value = ""
	}

	return (
		<div className="rounded-3xl border border-border bg-background p-3 shadow-sm focus-within:ring-2 focus-within:ring-ring/40">
			<textarea
				ref={textareaRef}
				rows={2}
				value={value}
				onChange={(event) => onChange?.(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === "Enter" && !event.shiftKey) {
						event.preventDefault()
						sendMessage()
					}
				}}
				placeholder={placeholder}
				className="w-full resize-none border-0 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
			/>
			<div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
				<div className="flex items-center gap-2">
					{/* <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleFileChange} /> */}
					
					{helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
				</div>
				<button
					type="button"
					onClick={sendMessage}
					className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
				>
					<Send className="h-4 w-4" />
					{sendLabel}
				</button>
			</div>
		</div>
	)
}
