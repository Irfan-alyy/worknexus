import { useLocation } from "react-router-dom"

import { EmployeeActivitiesSection } from "@/features/employee/components/employee-activities-section"
import { EmployeeProfileSection } from "@/features/employee/components/employee-profile-section"
import { EmployeeProjectsSection } from "@/features/employee/components/employee-projects-section"
import { employeePageTitles, employeeTabFromPath } from "@/features/employee/employee-data"
import { useGlobalStore } from "@/stores/use-global-store"

export function EmployeePage() {
	const location = useLocation()
	const { user, role, authenticate, openAside, openModal } = useGlobalStore()
	const activeTab = employeeTabFromPath(location.pathname)

	function openDrawer(title, content) {
		openAside(title, content)
	}

	function openEditor(title, content) {
		openModal(title, content)
	}

	return (
		<div className="h-full overflow-y-auto p-4 sm:p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-semibold">{employeePageTitles[activeTab] || "Employee"}</h1>
				<p className="mt-1 text-sm text-muted-foreground">Signed in as {user?.name || "Guest"}.</p>
			</div>

			<div className="space-y-6">
				{activeTab === "projects" ? <EmployeeProjectsSection onOpenDetail={openDrawer} onEdit={openEditor} /> : null}
				{activeTab === "activities" ? <EmployeeActivitiesSection onOpenDetail={openDrawer} /> : null}
				{activeTab === "profile" ? <EmployeeProfileSection user={user} role={role} onSaveUser={authenticate} /> : null}
			</div>
		</div>
	)
}

export default EmployeePage
