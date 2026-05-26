const rows = [
	{ employee: "Aisha Khan", role: "Product Manager", salary: "$12,000", status: "Paid" },
	{ employee: "Muhammad Waqar", role: "Frontend Engineer", salary: "$9,500", status: "Pending" },
	{ employee: "Alyy Irfan", role: "Operations Lead", salary: "$8,200", status: "Paid" },
]

export function PayrollTable() {
	return (
		<table className="w-full text-left text-sm">
			<thead className="bg-muted/50 text-xs uppercase tracking-[0.2em] text-muted-foreground">
				<tr>
					<th className="px-4 py-3 font-medium">Employee</th>
					<th className="px-4 py-3 font-medium">Role</th>
					<th className="px-4 py-3 font-medium">Salary</th>
					<th className="px-4 py-3 font-medium">Status</th>
				</tr>
			</thead>
			<tbody>
				{rows.map((row) => (
					<tr key={row.employee} className="border-t border-border/60 bg-background">
						<td className="px-4 py-4 font-medium">{row.employee}</td>
						<td className="px-4 py-4 text-muted-foreground">{row.role}</td>
						<td className="px-4 py-4">{row.salary}</td>
						<td className="px-4 py-4">
							<span className={`rounded-full px-2.5 py-1 text-xs font-medium ${row.status === "Paid" ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"}`}>
								{row.status}
							</span>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}
