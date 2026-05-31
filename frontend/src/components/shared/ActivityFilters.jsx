import { useState } from "react"
import { ChevronDown } from "lucide-react"

const ACTIVITY_TYPES = {
	employee: "Employees",
	payroll: "Payroll",
	department: "Departments",
	project: "Projects",
	task: "Tasks",
	timelog: "Time Logs",
	client: "Clients",
	user: "Users",
}

const DATE_RANGES = {
	today: "Today",
	week: "This Week",
	month: "This Month",
	all: "All Time",
}

const STATUSES = {
	all: "All",
	new: "Today/Recent",
	archived: "Archived",
}

/**
 * ActivityFilters - Filter activities by type, date range, and status
 * @param {Object} props
 * @param {Array} props.availableTypes - Array of available activity types (e.g., ['employee', 'payroll', 'project'])
 * @param {Object} props.filters - Current filter state {type, dateRange, status}
 * @param {Function} props.onFiltersChange - Callback when filters change
 */
export function ActivityFilters({ availableTypes = [], filters = {}, onFiltersChange = () => {} }) {
	const [expanded, setExpanded] = useState(false)

	const handleTypeChange = (type) => {
		onFiltersChange({ ...filters, type: filters.type === type ? "" : type })
	}

	const handleDateRangeChange = (range) => {
		onFiltersChange({ ...filters, dateRange: filters.dateRange === range ? "" : range })
	}

	const handleStatusChange = (status) => {
		onFiltersChange({ ...filters, status: filters.status === status ? "" : status })
	}

	const getActiveFilterCount = () => {
		let count = 0
		if (filters.type) count++
		if (filters.dateRange) count++
		if (filters.status && filters.status !== "all") count++
		return count
	}

	const activeCount = getActiveFilterCount()

	return (
		<div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
			<button
				type="button"
				onClick={() => setExpanded(!expanded)}
				className="flex w-full items-center justify-between"
			>
				<div className="flex items-center gap-2">
					<h3 className="text-sm font-semibold">Filters</h3>
					{activeCount > 0 && (
						<span className="rounded-full bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
							{activeCount}
						</span>
					)}
				</div>
				<ChevronDown
					className={`h-5 w-5 transition-transform ${expanded ? "rotate-180" : ""}`}
				/>
			</button>

			{expanded && (
				<div className="mt-4 space-y-4">
					{/* Activity Type Filter */}
					{availableTypes.length > 0 && (
						<div>
							<p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Activity Type
							</p>
							<div className="flex flex-wrap gap-2">
								{availableTypes.map((type) => (
									<button
										key={type}
										type="button"
										onClick={() => handleTypeChange(type)}
										className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
											filters.type === type
												? "bg-primary text-primary-foreground"
												: "border border-border bg-background hover:bg-secondary"
										}`}
									>
										{ACTIVITY_TYPES[type] || type}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Date Range Filter */}
					<div>
						<p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Date Range
						</p>
						<div className="flex flex-wrap gap-2">
							{Object.entries(DATE_RANGES).map(([key, label]) => (
								<button
									key={key}
									type="button"
									onClick={() => handleDateRangeChange(key)}
									className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
										filters.dateRange === key
											? "bg-primary text-primary-foreground"
											: "border border-border bg-background hover:bg-secondary"
									}`}
								>
									{label}
								</button>
							))}
						</div>
					</div>

					{/* Status Filter */}
					<div>
						<p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Status
						</p>
						<div className="flex flex-wrap gap-2">
							{Object.entries(STATUSES).map(([key, label]) => (
								<button
									key={key}
									type="button"
									onClick={() => handleStatusChange(key)}
									className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
										filters.status === key
											? "bg-primary text-primary-foreground"
											: "border border-border bg-background hover:bg-secondary"
									}`}
								>
									{label}
								</button>
							))}
						</div>
					</div>

					{/* Clear Filters Button */}
					{activeCount > 0 && (
						<button
							type="button"
							onClick={() => onFiltersChange({})}
							className="mt-2 text-xs font-medium text-muted-foreground hover:text-foreground"
						>
							Clear all filters
						</button>
					)}
				</div>
			)}
		</div>
	)
}

export default ActivityFilters
