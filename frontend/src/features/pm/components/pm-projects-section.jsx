import { Edit, Plus, Trash2 } from "lucide-react"

import ActionMenu from "@/components/ui/action-menu"

export function PmProjectsSection({ projects, setProjects, onEdit }) {
	function handleAdd() {
		const id = projects.length + 1
		setProjects((prev) => [...prev, { id, name: `New Project ${id}`, owner: "Unassigned", status: "planning", progress: 0, summary: "Short project description." }])
	}

	function handleDelete(id) {
		const project = projects.find((item) => item.id === id)
		if (!project) return
		if (!window.confirm(`Delete project "${project.name}"? This action cannot be undone.`)) return
		setProjects((prev) => prev.filter((item) => item.id !== id))
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold">Projects</h2>
					<p className="mt-1 text-sm text-muted-foreground">Keep project work simple, visible, and easy to update.</p>
				</div>
				<button type="button" onClick={handleAdd} className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium">
					<Plus className="h-4 w-4" />
					Add
				</button>
			</div>

			<div className="grid gap-3">
				{projects.map((project) => (
					<div key={project.id} className="flex items-start justify-between rounded-lg border border-border bg-background p-4">
						<button type="button" onClick={() => onEdit(`Project: ${project.name}`, <ProjectDetail project={project} />)} className="mr-4 text-left">
							<h3 className="font-medium">{project.name}</h3>
							<p className="mt-1 text-sm text-muted-foreground">{project.summary}</p>
							<p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
								Owner: {project.owner} • {project.status} • {project.progress}%
							</p>
						</button>
						<ActionMenu
							items={[
								{ label: "Edit", icon: Edit, onClick: () => onEdit(`Edit project: ${project.name}`, <ProjectEditor project={project} />) },
								{ label: "Delete", icon: Trash2, onClick: () => handleDelete(project.id) },
							]}
						/>
					</div>
				))}
			</div>
		</div>
	)
}

function ProjectEditor({ project }) {
	return (
		<div className="space-y-3">
			<p className="text-sm">Edit fields for <strong>{project.name}</strong></p>
			<input className="w-full rounded border p-2" defaultValue={project.name} />
			<textarea className="w-full rounded border p-2" defaultValue={project.summary} />
			<div className="flex justify-end">
				<button className="rounded bg-primary px-3 py-2 text-white aside-save">Save</button>
			</div>
		</div>
	)
}

function ProjectDetail({ project }) {
	return (
		<div className="space-y-3">
			<p className="text-sm">Project details for <strong>{project.name}</strong></p>
			<div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
				<p className="text-sm font-medium">Summary</p>
				<p className="mt-2 text-sm text-muted-foreground">{project.summary}</p>
			</div>
		</div>
	)
}