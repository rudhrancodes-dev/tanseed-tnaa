import { ArrowRight } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

export default function StatusCheck() {
  return (
    <section id="status-check" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <AnimatedSection>
        <div className="mx-auto max-w-7xl rounded-[32px] bg-[linear-gradient(145deg,#10234d_0%,#0f172a_100%)] px-6 py-10 text-white shadow-[0_30px_70px_rgba(15,23,42,0.2)] md:px-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
              Check existing status
              </h2>
              <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">
                Have an application ID? Retrieve the current review state, pending evidence requests, and next milestone without restarting the intake.
              </p>
            </div>
            <div className="rounded-[28px] bg-white p-4 shadow-[0_20px_60px_rgba(2,6,23,0.25)]">
              <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-muted)] p-2">
                <label className="block px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Existing Application ID
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="text"
                    placeholder="TNSEED-2026-00127"
                    className="min-w-0 flex-1 rounded-2xl border border-transparent bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[color:rgba(30,58,138,0.12)]"
                  />
                  <button
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    Check
                    <ArrowRight size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </section>
  );
}
