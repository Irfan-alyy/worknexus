import { Hash, MoreVertical, Users } from "lucide-react"

const channels = [
	{ name: "general", unread: 2 },
	{ name: "announcements", unread: 0 },
	{ name: "product-dev", unread: 5 },
	{ name: "random", unread: 1 },
]

const directMessages = ["Aisha Khan", "Muhammad Waqar", "Slackbot"]

export function ChannelSidebar({ onNavigate }) {
	return (
		<aside className="flex h-full min-h-0 flex-col overflow-hidden bg-muted/20">
			<div className="border-b border-border/60 p-4">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Channels</p>
						<h4 className="mt-1 text-sm font-semibold">Workspace rooms</h4>
					</div>
					<button type="button" className="rounded-full border border-border bg-background p-2 text-muted-foreground">
						<MoreVertical className="h-4 w-4" />
					</button>
				</div>
			</div>

			<div className="min-h-0 flex-1 overflow-y-auto p-4">
				<section className="space-y-2">
					{channels.map((channel) => (
						<button
							key={channel.name}
							type="button"
							onClick={onNavigate}
							className="flex w-full items-center justify-between rounded-2xl border border-transparent px-3 py-2 text-left text-sm hover:border-border hover:bg-background"
						>
							<span className="flex items-center gap-2 font-medium">
								<Hash className="h-4 w-4" />
								{channel.name}
							</span>
							{channel.unread > 0 ? (
								<span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
									{channel.unread}
								</span>
							) : null}
						</button>
					))}
				</section>

				<section className="mt-6 space-y-2">
					<div className="flex items-center justify-between px-1">
						<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Direct messages</p>
						<Users className="h-4 w-4 text-muted-foreground" />
					</div>
					{directMessages.map((name) => (
						<div key={name} className="rounded-2xl border border-transparent px-3 py-2 text-sm text-muted-foreground hover:border-border hover:bg-background">
							{name}
						</div>
					))}
				</section>
			</div>
		</aside>
	)
}
