import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Forward, MessageSquareReply, MoreHorizontal, Pencil, Smile, Trash2, X } from "lucide-react"
import { useGlobalStore } from "@/stores/use-global-store"
import { directMessages } from "@/features/chat/chat-data"

const quickReactions = ["👍", "❤️", "😂"]
const emojiPicker = ["😀", "😅", "😍", "🤔", "👏", "🔥", "🎉", "🙏", "👍", "❤️", "😂", "👀"]

export function MessageBubble({
	author,
	time,
	text,
	tone = "neutral",
	isMine = false,
	reactions = [],
	replyCount = 0,
	isEditing = false,
	editedText = "",
	onReply,
	onForward,
	onEdit,
	onEditChange,
	onEditSave,
	onEditCancel,
	onDelete,
	onReact,
}) {
	const [isEmojiPanelOpen, setIsEmojiPanelOpen] = useState(false)
	const editTextAreaRef = useRef(null)

	const palette =
		tone === "highlight"
			? "border-primary/30 bg-primary/10"
			: tone === "muted"
				? "border-border bg-muted/40"
				: "border-border bg-background"

	const initials = author
		.split(" ")
		.slice(0, 2)
		.map((part) => part[0])
		.join("")
		.toUpperCase()

	const containerClasses = `rounded-3xl border p-4 shadow-sm ${palette} ${isMine ? "ml-auto" : ""} max-w-[92%] sm:max-w-[70%] w-fit whitespace-pre-wrap break-words`
	const rowClasses = `flex items-start gap-3 ${isMine ? "flex-row-reverse" : ""}`

	const { openAside } = useGlobalStore()

	useEffect(() => {
		if (!isEditing) return
		editTextAreaRef.current?.focus()
		editTextAreaRef.current?.setSelectionRange(editTextAreaRef.current.value.length, editTextAreaRef.current.value.length)
	}, [isEditing])

	const handleReact = (emoji) => {
		onReact?.(emoji)
		setIsEmojiPanelOpen(false)
	}

	const showUserDetail = useCallback(() => {
		const user = directMessages.find((d) => d.name === author) || { name: author, status: "unknown" }
		function UserDetailPanel({ user }) {
			return (
				<div className="space-y-4">
					<div>
						<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">User profile</p>
						<h3 className="mt-1 text-xl font-semibold">{user.name}</h3>
						<p className="mt-1 text-sm text-muted-foreground">Status: {user.status}</p>
					</div>

					<section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
						<p className="text-sm font-medium">Contact</p>
						<div className="mt-3 space-y-1 text-sm text-muted-foreground">
							<p>Email: —</p>
							<p>Phone: —</p>
						</div>
					</section>
				</div>
			)
		}

		openAside(`User: ${user.name}`, <UserDetailPanel user={user} />)
	}, [author, openAside])

	const reactionCount = reactions.reduce((total, reaction) => total + (reaction.count ?? 1), 0)

	return (
		<article className={`group relative ${containerClasses}`}>
			<div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full border border-border/70 bg-background/95 px-1 py-1 opacity-100 shadow-sm transition duration-150 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
				{quickReactions.map((emoji) => (
					<button
						key={emoji}
						type="button"
						onClick={() => handleReact(emoji)}
						className="inline-flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors hover:bg-secondary"
						aria-label={`React with ${emoji}`}
					>
						{emoji}
					</button>
				))}
				<button
					type="button"
					onClick={() => setIsEmojiPanelOpen((value) => !value)}
					className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
					aria-label="Open emoji picker"
				>
					<Smile className="h-4 w-4" />
				</button>
				{!isMine ? (
					<button
						type="button"
						onClick={() => onReply?.()}
						className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
						aria-label="Reply"
					>
							<MessageSquareReply className="h-4 w-4" />
					</button>
				) : null}
				<button
					type="button"
					onClick={() => onForward?.()}
					className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
					aria-label="Forward"
				>
					<Forward className="h-4 w-4" />
				</button>
				{isMine ? (
					<>
						<button
							type="button"
							onClick={() => onEdit?.()}
							className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
							aria-label="Edit message"
						>
							<Pencil className="h-4 w-4" />
						</button>
						<button
							type="button"
							onClick={() => onDelete?.()}
							className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
							aria-label="Delete message"
						>
							<Trash2 className="h-4 w-4" />
						</button>
					</>
				) : null}
			</div>

			{isEmojiPanelOpen ? (
				<div className="absolute right-3 top-14 z-20 w-56 rounded-3xl border border-border bg-background p-3 shadow-xl">
					<div className="flex items-center justify-between gap-2 border-b border-border pb-2">
						<div>
							<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Emoji</p>
							<p className="mt-1 text-sm font-medium">Quick reactions</p>
						</div>
						<button
							type="button"
							onClick={() => setIsEmojiPanelOpen(false)}
							className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
							aria-label="Close emoji picker"
						>
							<MoreHorizontal className="h-4 w-4" />
						</button>
					</div>
					<div className="mt-3 grid grid-cols-4 gap-2">
						{emojiPicker.map((emoji) => (
							<button
								key={emoji}
								type="button"
								onClick={() => handleReact(emoji)}
								className="inline-flex h-10 items-center justify-center rounded-2xl border border-border bg-secondary/40 text-lg transition-colors hover:bg-secondary"
								aria-label={`React with ${emoji}`}
							>
								{emoji}
							</button>
						))}
					</div>
					<button
						type="button"
						onClick={() => setIsEmojiPanelOpen(false)}
						className="mt-3 w-full rounded-2xl border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
					>
						Custom emoji panel
					</button>
				</div>
			) : null}
			<div className={rowClasses}>
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-xs font-semibold">
					{initials}
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-baseline justify-between gap-3">
						<button type="button" onClick={showUserDetail} className="text-sm font-semibold hover:underline text-left">
							{author}
						</button>
						<span className="text-xs text-muted-foreground">{time}</span>
					</div>
					{isEditing ? (
						<div className="mt-2 space-y-3">
							<textarea
								ref={editTextAreaRef}
								value={editedText}
								onChange={(event) => onEditChange?.(event.target.value)}
								rows={3}
								className="w-full resize-none rounded-2xl border border-border bg-background px-3 py-2 text-sm leading-6 outline-none ring-0 placeholder:text-muted-foreground focus:border-primary"
							/>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => onEditSave?.()}
									className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
								>
									<Check className="h-4 w-4" />
									Save
								</button>
								<button
									type="button"
									onClick={() => onEditCancel?.()}
									className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
								>
									<X className="h-4 w-4" />
									Cancel
								</button>
							</div>
						</div>
					) : (
						<p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
					)}
					{replyCount > 0 || reactionCount > 0 ? (
						<div className="mt-3 flex flex-wrap items-center gap-2">
							{replyCount > 0 ? (
								<button
									type="button"
									onClick={() => onReply?.()}
									className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
								>
									{replyCount} repl{replyCount === 1 ? "y" : "ies"}
								</button>
							) : null}
							{reactions.map((reaction) => (
								<button
									key={reaction.emoji}
									type="button"
									onClick={() => handleReact(reaction.emoji)}
									className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
								>
									<span>{reaction.emoji}</span>
									<span>{reaction.count ?? 1}</span>
								</button>
							))}
						</div>
					) : null}
				</div>
			</div>
		</article>
	)
}
