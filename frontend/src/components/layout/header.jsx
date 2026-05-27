import { useNavigate } from "react-router-dom"
import { LogOut, Menu, Search, MoonStar, SunMedium, X } from "lucide-react"

import { useLogoutMutation } from "@/features/auth"
import { useGlobalStore } from "@/stores/use-global-store"

export function Header({ isDarkMode, onToggleTheme, isMobile, isSidebarOpen, onToggleSidebar }) {
	const { user, signOut } = useGlobalStore()
	const navigate = useNavigate()
	const { mutateAsync: logout } = useLogoutMutation()

	const handleSignOut = async () => {
		try {
			await logout()
		} catch (error) {
			console.error("Logout failed", error)
		} finally {
			signOut()
			navigate("/login", { replace: true })
		}
	}

	return (
		<header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/80 bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
			<div className="flex items-center gap-3">
				{isMobile && (
					<button
						type="button"
						onClick={onToggleSidebar}
						aria-label={isSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
						className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary transition-colors hover:bg-accent md:hidden"
					>
						{isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
					</button>
				)}
				<div>
					<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">WorkNexus</p>
					<h1 className="mt-1 text-sm font-semibold">Operations workspace</h1>
				</div>
			</div>

			<div className="hidden w-full max-w-xl items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-2 text-sm text-muted-foreground md:flex">
				<Search className="h-4 w-4" />
				<span className="flex-1">Search across chats, payroll, and onboarding</span>
			</div>

			<div className="flex items-center gap-2">
				<div className="hidden items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground sm:flex">
					{user.name} • {user.role}
				</div>
				<button
					type="button"
					onClick={onToggleTheme}
					className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-secondary px-3 text-xs font-medium transition-colors hover:bg-accent"
				>
					{isDarkMode ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
					{isDarkMode ? "Light" : "Dark"}
				</button>
				<button
					type="button"
					onClick={handleSignOut}
					className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-secondary transition-colors hover:bg-accent"
				>
					<LogOut className="h-4 w-4" />
				</button>
			</div>
		</header>
	)
}
