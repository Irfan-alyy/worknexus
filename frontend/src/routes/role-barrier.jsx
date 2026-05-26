import { Navigate } from "react-router-dom"

import { useGlobalStore } from "@/stores/use-global-store"

export function RoleBarrier({ allowedRoles, fallback = "/dashboard", children }) {
	const { role } = useGlobalStore()

	if (!allowedRoles.includes(role)) {
		return <Navigate to={fallback} replace />
	}

	return children
}
