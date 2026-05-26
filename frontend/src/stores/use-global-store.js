import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react"

const STORAGE_KEY = "worknexus.session"

const GlobalStoreContext = createContext(null)

const defaultSession = {
	user: {
		name: "Guest User",
		email: "",
		role: "employee",
	},
}

function loadSession() {
	if (typeof window === "undefined") {
		return defaultSession
	}

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		return raw ? { ...defaultSession, ...JSON.parse(raw) } : defaultSession
	} catch {
		return defaultSession
	}
}

export function GlobalStoreProvider({ children }) {
	const [session, setSession] = useState(loadSession)
	const [asideOpen, setAsideOpen] = useState(false)
	const [asideTitle, setAsideTitle] = useState("")
	const [asideContent, setAsideContent] = useState(null)

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
	}, [session])

	const value = useMemo(() => {
		const authenticate = ({ name, email, role }) => {
			setAsideOpen(false)
			setAsideContent(null)
			setAsideTitle("")
			setSession({
				user: {
					name,
					email,
					role,
				},
			})
		}

		function openAside(title, content) {
			setAsideTitle(title)
			setAsideContent(content)
			setAsideOpen(true)
		}

		function closeAside() {
			setAsideOpen(false)
			setAsideContent(null)
			setAsideTitle("")
		}

		function signOut() {
			setAsideOpen(false)
			setAsideContent(null)
			setAsideTitle("")
			setSession(defaultSession)
		}

		return {
			session,
			user: session.user,
			role: session.user.role,
			authenticate,
			signOut,
			// aside controls (transient UI)
			asideOpen,
			asideTitle,
			asideContent,
			openAside,
			closeAside,
		}
	}, [session, asideOpen, asideTitle, asideContent])

	return createElement(GlobalStoreContext.Provider, { value }, children)
}

export function useGlobalStore() {
	const context = useContext(GlobalStoreContext)

	if (!context) {
		throw new Error("useGlobalStore must be used within GlobalStoreProvider")
	}

	return context
}
