import { useState } from "react"
import { useGlobalStore } from "@/stores/use-global-store"
import { useHRActivities } from "../hooks/useHRActivities"
import { ActivityFilters } from "@/components/shared/ActivityFilters"
import { ActivityCard } from "@/components/shared/ActivityCard"
import { ActivityDetailPanel } from "@/components/shared/ActivityDetailPanel"
import { Loader2 } from "lucide-react"

// Activity types available for HR dashboard
const HR_ACTIVITY_TYPES = ["employee", "payroll", "department", "project", "task", "timelog"]

export function HRActivities() {
	const { openAside } = useGlobalStore()
	const [filters, setFilters] = useState({})
	const [selectedActivity, setSelectedActivity] = useState(null)

	// Fetch activities with current filters
	const { data: activities = [], isLoading, error } = useHRActivities(filters)

	function openActivityDetail(activity) {
		setSelectedActivity(activity)
		openAside(`Activity detail: ${activity.type}`, <ActivityDetailPanel activity={activity} />)
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h2 className="text-2xl font-semibold">HR Activities</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Track all HR events including employees, payroll, departments, projects, and team activities.
				</p>
			</div>

			{/* Filters */}
			<ActivityFilters
				availableTypes={HR_ACTIVITY_TYPES}
				filters={filters}
				onFiltersChange={setFilters}
			/>

			{/* Activities Grid */}
			{isLoading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			) : error ? (
				<div className="rounded-2xl border border-border bg-card p-6 text-center">
					<p className="text-sm text-destructive">Failed to load activities</p>
					<p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
				</div>
			) : activities.length === 0 ? (
				<div className="rounded-2xl border border-border bg-card p-6 text-center">
					<p className="text-sm text-muted-foreground">No activities found</p>
					<p className="mt-1 text-xs text-muted-foreground">Try adjusting your filters</p>
				</div>
			) : (
				<div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
					{activities.map((activity) => (
						<ActivityCard
							key={`${activity.type}_${activity.timestamp}`}
							activity={activity}
							onClick={() => openActivityDetail(activity)}
							isSelected={selectedActivity?.timestamp === activity.timestamp}
						/>
					))}
				</div>
			)}
		</div>
	)
}

export default HRActivities
