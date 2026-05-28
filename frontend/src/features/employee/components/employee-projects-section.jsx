import AdminProjects from "@/features/admin/AdminProjects"

export function EmployeeProjectsSection({ onOpenDetail, onEdit }) {
	return <AdminProjects onEdit={onEdit} onOpenDetail={onOpenDetail} />
}
