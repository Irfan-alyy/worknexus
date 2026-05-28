import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, Lock, Mail, RefreshCw } from "lucide-react"

import { AuthShell } from "@/components/shared/auth-shell"
import { useGlobalStore } from "@/stores/use-global-store"
import { useLoginMutation } from "@/features/auth"

const authHighlights = [
  { title: "Role aware", description: "Each sign-in lands on a dashboard tailored to the selected role." },
  { title: "Responsive", description: "The form stack and the marketing panel adapt to small and large screens." },
  { title: "Reusable", description: "A shared auth shell keeps the pages consistent and easy to extend." },
  { title: "Secure", description: "Sign in with your organization credentials to access the workspace." },
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
            required
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
            required
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
  const { mutateAsync: login } = useLoginMutation()
  const [errorMessage, setErrorMessage] = useState("")
  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMessage("")

    try {
      const response = await login({ email: form.email, password: form.password })
      const user = response?.data?.user
      const token = response?.data?.token

      authenticate({
        user: {
          ...user,
          name: user?.name || user?.email || form.email,
        },
        token,
      })

      navigate("/dashboard", { replace: true })
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed. Check your credentials and try again."
      setErrorMessage(message)
    }
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

          {errorMessage ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          ) : null}

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
      description="Use your organization account to access the workspace."
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