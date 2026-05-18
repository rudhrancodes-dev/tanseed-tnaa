import type { ReactNode } from 'react';
import Stepper from './Stepper';

interface ApplicationShellProps {
  title: string;
  description: string;
  children: ReactNode;
  aside: ReactNode;
  currentStep?: number;
}

export default function ApplicationShell({
  title,
  description,
  children,
  aside,
  currentStep,
}: ApplicationShellProps) {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top_left,_rgba(30,58,138,0.16),_transparent_56%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_48%)]" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <section className="rounded-[28px] border border-white/70 bg-white/88 px-6 py-7 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--primary-700)]">
                TANSEED Grant Assistance
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950 md:text-4xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
                {description}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm sm:max-w-md">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Review mode</div>
                <div className="mt-1 font-semibold text-slate-900">AI-assisted</div>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Coverage</div>
                <div className="mt-1 font-semibold text-slate-900">Eligibility + Draft</div>
              </div>
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Outcome</div>
                <div className="mt-1 font-semibold text-slate-900">Ready to submit</div>
              </div>
            </div>
          </div>
          {currentStep ? (
            <div className="mt-8 border-t border-[var(--line)] pt-6">
              <Stepper currentStep={currentStep} />
            </div>
          ) : null}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[0_22px_60px_rgba(15,23,42,0.07)] md:p-8">
            {children}
          </div>
          <aside className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-muted)] p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            {aside}
          </aside>
        </section>
      </div>
    </main>
  );
}
