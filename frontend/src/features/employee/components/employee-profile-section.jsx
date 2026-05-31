import { useEffect, useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { queryKeys } from "@/config/query-keys"
import { useAuthMeQuery } from "@/features/auth/hooks/use-auth-query"
import { usePayrollsQuery } from "@/features/payroll/hooks/use-payroll-query"
import { hrApi } from "@/features/hr-management/services/hr-api"
import { usersApi } from "@/features/users/services/users-api"

export function EmployeeProfileSection({ user, role, onSaveUser }) {
	const queryClient = useQueryClient()
	const [isEditing, setIsEditing] = useState(false)
	const [accountForm, setAccountForm] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		firstName: "",
		lastName: "",
	})
	const [accountError, setAccountError] = useState("")
	const [accountMessage, setAccountMessage] = useState("")
	const currentUserId =  user?.id ?? null

	const userQuery = useQuery({
		queryKey: queryKeys.users.detail(currentUserId ?? "me"),
		queryFn: () => usersApi.getUser(currentUserId),
		enabled: Boolean(currentUserId),
	})
	const profileUser = userQuery.data?.data ?? user ?? null
	const employeeId = profileUser?.employee?.id ?? null

	const employeeQuery = useQuery({
		queryKey: queryKeys.hr.employee(employeeId ?? "profile"),
		queryFn: () => hrApi.getEmployee(employeeId),
		enabled: Boolean(employeeId),
	})

	const employee = employeeQuery.data?.data ?? null
	const payrollsQuery = usePayrollsQuery({ employeeId }, { enabled: Boolean(employeeId) })
	const payrolls = useMemo(() => {
		const entries = Array.isArray(payrollsQuery.data?.data) ? [...payrollsQuery.data.data] : []
		return entries.sort((left, right) => {
			const leftTime = new Date(left?.payPeriodEnd || left?.createdAt || 0).getTime()
			const rightTime = new Date(right?.payPeriodEnd || right?.createdAt || 0).getTime()
			return rightTime - leftTime
		})
	}, [payrollsQuery.data?.data])

	const resolvedEmployee = employee || (profileUser?.employee ? { ...profileUser.employee, user: profileUser } : null)

	const displayName = useMemo(() => {
		const firstName = resolvedEmployee?.firstName?.trim()
		const lastName = resolvedEmployee?.lastName?.trim()

		if (firstName || lastName) {
			return [firstName, lastName].filter(Boolean).join(" ")
		}

		return profileUser?.name || profileUser?.email || "Guest User"
	}, [profileUser?.email, profileUser?.name, resolvedEmployee?.firstName, resolvedEmployee?.lastName])

	const initials = useMemo(() => {
		const chunks = displayName.trim().split(/\s+/).filter(Boolean)
		if (chunks.length === 0) return "GU"
		if (chunks.length === 1) return chunks[0].slice(0, 2).toUpperCase()
		return `${chunks[0][0]}${chunks[1][0]}`.toUpperCase()
	}, [displayName])

	const paymentSummary = useMemo(() => {
		const totalAmount = payrolls.reduce((sum, item) => sum + Number(item?.amount || 0), 0)
		const processedCount = payrolls.filter((item) => item?.paymentStatus === "processed" || item?.paymentStatus === "paid").length

		return {
			count: payrolls.length,
			totalAmount,
			processedCount,
		}
	}, [payrolls])

	function getPrefilledAccountForm() {
		return {
			email: profileUser?.email || "",
			password: "",
			confirmPassword: "",
			firstName: resolvedEmployee?.firstName || "",
			lastName: resolvedEmployee?.lastName || "",
		}
	}

	function openEditForm() {
		setAccountError("")
		setAccountMessage("")
		setAccountForm(getPrefilledAccountForm())
		setIsEditing(true)
	}

	useEffect(() => {
		if (!isEditing) return

		setAccountForm((current) => ({
			...current,
			email: current.email || profileUser?.email || "",
			firstName: current.firstName || resolvedEmployee?.firstName || "",
			lastName: current.lastName || resolvedEmployee?.lastName || "",
		}))
	}, [isEditing, profileUser?.email, resolvedEmployee?.firstName, resolvedEmployee?.lastName])

	const updateUserMutation = useMutation({
		mutationFn: (payload) => usersApi.updateUser(currentUserId, payload),
		onSuccess: async (response) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() }),
				queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(currentUserId) }),
			])

			const updatedUser = response?.data
			const nextEmail = updatedUser?.email || accountForm.email.trim()

			onSaveUser?.({
				user: {
					id: updatedUser?.id ?? currentUserId,
					email: nextEmail,
					role: updatedUser?.role ?? role,
					name: displayName,
				},
			})

			setAccountForm((current) => ({
				...current,
				email: nextEmail,
				password: "",
				confirmPassword: "",
			}))
			setAccountMessage("Account details updated successfully.")
			setIsEditing(false)
		},
		onError: (error) => {
			setAccountError(error?.response?.data?.message || error?.message || "Failed to update account details.")
		},
	})

	const hrUpdateMutation = useMutation({
		mutationFn: ({ id, payload }) => hrApi.updateEmployee(id, payload),
		onSuccess: async (response) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: queryKeys.hr.employee(employeeId) }),
				queryClient.invalidateQueries({ queryKey: queryKeys.hr.employees() }),
			])
			setAccountMessage("Employment details updated.")
		},
		onError: (error) => {
			setAccountError(error?.response?.data?.message || error?.message || "Failed to update employment details.")
		},
	})

	const isLoadingProfile = userQuery.isLoading || employeeQuery.isLoading || payrollsQuery.isLoading

	function updateField(field, value) {
		setAccountForm((prev) => ({ ...prev, [field]: value }))
	}

	async function handleSave(event) {
		event.preventDefault()
		setAccountError("")
		setAccountMessage("")

		if (!currentUserId) {
			setAccountError("Unable to load the current user profile.")
			return
		}

		if (accountForm.password && accountForm.password !== accountForm.confirmPassword) {
			setAccountError("Passwords do not match.")
			return
		}

		const userPayload = {}
		const employeePayload = {}
		const nextEmail = accountForm.email.trim()

		if (nextEmail && nextEmail !== profileUser?.email) userPayload.email = nextEmail
		if (accountForm.password) userPayload.password = accountForm.password

		// Employee fields
		if (accountForm.firstName && accountForm.firstName !== resolvedEmployee?.firstName) employeePayload.firstName = accountForm.firstName
		if (accountForm.lastName && accountForm.lastName !== resolvedEmployee?.lastName) employeePayload.lastName = accountForm.lastName

		if (!Object.keys(userPayload).length && !Object.keys(employeePayload).length) {
			setAccountError("Update at least one field before saving.")
			return
		}

		// Perform updates. User update first.
		try {
			if (Object.keys(userPayload).length) await updateUserMutation.mutateAsync(userPayload)
		} catch (e) {
			// user mutation handles errors via onError
		}

		// Attempt employee update only if we have an employee id
		if (Object.keys(employeePayload).length) {
			if (!employeeId) {
				setAccountError("Unable to update employee fields: employee record missing.")
				return
			}

			// Only admin/hr allowed by backend routes — attempt and show helpful message on 403
			try {
				await hrUpdateMutation.mutateAsync({ id: employeeId, payload: employeePayload })
			} catch (err) {
				if (err?.response?.status === 403 || err?.response?.status === 401) {
					setAccountError("Updating employee fields requires admin/HR privileges.")
				}
			}
		}
	}

	const payrollStatusStyles = {
		pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
		processed: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
		paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
	}

	function formatCurrency(value) {
		const amount = Number(value || 0)
		if (Number.isNaN(amount)) return "$0.00"

		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount)
	}

	function formatDate(value) {
		if (!value) return "N/A"
		const date = new Date(value)
		if (Number.isNaN(date.getTime())) return "N/A"
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
		}).format(date)
	}

	function formatDateTime(value) {
		if (!value) return "N/A"
		const date = new Date(value)
		if (Number.isNaN(date.getTime())) return "N/A"
		return new Intl.DateTimeFormat("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit",
		}).format(date)
	}

	function formatPayPeriod(start, end) {
		if (!start && !end) return "N/A"
		return `${formatDate(start)} - ${formatDate(end)}`
	}

	function getPaymentModelLabel(paymentModel) {
		const labels = {
			fixed: "Fixed salary",
			hourly: "Hourly",
			revenue_share: "Revenue share",
		}

		return labels[paymentModel] || paymentModel || "N/A"
	}

	function getPaymentStatusLabel(status) {
		return String(status || "pending")
			.split("_")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(" ")
	}

	if (isLoadingProfile && !profileUser && !resolvedEmployee) {
		return <div className="rounded-3xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading profile data...</div>
	}

	return (
		<div className="space-y-6">
			<section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-center gap-4">
						<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground shadow-sm">
							{initials}
						</div>
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">My profile</p>
							<h2 className="mt-1 text-xl font-semibold">{displayName}</h2>
							<p className="text-sm text-muted-foreground">
								{role ? role.toUpperCase() : "EMPLOYEE"} • {profileUser?.email || "No email set"}
							</p>
						</div>
					</div>

					{role!=="hr" && (
						<button
							type="button"
							onClick={openEditForm}
							className="inline-flex items-center justify-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
						>
							Edit details
					</button>) }
				</div>

				<div className="mt-6 grid gap-6 lg:grid-cols-2">
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Account details</p>
						<div className="mt-3 grid gap-3 sm:grid-cols-2">
							<InfoPill label="Email" value={profileUser?.email || "Not set"} />
							<InfoPill label="Employee ID" value={resolvedEmployee?.id ? `#${resolvedEmployee.id}` : "N/A"} />
							<InfoPill label="Joined" value={formatDate(resolvedEmployee?.createdAt || profileUser?.createdAt)} />
							<InfoPill label="Updated" value={formatDateTime(profileUser?.updatedAt || resolvedEmployee?.updatedAt)} />
						</div>
					</div>

					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Employment details</p>
						<div className="mt-3 grid gap-3 sm:grid-cols-2">
							<InfoPill label="Full name" value={displayName} />
							<InfoPill label="Department" value={resolvedEmployee?.department?.name || "Not assigned"} />
							<InfoPill label="Payment model" value={getPaymentModelLabel(resolvedEmployee?.paymentModel)} />
							{resolvedEmployee?.baseSalary != null ? <InfoPill label="Base salary" value={formatCurrency(resolvedEmployee?.baseSalary)} /> : null}
							{resolvedEmployee?.hourlyRate != null ? <InfoPill label="Hourly rate" value={formatCurrency(resolvedEmployee?.hourlyRate)} /> : null}
							{resolvedEmployee?.revenueSharePercent != null ? <InfoPill label="Revenue share" value={`${Number(resolvedEmployee.revenueSharePercent)}%`} /> : null}
						</div>
					</div>
				</div>
			</section>

			{isEditing ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
					<form onSubmit={handleSave} className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Edit profile</p>
								<h3 className="mt-1 text-lg font-semibold">Update your account</h3>
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
							<FormField label="First name" value={accountForm.firstName} onChange={(value) => updateField("firstName", value)} />
							<FormField label="Last name" value={accountForm.lastName} onChange={(value) => updateField("lastName", value)} />
							<FormField label="Email" type="email" value={accountForm.email} onChange={(value) => updateField("email", value)} />
							<FormField label="New password" type="password" value={accountForm.password} onChange={(value) => updateField("password", value)} placeholder="Leave blank to keep current password" />
							<FormField label="Confirm password" type="password" value={accountForm.confirmPassword} onChange={(value) => updateField("confirmPassword", value)} placeholder="Repeat the new password" />
						</div>

						{accountError ? <p className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">{accountError}</p> : null}
						{accountMessage ? <p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">{accountMessage}</p> : null}

						<div className="mt-6 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setIsEditing(false)}
								className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
							>
								Cancel
							</button>
							<button type="submit" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
								{updateUserMutation.isPending ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Saving changes
									</>
								) : (
									"Save changes"
								)}
							</button>
						</div>
					</form>
				</div>
			) : null}


			<section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
				<div className="flex items-center justify-between gap-3">
					<div>
						<p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Payments</p>
						<h3 className="mt-1 text-lg font-semibold">Payment history</h3>
					</div>
					<span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">{paymentSummary.count} entries</span>
				</div>

				<div className="mt-5 grid gap-3 md:grid-cols-3">
					<InfoPill label="Records" value={String(paymentSummary.count)} />
					<InfoPill label="Processed / Paid" value={String(paymentSummary.processedCount)} />
					<InfoPill label="Total amount" value={formatCurrency(paymentSummary.totalAmount)} />
				</div>

				<div className="mt-4 overflow-x-auto rounded-2xl border border-border">
					<table className="min-w-full divide-y divide-border text-sm">
						<thead className="bg-secondary/50">
							<tr>
								<TableHeading text="Pay period" />
								<TableHeading text="Amount" />
								<TableHeading text="Status" />
								<TableHeading text="Processed on" />
								<TableHeading text="Created" />
							</tr>
						</thead>
						<tbody className="divide-y divide-border bg-background">
							{payrollsQuery.isLoading ? (
								<tr>
									<td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={5}>
										Loading payroll records...
									</td>
								</tr>
							) : payrolls.length ? (
								payrolls.map((payment) => (
									<tr key={payment.id}>
										<td className="px-4 py-3 font-medium">{formatPayPeriod(payment.payPeriodStart, payment.payPeriodEnd)}</td>
										<td className="px-4 py-3 text-muted-foreground">{formatCurrency(payment.amount)}</td>
										<td className="px-4 py-3">
											<span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${payrollStatusStyles[payment.paymentStatus] || "bg-secondary text-foreground"}`}>
												{getPaymentStatusLabel(payment.paymentStatus)}
											</span>
										</td>
										<td className="px-4 py-3 text-muted-foreground">{formatDateTime(payment.processedAt)}</td>
										<td className="px-4 py-3 text-muted-foreground">{formatDateTime(payment.createdAt)}</td>
									</tr>
								))
							) : (
								<tr>
									<td className="px-4 py-6 text-center text-sm text-muted-foreground" colSpan={5}>
										No payroll records found for this employee.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</section>
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


function FormField({ label, type = "text", value, onChange, required = false, placeholder }) {
	return (
		<label className="space-y-1 text-sm">
			<span className="text-muted-foreground">{label}</span>
			<input
				type={type}
				value={value}
				required={required}
				placeholder={placeholder}
				onChange={(event) => onChange(event.target.value)}
				className="w-full rounded-xl border border-border bg-background px-3 py-2 outline-none transition-colors focus:border-primary"
			/>
		</label>
	)
}
