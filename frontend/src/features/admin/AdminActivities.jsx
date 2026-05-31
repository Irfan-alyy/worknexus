import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useGlobalStore } from "@/stores/use-global-store"
import { useAdminActivities, useAdminActivityMetrics } from "./hooks/useAdminActivities"
import { AdminActivityMetricsCards } from "./components/admin-activity-metrics"
import { ActivityFilters } from "@/components/shared/ActivityFilters"
import { filterActivities } from "@/components/shared/activity-filter-utils"
import { ActivitySection } from "@/components/shared/ActivitySection"
import { ActivityDetailPanel } from "@/components/shared/ActivityDetailPanel"
import { Loader2 } from "lucide-react"

// Activity types available for Admin dashboard
const ADMIN_ACTIVITY_TYPES = ["employee", "client", "project", "task", "payroll", "department", "user"]

/**
 * Group activities by type and sort sections by newest activity timestamp
 * @param {Array} activities - All activities
 * @returns {Array} Array of {type, activities} objects, sorted by newest activity
 */
function groupAndSortActivities(activities) {
	// Group by exact activity type (e.g., "employee_created", "payroll_generated")
	const grouped = activities.reduce((acc, activity) => {
		const existingGroup = acc.find((g) => g.type === activity.type)
		if (existingGroup) {
			existingGroup.activities.push(activity)
		} else {
			acc.push({ type: activity.type, activities: [activity] })
		}
		return acc
	}, [])

	// Sort activities within each group by timestamp (newest first)
	grouped.forEach((group) => {
		group.activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
	})

	// Sort groups by the timestamp of their newest activity (newest first)
	grouped.sort((a, b) => {
		const aNewest = new Date(a.activities[0].timestamp)
		const bNewest = new Date(b.activities[0].timestamp)
		return bNewest - aNewest
	})

	return grouped
}

export default function AdminActivities() {
  const { openAside } = useGlobalStore()
  const [filters, setFilters] = useState({})
  const [selectedActivity, setSelectedActivity] = useState(null)

  // Fetch activities with current filters
  const { data: activities = [], isLoading, error } = useAdminActivities(filters)
  const { data: metrics, isLoading: metricsLoading } = useAdminActivityMetrics()
  const visibleActivities = filterActivities(activities, filters)

  // Group and sort activities
  const groupedActivities = groupAndSortActivities(visibleActivities)

  function openActivityDetail(activity) {
    setSelectedActivity(activity)
    openAside(`Activity detail: ${activity.type}`, <ActivityDetailPanel activity={activity} />)
  }
  const navigate = useNavigate()

  function handleMetricClick(metricType) {
    switch (metricType) {
      case "employees":
        navigate("/admin/employees")
        break
      case "clients":
        navigate("/admin/clients")
        break
      case "projects":
        navigate("/admin/projects")
        break
      case "payroll":
        navigate("/payroll")
        break
      default:
        break
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Admin Activities</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          All important admin events, from employee creation to client and project updates.
        </p>
      </div>

      {/* Metrics Section */}
      <AdminActivityMetricsCards metrics={metrics} isLoading={metricsLoading} onMetricClick={handleMetricClick} />

      {/* Filters */}
      <ActivityFilters
        availableTypes={ADMIN_ACTIVITY_TYPES}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Activities by Type */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-destructive">Failed to load activities</p>
          <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
        </div>
      ) : visibleActivities.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">No activities found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedActivities.map((group) => (
            <ActivitySection
              key={group.type}
              type={group.type}
              activities={group.activities}
              onActivityClick={openActivityDetail}
              selectedActivity={selectedActivity}
            />
          ))}
        </div>
      )}
    </div>
  )
}