export function AuthShell({ eyebrow, title, description, highlights, children }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[0.95fr_1.05fr]">
      <section className="relative hidden overflow-hidden border-r border-border bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.22),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(30,41,59,0.98))] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">{eyebrow}</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">{description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {highlights.map((item) => (
            <div key={item.title} className="rounded-3xl border border-white/10 bg-white/8 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">{item.title}</p>
              <p className="mt-2 text-sm text-white/80">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-xl rounded-[2rem] border border-border bg-card p-5 shadow-[0_30px_90px_rgba(15,23,42,0.12)] sm:p-8">
          {children}
        </div>
      </section>
    </div>
  )
}