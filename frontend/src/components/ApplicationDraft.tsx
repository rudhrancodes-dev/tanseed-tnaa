import { useState, useEffect } from 'react';
import { Copy, Check, Loader2, ArrowLeft, FileText } from 'lucide-react';
import ApplicationShell from './ApplicationShell';
import { useApplication } from '../context/ApplicationContext';
import { fetchDraft } from '../api';
import type { ApplicationData } from '../types';
import DraftAccessPanel from './DraftAccessPanel';
import type { DraftPaymentController } from '../hooks/useDraftPayment';

interface DraftSection {
  title: string;
  key: 'executiveSummary' | 'marketOpportunity' | 'useOfFunds' | 'impactStatement';
}

const SECTIONS: DraftSection[] = [
  { title: 'Executive Summary', key: 'executiveSummary' },
  { title: 'Market Opportunity', key: 'marketOpportunity' },
  { title: 'Use of Funds', key: 'useOfFunds' },
  { title: 'Impact Statement', key: 'impactStatement' },
];

export default function ApplicationDraft({ draftPayment }: { draftPayment: DraftPaymentController }) {
  const { data, setView } = useApplication();
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(draftPayment.isPaid);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!draftPayment.isPaid) {
      setLoading(false);
      return;
    }

    fetchDraft(data as ApplicationData).then((d) => {
      setDraft(d);
      setLoading(false);
    });
  }, [data, draftPayment.isPaid]);

  async function copySection(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <ApplicationShell
      title="Application draft"
      description="The draft below is generated from the current application data and backend draft endpoint. Copy sections independently and refine them before submission."
      aside={
        <div className="space-y-5">
          <div className="rounded-[24px] bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-emerald-300" />
              <p className="text-sm font-semibold">Draft sections</p>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>Executive summary</li>
              <li>Market opportunity</li>
              <li>Use of funds</li>
              <li>Impact statement</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
            This is an AI-generated starting point. Final submission text should be reviewed for factual accuracy, traction claims, and sector-specific language.
          </div>
        </div>
      }
    >
      {!draftPayment.isPaid ? (
        <div className="space-y-4">
          <DraftAccessPanel controller={draftPayment} />
          <div className="flex justify-end">
            <button
              onClick={() => setView('results')}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[var(--line-strong)]"
            >
              <ArrowLeft size={14} />
              Back to results
            </button>
          </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-[var(--line)] bg-white py-28">
          <Loader2 size={32} className="animate-spin text-[var(--primary-700)]" />
          <p className="mt-4 text-sm text-slate-600">Generating application draft...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setView('results')}
              className="inline-flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[var(--line-strong)]"
            >
              <ArrowLeft size={14} />
              Back to results
            </button>
          </div>
          {SECTIONS.map(({ title, key }) => (
            <section
              key={key}
              className="rounded-[28px] border border-[var(--line)] bg-white p-6 shadow-[0_16px_45px_rgba(15,23,42,0.05)]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                <button
                  onClick={() => copySection(key, draft?.[key] ?? '')}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    copied === key
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {copied === key ? <Check size={12} /> : <Copy size={12} />}
                  {copied === key ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-700">{draft?.[key]}</p>
            </section>
          ))}
        </div>
      )}
    </ApplicationShell>
  );
}
