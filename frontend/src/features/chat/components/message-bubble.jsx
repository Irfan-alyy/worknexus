import { useCallback } from "react"
import { useGlobalStore } from "@/stores/use-global-store"
import { directMessages } from "@/features/chat/chat-data"

export function MessageBubble({ author, time, text, tone = "neutral", isMine = false }) {
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

	const containerClasses = `rounded-3xl border p-4 shadow-sm ${palette} ${isMine ? "ml-auto" : ""} max-w-[90%] sm:max-w-[70%] w-fit whitespace-pre-wrap break-words`
	const rowClasses = `flex items-start gap-3 ${isMine ? "flex-row-reverse" : ""}`

	const { openAside } = useGlobalStore()

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

	return (
		<article className={containerClasses}>
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
					<p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
				</div>
			</div>
		</article>
	)
}
