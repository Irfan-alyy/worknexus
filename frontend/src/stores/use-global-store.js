import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react"

import { setAuthToken } from "@/lib/axios"

const STORAGE_KEY = "worknexus.session"

const GlobalStoreContext = createContext(null)

const defaultSession = {
	user: {
		name: "Guest User",
		email: "",
		role: "employee",
	},
	token: null,
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
	const [modalOpen, setModalOpen] = useState(false)
	const [modalTitle, setModalTitle] = useState("")
	const [modalContent, setModalContent] = useState(null)

	useEffect(() => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
	}, [session])

	useEffect(() => {
		setAuthToken(session?.token)
	}, [session?.token])

	const value = useMemo(() => {
		const authenticate = ({ user, name, email, role, token }) => {
			const resolvedUser = user ?? {
				name,
				email,
				role,
			}

			setAsideOpen(false)
			setAsideContent(null)
			setAsideTitle("")
			setModalOpen(false)
			setModalContent(null)
			setModalTitle("")
			setSession((current) => ({
				...current,
				user: {
					...current.user,
					...resolvedUser,
					name: resolvedUser?.name || resolvedUser?.email || "WorkNexus User",
				},
				token: token ?? current.token ?? null,
			}))
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

		function openModal(title, content) {
			setModalTitle(title)
			setModalContent(content)
			setModalOpen(true)
		}

		function closeModal() {
			setModalOpen(false)
			setModalContent(null)
			setModalTitle("")
		}

		function signOut() {
			setAsideOpen(false)
			setAsideContent(null)
			setAsideTitle("")
			setModalOpen(false)
			setModalContent(null)
			setModalTitle("")
			setSession(defaultSession)
		}

		return {
			session,
			user: session.user,
			role: session.user.role,
			isAuthenticated: Boolean(session.token),
			authenticate,
			signOut,
			// aside controls (transient UI)
			asideOpen,
			asideTitle,
			asideContent,
			openAside,
			closeAside,
			modalOpen,
			modalTitle,
			modalContent,
			openModal,
			closeModal,
		}
	}, [session, asideOpen, asideTitle, asideContent, modalOpen, modalTitle, modalContent])

	return createElement(GlobalStoreContext.Provider, { value }, children)
}

export function useGlobalStore() {
	const context = useContext(GlobalStoreContext)

	if (!context) {
		throw new Error("useGlobalStore must be used within GlobalStoreProvider")
	}

	return context
}
