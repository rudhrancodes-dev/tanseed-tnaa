import { CheckCircle2, FileLock2, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import type { DraftPaymentController } from '../hooks/useDraftPayment';

interface DraftAccessPanelProps {
  controller: DraftPaymentController;
  className?: string;
}

/**
 * Shared paywall card used in both the results screen and the draft route so
 * the draft remains protected even after refreshes or direct navigation.
 */
export default function DraftAccessPanel({ controller, className }: DraftAccessPanelProps) {
  const { amountLabel, error, isPaid, isProcessing, status, unlockDraft } = controller;

  return (
    <section
      className={`rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] ${className ?? ''}`.trim()}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(30,58,138,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary-700)]">
            <FileLock2 size={14} />
            Draft Access
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-slate-950">
            {isPaid ? 'Draft unlocked' : `Unlock the full application draft for ${amountLabel}`}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            {isPaid
              ? 'Your payment is verified. You can open the AI-generated draft and copy section-level content.'
              : 'Eligibility stays free. Payment is only required when you want access to the generated TANSEED application narrative.'}
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
            isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
          }`}
        >
          {isPaid ? <CheckCircle2 size={14} /> : <ShieldCheck size={14} />}
          {isPaid ? 'Paid' : 'Payment Required'}
        </div>
      </div>

      <div className="mt-6 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
        <div className="rounded-2xl bg-[var(--surface-muted)] px-4 py-4">
          <p className="font-semibold text-slate-900">What unlocks</p>
          <p className="mt-2 leading-6">Executive summary, market opportunity, use of funds, and impact statement.</p>
        </div>
        <div className="rounded-2xl bg-[var(--surface-muted)] px-4 py-4">
          <p className="font-semibold text-slate-900">Why pay now</p>
          <p className="mt-2 leading-6">The draft is generated after eligibility so applicants only pay once the submission looks viable.</p>
        </div>
        <div className="rounded-2xl bg-[var(--surface-muted)] px-4 py-4">
          <p className="font-semibold text-slate-900">Restoration</p>
          <p className="mt-2 leading-6">If Razorpay redirects or the page reloads, the app restores the pending session and verifies it.</p>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-[var(--danger-400)]/35 bg-red-50 px-4 py-3 text-sm text-[var(--danger-600)]">
          {error}
        </div>
      ) : null}

      {status === 'verifying' ? (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Verifying payment and restoring your session.
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => void unlockDraft()}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1E3A8A,#325EC7)] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(30,58,138,0.22)] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
        >
          {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {isPaid ? 'Open application draft' : `Pay ${amountLabel} and unlock draft`}
        </button>
        <p className="text-xs leading-6 text-slate-500">
          Razorpay secures the checkout. Access is tied to this saved application session.
        </p>
      </div>
    </section>
  );
}
