import { Navigate, Outlet } from "react-router-dom"

import { useGlobalStore } from "@/stores/use-global-store"

export function ProtectedRoute() {
	const { isAuthenticated } = useGlobalStore()

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	return <Outlet />
}
