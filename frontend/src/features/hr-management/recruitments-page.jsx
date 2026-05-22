import { useState } from "react"
import { BriefcaseBusiness, Plus, X } from "lucide-react"
import { useGlobalStore } from "@/stores/use-global-store"

const initialRecruitments = [
  {
    id: 1,
    title: "Frontend Engineer",
    department: "Product Delivery",
    openings: 2,
    deadline: "2026-06-15",
    postedOn: "2026-05-10",
    applicants: 14,
    status: "Open",
    recruiter: {
      name: "Aisha Khan",
      email: "aisha.khan@worknexus.com",
      phone: "+92 300 1001001",
    },
    candidates: [
      {
        id: 1,
        name: "Ali Raza",
        email: "ali.raza@example.com",
        phone: "+92 321 4455667",
        experience: "4 years",
        stage: "Technical interview",
      },
      {
        id: 2,
        name: "Sara Noor",
        email: "sara.noor@example.com",
        phone: "+92 333 7788990",
        experience: "3 years",
        stage: "HR screening",
      },
    ],
  },
  {
    id: 2,
    title: "HR Executive",
    department: "People Operations",
    openings: 1,
    deadline: "2026-06-03",
    postedOn: "2026-05-08",
    applicants: 9,
    status: "Screening",
    recruiter: {
      name: "Rahim Iqbal",
      email: "rahim.iqbal@worknexus.com",
      phone: "+92 300 2002002",
    },
    candidates: [
      {
        id: 3,
        name: "Hiba Zahra",
        email: "hiba.zahra@example.com",
        phone: "+92 345 5566778",
        experience: "2 years",
        stage: "Offer review",
      },
      {
        id: 4,
        name: "Umar Javed",
        email: "umar.javed@example.com",
        phone: "+92 311 6677889",
        experience: "1 year",
        stage: "Shortlisted",
      },
    ],
  },
]

export function RecruitmentsPage() {
  const { openAside } = useGlobalStore()
  const [recruitments, setRecruitments] = useState(initialRecruitments)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: "",
    department: "People Operations",
    openings: 1,
    deadline: "",
  })

  function handleSubmit(event) {
    event.preventDefault()

    if (!form.title.trim() || !form.deadline) {
      return
    }

    const newRecruitment = {
      id: recruitments.length + 1,
      title: form.title.trim(),
      department: form.department,
      openings: Number(form.openings),
      deadline: form.deadline,
      postedOn: new Date().toISOString().slice(0, 10),
      applicants: 0,
      status: "Open",
      recruiter: {
        name: "HR Manager",
        email: "hr.manager@worknexus.com",
        phone: "+92 300 9009009",
      },
      candidates: [],
    }

    setRecruitments((current) => [newRecruitment, ...current])
    setForm({ title: "", department: form.department, openings: 1, deadline: "" })
    setIsCreateModalOpen(false)
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function openRecruitmentDetail(job) {
    openAside(`Recruitment detail: ${job.title}`, <RecruitmentDetailPanel recruitment={job} />)
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Recruitments</p>
            <h2 className="mt-1 text-2xl font-semibold">Job openings and hiring pipeline</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Click a recruitment to open its details in the aside panel with assigned recruiter and applicants.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Create a job
          </button>
        </div>
      </div>

      <section className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Recruitments</p>
        <h3 className="mt-1 text-lg font-semibold">Current hiring list</h3>

        <div className="mt-5 space-y-3">
          {recruitments.map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() => openRecruitmentDetail(job)}
              className="flex w-full flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-3 text-left transition-colors hover:bg-secondary/30"
            >
              <div>
                <p className="text-sm font-semibold">{job.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {job.department} • {job.openings} opening(s) • Deadline {job.deadline}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-muted-foreground">
                  {job.applicants} applicants
                </span>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-600">
                  {job.status}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Recruitments</p>
                <h3 className="mt-1 text-xl font-semibold">Create a job</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Job title</label>
                <input
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  placeholder="e.g. Senior React Developer"
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    value={form.department}
                    onChange={(event) => updateField("department", event.target.value)}
                  >
                    <option>People Operations</option>
                    <option>Product Delivery</option>
                    <option>Finance</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Openings</label>
                  <input
                    type="number"
                    min="1"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                    value={form.openings}
                    onChange={(event) => updateField("openings", event.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Application deadline</label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  value={form.deadline}
                  onChange={(event) => updateField("deadline", event.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  <BriefcaseBusiness className="h-4 w-4" />
                  Post job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function RecruitmentDetailPanel({ recruitment }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Recruitment detail</p>
        <h3 className="mt-1 text-xl font-semibold">{recruitment.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {recruitment.department} • {recruitment.openings} opening(s)
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Role information</p>
        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
          <p>Posted on: {recruitment.postedOn}</p>
          <p>Deadline: {recruitment.deadline}</p>
          <p>Status: {recruitment.status}</p>
          <p>Total applicants: {recruitment.applicants}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Recruiter</p>
        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          <p>{recruitment.recruiter.name}</p>
          <p>{recruitment.recruiter.email}</p>
          <p>{recruitment.recruiter.phone}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-medium">Applicant user details</p>
        <div className="mt-3 space-y-3">
          {recruitment.candidates.length === 0 ? (
            <div className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
              No applicants yet.
            </div>
          ) : (
            recruitment.candidates.map((candidate) => (
              <div key={candidate.id} className="rounded-xl border border-border bg-background p-3">
                <p className="text-sm font-medium">{candidate.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{candidate.email}</p>
                <p className="mt-1 text-xs text-muted-foreground">{candidate.phone}</p>
                <p className="mt-2 text-xs text-muted-foreground">Experience: {candidate.experience}</p>
                <p className="mt-1 text-xs text-muted-foreground">Stage: {candidate.stage}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
