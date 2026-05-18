export default function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(15,23,42,0.92)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1E3A8A,#10B981)] shadow-[0_10px_25px_rgba(16,185,129,0.18)]">
            <span className="text-sm font-bold tracking-[0.08em] text-white">TN</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-300">StartupTN / TANSEED</p>
            <p className="text-sm font-semibold tracking-[-0.02em] text-white">Grant Assistance Portal</p>
          </div>
        </div>

        <nav className="hidden items-center gap-7 text-sm text-slate-200 md:flex">
          <a href="#process" className="transition hover:text-white">Process</a>
          <a href="#opportunities" className="transition hover:text-white">Opportunities</a>
          <a href="#status-check" className="transition hover:text-white">Status Check</a>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200 sm:inline">
            Grant Assistant
          </span>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Service available
          </div>
        </div>
      </div>
    </header>
  );
}
