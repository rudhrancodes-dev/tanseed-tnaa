import { Search, FileText, Send } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const steps = [
  {
    number: 1,
    icon: Search,
    title: 'Check Eligibility',
    description: 'Answer a few quick questions about your startup — entity, ownership, financials, and sector.',
  },
  {
    number: 2,
    icon: FileText,
    title: 'AI Review',
    description: 'Our engine cross-references your data with TANSEED criteria and produces a detailed report.',
  },
  {
    number: 3,
    icon: Send,
    title: 'Submit & Track',
    description: 'Review the AI-generated draft, make edits, and submit — then track status in real time.',
  },
];

export default function HowItWorks() {
  return (
    <section id="process" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <AnimatedSection>
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-5xl">
              A guided workflow for founders, reviewers, and submission teams
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
              Each stage is designed to reduce ambiguity: collect only the required evidence, surface risks early, and keep the applicant informed with explicit next actions.
            </p>
          </div>
        </div>
      </AnimatedSection>

      <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
        {steps.map((step, idx) => (
          <AnimatedSection key={step.number} delay={idx * 150}>
            <div
              className="relative flex h-full flex-col rounded-[28px] border border-[var(--line)] bg-white px-7 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1"
            >
              <div
                className="mb-6 flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--primary-700)] shadow-[0_14px_28px_rgba(30,58,138,0.2)]"
              >
                <step.icon size={20} className="text-white" strokeWidth={1.8} />
              </div>
              <div
                className="absolute right-6 top-6 rounded-full bg-[var(--warning-100)] px-3 py-1 text-xs font-semibold text-[var(--warning-600)]"
              >
                {step.number}
              </div>
              <h3 className="text-xl font-semibold tracking-[-0.02em] text-slate-950">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {step.description}
              </p>
              <div className="mt-6 border-t border-[var(--line)] pt-4 text-sm text-slate-500">
                Structured prompts, validation cues, and clear completion states.
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
