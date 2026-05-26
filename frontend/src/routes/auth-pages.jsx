import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Lock, Mail, RefreshCw } from "lucide-react"

import { authRoleOptions } from "@/config/constants"
import { AuthShell } from "@/components/shared/auth-shell"
import { RoleSelector } from "@/components/shared/role-selector"
import { useGlobalStore } from "@/stores/use-global-store"

const authHighlights = [
  { title: "Role aware", description: "Each sign-in lands on a dashboard tailored to the selected role." },
  { title: "Responsive", description: "The form stack and the marketing panel adapt to small and large screens." },
  { title: "Reusable", description: "A shared auth shell keeps the pages consistent and easy to extend." },
  { title: "Route safe", description: "The login page only changes the selected temporary role." },
]

function LoginFields({ form, setForm }) {
  return (
    <div className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-medium">Email or username</span>
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="name@company.com or username"
          />
        </div>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium">Password</span>
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Enter your password"
          />
        </div>
      </label>
    </div>
  )
}

function LoginPageTemplate({ title, description, ctaLabel, alternateLabel, alternateTo }) {
  const navigate = useNavigate()
  const { authenticate } = useGlobalStore()
  const [form, setForm] = useState({
    email: "waqar@worknexus.dev",
    password: "worknexus123",
    role: "employee",
  })

  const handleSubmit = (event) => {
    event.preventDefault()

    authenticate({
      name: form.email || "WorkNexus User",
      email: form.email,
      role: form.role,
    })

    navigate("/dashboard", { replace: true })
  }

  return (
    <AuthShell eyebrow="WorkNexus access" title={title} description={description} highlights={authHighlights}>
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">login</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <LoginFields form={form} setForm={setForm} />

          <div className="space-y-2">
            <span className="text-sm font-medium">Temporary role buttons</span>
            <RoleSelector
              value={form.role}
              options={authRoleOptions}
              onChange={(role) => setForm((current) => ({ ...current, role }))}
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:-translate-y-0.5"
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-sm">
          <Link to={alternateTo} className="font-medium text-primary hover:underline">
            {alternateLabel}
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}

export function LoginPage() {
  return (
    <LoginPageTemplate
      title="Welcome back"
      description="Pick a temporary role and enter the workspace without authentication."
      ctaLabel="Sign in"
      alternateLabel="Forgot password?"
      alternateTo="/forgot-password"
    />
  )
}

export function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="WorkNexus access"
      title="Reset access"
      description="Send yourself back into the workspace by confirming your email and role."
      highlights={authHighlights}
    >
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">forgot password</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Reset access</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This is a dummy page for now. Enter your email and the app will take you back to the login screen.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Email address</span>
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="name@company.com"
            />
          </div>
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Send reset link
          </button>
          <Link to="/login" className="text-sm font-medium text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </AuthShell>
  )
}