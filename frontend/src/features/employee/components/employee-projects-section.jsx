import AdminProjects from "@/features/admin/AdminProjects"

export function EmployeeProjectsSection({ onOpenDetail }) {
	return <AdminProjects onEdit={onOpenDetail} />
}
