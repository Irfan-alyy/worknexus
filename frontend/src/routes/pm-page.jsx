import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import { PmActivitiesSection } from "@/features/pm/components/pm-activities-section"
import { PmAnalyticsSection } from "@/features/pm/components/pm-analytics-section"
import { PmMilestonesSection } from "@/features/pm/components/pm-milestones-section"
import { PmProjectsSection } from "@/features/pm/components/pm-projects-section"
import { pmActivitySeeds, pmMilestoneSeeds, pmPageTitles, pmProjectSeeds, tabFromPath } from "@/features/pm/pm-data"
import { useGlobalStore } from "@/stores/use-global-store"

export function PmPage() {
	const location = useLocation()
	const { user, openAside } = useGlobalStore()
	const [activeTab, setActiveTab] = useState("projects")
	const [projects, setProjects] = useState(pmProjectSeeds)
	const [selectedActivity, setSelectedActivity] = useState(pmActivitySeeds[0])

	useEffect(() => {
		setActiveTab(tabFromPath(location.pathname))
	}, [location.pathname])

	function openDrawer(title, content) {
		openAside(title, content)
	}

	return (
		<div className="h-full overflow-y-auto p-6">
			<div className="mb-6">
				<h1 className="text-2xl font-semibold">{pmPageTitles[activeTab] || "Project Manager"}</h1>
				<p className="mt-1 text-sm text-muted-foreground">Signed in as {user?.name || "Guest"}.</p>
			</div>

			<div className="space-y-6">
				{activeTab === "projects" && <PmProjectsSection projects={projects} setProjects={setProjects} onEdit={openDrawer} />}
				{activeTab === "activities" && <PmActivitiesSection items={pmActivitySeeds} selectedActivity={selectedActivity} setSelectedActivity={setSelectedActivity} onEdit={openDrawer} />}
				{activeTab === "analytics" && <PmAnalyticsSection />}
				{activeTab === "milestones" && <PmMilestonesSection items={pmMilestoneSeeds} onEdit={openDrawer} />}
			</div>
		</div>
	)
}

export default PmPage
