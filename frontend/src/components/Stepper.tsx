import { Check } from 'lucide-react';

const STEPS = [
  { label: 'Entity & Eligibility', number: 1 },
  { label: 'Financials & Impact', number: 2 },
  { label: 'Documents', number: 3 },
];

interface StepperProps {
  currentStep: number;
}

export default function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {STEPS.map((step, idx) => {
        const done = currentStep > step.number;
        const active = currentStep === step.number;
        return (
          <div key={step.number} className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3">
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-semibold transition-all duration-300"
                style={
                  done
                    ? { background: 'linear-gradient(135deg, #1E3A8A, #325EC7)', color: '#fff', boxShadow: '0 8px 24px rgba(30,58,138,0.18)' }
                    : active
                    ? { background: '#0F172A', color: '#fff', boxShadow: '0 8px 24px rgba(15,23,42,0.16)' }
                    : { background: '#FFFFFF', color: '#64748B', border: '1px solid rgba(148, 163, 184, 0.25)' }
                }
              >
                {done ? <Check size={16} strokeWidth={2.5} /> : step.number}
              </div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Step {step.number}</div>
                <span
                  className="mt-0.5 block truncate text-sm font-semibold transition-colors duration-200"
                  style={
                    active
                      ? { color: '#0F172A' }
                      : done
                      ? { color: '#1E3A8A' }
                      : { color: '#475569' }
                  }
                >
                  {step.label}
                </span>
              </div>
            </div>
            {idx < STEPS.length - 1 ? <div className="hidden h-px flex-1 bg-[var(--line)] md:block" /> : null}
          </div>
        );
      })}
    </div>
  );
}
