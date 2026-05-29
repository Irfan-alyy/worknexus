const steps = [
	{ title: "Profile setup", detail: "Collect personal details and role assignment." },
	{ title: "Access provisioning", detail: "Create the workspace, payroll, and chat access." },
	{ title: "First-week tasks", detail: "Assign learning items and manager check-ins." },
]

export function OnboardingWizard() {
	return (
		<section className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-6">
			<p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Wizard</p>
			<h3 className="mt-1 text-lg font-semibold">Onboarding flow</h3>

			<div className="mt-5 space-y-4">
				{steps.map((step, index) => (
					<div key={step.title} className="flex gap-4 rounded-2xl border border-border bg-background p-4">
						<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
							{index + 1}
						</div>
						<div>
							<h4 className="font-medium">{step.title}</h4>
							<p className="mt-1 text-sm leading-6 text-muted-foreground">{step.detail}</p>
						</div>
					</div>
				))}
			</div>
		</section>
	)
}
