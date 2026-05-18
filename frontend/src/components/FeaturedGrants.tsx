import { ArrowRight, Clock, IndianRupee } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const grants = [
  {
    title: 'Early-Stage Grant',
    amount: '₹50L – ₹2Cr',
    deadline: 'Rolling (quarterly review)',
    badge: 'Open',
    badgeColor: '#059669',
    badgeBg: '#ECFDF5',
    description: 'For startups <5 years in Deep Tech, Climate, or Health sectors with TRL-3+ innovation.',
  },
  {
    title: 'Growth Grant',
    amount: '₹2Cr – ₹5Cr',
    deadline: '30 Jun 2026',
    badge: 'High Demand',
    badgeColor: '#D97706',
    badgeBg: '#FFFBEB',
    description: 'Scale your proven solution. Requires TRL-7+, 10+ employees, and market traction.',
  },
  {
    title: 'Women Entrepreneur Grant',
    amount: '₹25L – ₹1Cr',
    deadline: '30 Sep 2026',
    badge: 'Special',
    badgeColor: '#4338CA',
    badgeBg: '#F0EFFE',
    description: 'For startups with ≥51% women founders. All sectors eligible, lower equity threshold.',
  },
];

export default function FeaturedGrants() {
  return (
    <section id="opportunities" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <AnimatedSection>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-5xl">
              Program routes the applicant can qualify for
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              The portal translates a founder profile into a program recommendation and highlights the eligibility pressure points before submission.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
            Recommendations are mapped from sector, TRL, ownership, and financial limits.
          </div>
        </div>
      </AnimatedSection>

      <div className="mx-auto mt-10 grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-3">
        {grants.map((grant, idx) => (
          <AnimatedSection key={grant.title} delay={idx * 120}>
            <article
              className="flex h-full flex-col rounded-[28px] border border-[var(--line)] bg-white p-7 shadow-[0_18px_44px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="flex-1 text-xl font-semibold tracking-[-0.02em] text-slate-950">
                  {grant.title}
                </h3>
                <span
                  className="ml-3 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{ background: grant.badgeBg, color: grant.badgeColor, letterSpacing: '0.02em' }}
                >
                  {grant.badge}
                </span>
              </div>

              <p className="mb-6 flex-1 text-sm leading-7 text-slate-600">
                {grant.description}
              </p>

              <div className="mb-6 space-y-3 rounded-2xl bg-[var(--surface-muted)] p-4">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <IndianRupee size={14} strokeWidth={1.7} style={{ color: '#1E3A8A' }} />
                  <span className="font-medium">{grant.amount}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Clock size={14} strokeWidth={1.7} style={{ color: '#1E3A8A' }} />
                  <span>{grant.deadline}</span>
                </div>
              </div>

              <button
                className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-[var(--primary-700)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-600)]"
              >
                Apply Now
                <ArrowRight size={14} strokeWidth={2} />
              </button>
            </article>
          </AnimatedSection>
        ))}
      </div>
    </section>
  );
}
