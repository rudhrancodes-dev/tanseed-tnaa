interface HeroProps {
  onStart: () => void;
}

export default function Hero({ onStart }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-8 sm:px-6 lg:px-8 lg:pb-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1.1fr)_460px] lg:items-stretch">
        <div className="rounded-[32px] bg-[linear-gradient(160deg,#0f172a_0%,#112b64_52%,#184286_100%)] px-7 py-10 text-white shadow-[0_35px_80px_rgba(15,23,42,0.22)] md:px-10 md:py-12">
          <div className="max-w-2xl animate-[fade-up_0.7s_ease-out]">
            <h1 className="text-4xl font-semibold leading-[1.03] tracking-[-0.05em] md:text-6xl">
              Fast-Track Your TANSEED Application
            </h1>

            <p className="mt-5 max-w-xl text-base leading-8 text-slate-200 md:text-lg">
              AI-powered eligibility check and document preparation. Move from intake to a submission-ready draft with a guided, auditable workflow built for Tamil Nadu startups.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onStart}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_14px_30px_rgba(16,185,129,0.25)] transition hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                Start New Application
                <span aria-hidden="true">→</span>
              </button>
              <a
                href="#status-check"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/8 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                Check Existing Status
              </a>
            </div>

            <dl className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ['3 steps', 'Eligibility, documents, draft'],
                ['WCAG-aware', 'Clear states and keyboard support'],
                ['Fallback ready', 'Works while backend recovers'],
              ].map(([value, label]) => (
                <div key={value} className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4">
                  <dt className="text-2xl font-semibold tracking-[-0.03em]">{value}</dt>
                  <dd className="mt-1 text-sm leading-6 text-slate-200">{label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="rounded-[32px] border border-[var(--line)] bg-white p-5 shadow-[0_30px_70px_rgba(15,23,42,0.12)] md:p-6">
          <div className="rounded-[28px] bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--primary-700)]">Application workflow</p>
                <p className="mt-1 text-sm text-slate-600">Structured review from intake to recommendation.</p>
              </div>
              <div className="rounded-full bg-[var(--success-100)] px-3 py-1 text-xs font-semibold text-[var(--success-600)]">
                Live preview
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                ['01', 'Entity & Eligibility', 'Company type, ownership, registrations, Tamil Nadu location validation'],
                ['02', 'Financials & Impact', 'Profit cap, priority sector, TRL level, statutory declarations'],
                ['03', 'Documents', 'Pitch deck, financial model, prototype video, supporting evidence'],
              ].map(([num, title, copy]) => (
                <div key={num} className="grid grid-cols-[52px_1fr] gap-4 rounded-2xl border border-white bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-700)] text-sm font-bold text-white">
                    {num}
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{copy}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[24px] bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Eligibility result preview</p>
                  <p className="mt-1 text-sm text-slate-300">Outcome appears after review and document intake.</p>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  PASS
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Recommended ticket</p>
                  <p className="mt-2 text-lg font-semibold">₹50L - ₹2Cr</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Draft status</p>
                  <p className="mt-2 text-lg font-semibold">Ready for editing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
