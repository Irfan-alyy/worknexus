import { useMemo, useState } from "react"

import { employeePaymentHistory, employeeProfileSeed } from "@/features/employee/employee-data"

export function EmployeeProfileSection({ user, role, onSaveUser }) {
	const [isEditing, setIsEditing] = useState(false)
	const [profile, setProfile] = useState(() => ({
		name: user?.name || "Guest User",
		email: user?.email || "",
		...employeeProfileSeed,
	}))

	const initials = useMemo(() => {
		const chunks = profile.name.trim().split(/\s+/).filter(Boolean)
		if (chunks.length === 0) return "GU"
		if (chunks.length === 1) return chunks[0].slice(0, 2).toUpperCase()
		return `${chunks[0][0]}${chunks[1][0]}`.toUpperCase()
	}, [profile.name])

	function updateField(field, value) {
		setProfile((prev) => ({ ...prev, [field]: value }))
	}

	function handleSave(event) {
		event.preventDefault()
		onSaveUser({ name: profile.name, email: profile.email, role })
		setIsEditing(false)
	}

	return (
		<div className="space-y-6">
			<section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-4">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-sm">
							{initials}
						</div>
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">My profile</p>
							<h2 className="mt-1 text-xl font-semibold">{profile.name}</h2>
							<p className="text-sm text-muted-foreground">{profile.position} • {profile.department}</p>
						</div>
					</div>
					<button
						type="button"
						onClick={() => setIsEditing(true)}
						className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
					>
						Edit details
					</button>
				</div>

				<div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
					<InfoPill label="Email" value={profile.email || "Not set"} />
					<InfoPill label="Phone" value={profile.phone} />
					<InfoPill label="Department" value={profile.department} />
					<InfoPill label="Position" value={profile.position} />
					<InfoPill label="Location" value={profile.location} />
					<InfoPill label="Joined" value={profile.joinedAt} />
				</div>
			</section>

			<section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
				<div className="flex items-center justify-between gap-3">
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Payments</p>
						<h3 className="mt-1 text-lg font-semibold">Payment history</h3>
					</div>
					<span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">{employeePaymentHistory.length} entries</span>
				</div>

				<div className="mt-4 overflow-x-auto rounded-2xl border border-border">
					<table className="min-w-full divide-y divide-border text-sm">
						<thead className="bg-secondary/50">
							<tr>
								<TableHeading text="Month" />
								<TableHeading text="Amount" />
								<TableHeading text="Status" />
								<TableHeading text="Paid on" />
							</tr>
						</thead>
						<tbody className="divide-y divide-border bg-background">
							{employeePaymentHistory.map((payment) => (
								<tr key={payment.id}>
									<td className="px-4 py-3 font-medium">{payment.month}</td>
									<td className="px-4 py-3 text-muted-foreground">{payment.amount}</td>
									<td className="px-4 py-3">
										<span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
											{payment.status}
										</span>
									</td>
									<td className="px-4 py-3 text-muted-foreground">{payment.date}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			{isEditing ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
					<form onSubmit={handleSave} className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Edit profile</p>
								<h3 className="mt-1 text-lg font-semibold">Update your details</h3>
							</div>
							<button
								type="button"
								onClick={() => setIsEditing(false)}
								className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary"
							>
								Close
							</button>
						</div>

						<div className="mt-5 grid gap-3 sm:grid-cols-2">
							<FormField label="Full name" value={profile.name} onChange={(value) => updateField("name", value)} required />
							<FormField label="Email" type="email" value={profile.email} onChange={(value) => updateField("email", value)} required />
							<FormField label="Phone" value={profile.phone} onChange={(value) => updateField("phone", value)} />
							<FormField label="Department" value={profile.department} onChange={(value) => updateField("department", value)} />
							<FormField label="Position" value={profile.position} onChange={(value) => updateField("position", value)} />
							<FormField label="Location" value={profile.location} onChange={(value) => updateField("location", value)} />
						</div>

						<div className="mt-6 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setIsEditing(false)}
								className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
							>
								Cancel
							</button>
							<button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
								Save changes
							</button>
						</div>
					</form>
				</div>
			) : null}
		</div>
	)
}

function InfoPill({ label, value }) {
	return (
		<div className="rounded-2xl border border-border bg-background p-3">
			<p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
			<p className="mt-1 text-sm font-medium">{value}</p>
		</div>
	)
}

function TableHeading({ text }) {
	return <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{text}</th>
}

function FormField({ label, type = "text", value, onChange, required = false }) {
	return (
		<label className="space-y-1 text-sm">
			<span className="text-muted-foreground">{label}</span>
			<input
				type={type}
				value={value}
				required={required}
				onChange={(event) => onChange(event.target.value)}
				className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none transition-colors focus:border-primary"
			/>
		</label>
	)
}
