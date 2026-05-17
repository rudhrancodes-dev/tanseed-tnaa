import { useState, useEffect } from 'react';
import { Copy, Check, Loader2 } from 'lucide-react';
import { useApplication } from '../context/ApplicationContext';
import { fetchDraft } from '../api';
import type { ApplicationData } from '../types';

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

export default function ApplicationDraft() {
  const { data, setView } = useApplication();
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchDraft(data as ApplicationData).then((d) => {
      setDraft(d);
      setLoading(false);
    });
  }, []);

  async function copySection(key: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1E3A8A]">Application Draft</h1>
          <button
            onClick={() => setView('results')}
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5"
          >
            ← Back to Results
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-[#1E3A8A]" />
            <span className="ml-3 text-gray-500">Generating application draft…</span>
          </div>
        ) : (
          <div className="space-y-4">
            {SECTIONS.map(({ title, key }) => (
              <div key={key} className="bg-white rounded-2xl shadow p-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-800">{title}</h2>
                  <button
                    onClick={() => copySection(key, draft?.[key] ?? '')}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1E3A8A] transition-colors"
                  >
                    {copied === key ? (
                      <>
                        <Check size={14} className="text-emerald-500" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{draft?.[key]}</p>
              </div>
            ))}

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
              <strong>Note:</strong> This is an AI-generated draft. Review and personalize each section before submission.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
