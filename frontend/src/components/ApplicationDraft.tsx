import { useState, useEffect } from 'react';
import { Copy, Check, Loader2, ArrowLeft } from 'lucide-react';
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
    <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <h1
            className="text-2xl font-semibold"
            style={{ color: '#1D1D1F', letterSpacing: '-0.02em' }}
          >
            Application Draft
          </h1>
          <button
            onClick={() => setView('results')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 hover:scale-[1.02]"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.08)',
              color: '#6E6E73',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <ArrowLeft size={14} />
            Back to Results
          </button>
        </div>

        {loading ? (
          <div
            className="flex flex-col items-center justify-center py-32 rounded-3xl"
            style={{ background: '#FFFFFF', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}
          >
            <Loader2 size={32} className="animate-spin mb-4" style={{ color: '#4338CA' }} />
            <span className="text-sm" style={{ color: '#6E6E73' }}>Generating application draft…</span>
          </div>
        ) : (
          <div className="space-y-4">
            {SECTIONS.map(({ title, key }) => (
              <div
                key={key}
                className="rounded-3xl p-8 transition-all duration-150 hover:shadow-lg"
                style={{
                  background: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="font-semibold text-base"
                    style={{ color: '#1D1D1F', letterSpacing: '-0.015em' }}
                  >
                    {title}
                  </h2>
                  <button
                    onClick={() => copySection(key, draft?.[key] ?? '')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-150 hover:scale-[1.03]"
                    style={
                      copied === key
                        ? { background: '#ECFDF5', color: '#059669' }
                        : { background: '#F5F5F7', color: '#6E6E73' }
                    }
                  >
                    {copied === key ? (
                      <>
                        <Check size={12} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: '#3A3A3C', lineHeight: '1.7' }}
                >
                  {draft?.[key]}
                </p>
              </div>
            ))}

            <div
              className="rounded-3xl px-8 py-5 flex items-start gap-3 text-sm"
              style={{
                background: '#FFFBEB',
                border: '1px solid rgba(217,119,6,0.15)',
                color: '#92570F',
              }}
            >
              <span className="text-lg leading-none mt-0.5">⚠</span>
              <p>
                <strong>Note:</strong> This is an AI-generated draft. Review and personalize each section before submission.
              </p>
            </div>
          </div>
        )}
    </div>
  );
}
