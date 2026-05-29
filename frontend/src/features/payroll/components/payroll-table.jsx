function formatCurrency(value) {
	const amount = Number(value ?? 0)

	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(Number.isNaN(amount) ? 0 : amount)
}

function formatDateTime(value) {
	if (!value) return "—"

	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return "—"

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date)
}

function formatPaymentStatus(status) {
	if (!status) return "Unknown"
	return status.charAt(0).toUpperCase() + status.slice(1)
}

const paymentStatusStyles = {
	pending: "bg-amber-500/10 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
	processed: "bg-sky-500/10 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
	paid: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
}

export function PayrollTable({
	rows = [],
	loading = false,
	errorMessage = "",
	emptyMessage = "No payroll records match the current filters.",
	canManageStatus = false,
	onStatusChange,
	updatingPayrollId = null,
}) {
	return (
		<table className="w-full text-left text-sm">
			<thead className="bg-muted/50 text-xs uppercase tracking-[0.2em] text-muted-foreground">
				<tr>
					<th className="px-4 py-3 font-medium">Employee</th>
					<th className="px-4 py-3 font-medium">Model</th>
					<th className="px-4 py-3 font-medium">Pay period</th>
					<th className="px-4 py-3 font-medium">Amount</th>
					<th className="px-4 py-3 font-medium">Status</th>
					<th className="px-4 py-3 font-medium">Processed</th>
				</tr>
			</thead>
			<tbody>
				{errorMessage ? (
					<tr>
						<td className="px-4 py-8 text-center text-sm text-destructive" colSpan={6}>
							{errorMessage}
						</td>
					</tr>
				) : loading ? (
					<tr>
						<td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={6}>
							Loading payroll records...
						</td>
					</tr>
				) : rows.length ? (
					rows.map((row) => {
						const isUpdating = updatingPayrollId === row.id

						return (
							<tr key={row.id} className="border-t border-border/60 bg-background align-top">
								<td className="px-4 py-4">
									<div className="font-medium">{row.employeeName}</div>
									<div className="mt-1 text-xs text-muted-foreground">
										#{row.employeeId}
										{row.employeeEmail ? ` • ${row.employeeEmail}` : ""}
									</div>
								</td>
								<td className="px-4 py-4 text-muted-foreground">{row.paymentModelLabel}</td>
								<td className="px-4 py-4 text-muted-foreground">{row.payPeriodLabel}</td>
								<td className="px-4 py-4 font-medium">{formatCurrency(row.amount)}</td>
								<td className="px-4 py-4">
									<div className="flex flex-col gap-2">
										<span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium ${paymentStatusStyles[row.paymentStatus] || "bg-secondary text-foreground"}`}>
											{formatPaymentStatus(row.paymentStatus)}
										</span>
										{canManageStatus ? (
											<select
												value={row.paymentStatus}
												disabled={isUpdating}
												onChange={(event) => onStatusChange?.(row.id, event.target.value)}
												className="min-w-32 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground outline-none transition-colors focus:border-ring disabled:cursor-not-allowed disabled:opacity-60"
											>
												<option value="pending">Pending</option>
												<option value="processed">Processed</option>
												<option value="paid">Paid</option>
											</select>
										) : null}
									</div>
								</td>
								<td className="px-4 py-4 text-muted-foreground">{formatDateTime(row.processedAt)}</td>
							</tr>
						)
					})
				) : (
					<tr>
						<td className="px-4 py-8 text-center text-sm text-muted-foreground" colSpan={6}>
							{emptyMessage}
						</td>
					</tr>
				)}
			</tbody>
		</table>
	)
}
