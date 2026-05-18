import { CheckCircle, XCircle, AlertCircle, Info, FileText, ArrowLeft, Sparkles } from 'lucide-react';
import ApplicationShell from './ApplicationShell';
import { useApplication } from '../context/ApplicationContext';
import type { CriterionResult } from '../types';
import DraftAccessPanel from './DraftAccessPanel';
import type { DraftPaymentController } from '../hooks/useDraftPayment';

const statusConfig = {
  PASS: {
    icon: <CheckCircle size={16} strokeWidth={2} />,
    color: '#059669',
    bg: 'rgba(5,150,105,0.05)',
    badge: { background: '#ECFDF5', color: '#059669' },
  },
  FAIL: {
    icon: <XCircle size={16} strokeWidth={2} />,
    color: '#DC2626',
    bg: 'rgba(220,38,38,0.04)',
    badge: { background: '#FEF2F2', color: '#DC2626' },
  },
  REVIEW: {
    icon: <AlertCircle size={16} strokeWidth={2} />,
    color: '#D97706',
    bg: 'rgba(217,119,6,0.05)',
    badge: { background: '#FFFBEB', color: '#D97706' },
  },
  INFO: {
    icon: <Info size={16} strokeWidth={2} />,
    color: '#4338CA',
    bg: 'rgba(67,56,202,0.04)',
    badge: { background: '#F0EFFE', color: '#4338CA' },
  },
};

const overallConfig = {
  PASS: {
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    glow: 'rgba(5,150,105,0.2)',
    label: 'Eligible',
    emoji: '✓',
  },
  REVIEW: {
    gradient: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
    glow: 'rgba(217,119,6,0.2)',
    label: 'Needs Review',
    emoji: '⚠',
  },
  FAIL: {
    gradient: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
    glow: 'rgba(220,38,38,0.2)',
    label: 'Not Eligible',
    emoji: '✕',
  },
};

export default function EligibilityDashboard({ draftPayment }: { draftPayment: DraftPaymentController }) {
  const { result, setView } = useApplication();

  if (!result) return null;

  const { status, ticketSize, missingInfo, failReason, criteria } = result;
  const oc = overallConfig[status];

  const desc =
    status === 'PASS'
      ? `Recommended ticket size: ${ticketSize}`
      : status === 'REVIEW'
      ? `Missing info: ${missingInfo?.join(', ')}`
      : `Reason: ${failReason}`;

  return (
    <ApplicationShell
      title="Eligibility outcome"
      description="This view summarizes the screening result, shows criterion-level reasoning, and provides the next step for editing the generated grant narrative."
      aside={
        <div className="space-y-5">
          <div className="rounded-[24px] bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-emerald-300" />
              <p className="text-sm font-semibold">Outcome summary</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">{desc}</p>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Recommended action</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">
              {status === 'FAIL' ? 'Revise the application before drafting.' : 'Proceed to the draft and refine the narrative.'}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {status === 'REVIEW'
                ? 'Clarify the flagged points inside the final submission package.'
                : status === 'PASS'
                ? 'Use the generated draft as a first-pass submission base.'
                : 'Focus on the failed criteria before asking reviewers to assess the narrative.'}
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <section
          className="relative overflow-hidden rounded-[28px] px-6 py-7 text-white shadow-[0_18px_50px_rgba(15,23,42,0.14)]"
          style={{ background: oc.gradient, boxShadow: `0 12px 40px ${oc.glow}` }}
        >
          <div className="absolute right-0 top-0 h-44 w-44 translate-x-1/3 -translate-y-1/3 rounded-full bg-white/10" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-lg font-bold">
                {oc.emoji}
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-white/70">Overall Result</p>
                <h2 className="text-3xl font-semibold tracking-[-0.03em]">{oc.label}</h2>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85">{desc}</p>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-white">
          <div className="border-b border-[var(--line)] px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Detailed Analysis</h2>
          </div>
          <div className="divide-y divide-[var(--line)]">
            {criteria.map((c: CriterionResult, i: number) => {
              const cfg = statusConfig[c.status];
              return (
                <div key={i} className="grid gap-3 px-6 py-5 md:grid-cols-[minmax(0,180px)_110px_1fr]" style={{ background: cfg.bg }}>
                  <p className="text-sm font-semibold text-slate-900">{c.criterion}</p>
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: cfg.color }}>{cfg.icon}</span>
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={cfg.badge}>
                      {c.status}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{c.justification}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setView('step1')}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--line-strong)]"
          >
            <ArrowLeft size={14} />
            Edit application
          </button>
          {(status === 'PASS' || status === 'REVIEW') ? (
            <button
              onClick={() => void draftPayment.unlockDraft()}
              className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1E3A8A,#325EC7)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(30,58,138,0.22)] transition hover:-translate-y-0.5"
            >
              <FileText size={14} />
              {draftPayment.isPaid ? 'Open application draft' : `Unlock application draft · ${draftPayment.amountLabel}`}
            </button>
          ) : null}
          <button
            onClick={() => setView('landing')}
            className="inline-flex items-center gap-2 rounded-2xl border border-transparent bg-[var(--surface-muted)] px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Start another application
          </button>
        </div>

        {(status === 'PASS' || status === 'REVIEW') ? <DraftAccessPanel controller={draftPayment} /> : null}
      </div>
    </ApplicationShell>
  );
}
