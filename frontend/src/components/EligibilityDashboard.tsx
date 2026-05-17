import { CheckCircle, XCircle, AlertCircle, Info, FileText, ArrowLeft } from 'lucide-react';
import { useApplication } from '../context/ApplicationContext';
import type { CriterionResult } from '../types';

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

export default function EligibilityDashboard() {
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
    <div className="min-h-screen" style={{ background: '#FBFBFB' }}>
      <div className="max-w-3xl mx-auto px-6 py-14">
        {/* Header row */}
        <div className="flex items-center justify-between mb-10">
          <h1
            className="text-2xl font-semibold"
            style={{ color: '#1D1D1F', letterSpacing: '-0.02em' }}
          >
            Eligibility Results
          </h1>
          <button
            onClick={() => setView('landing')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 hover:scale-[1.02]"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.08)',
              color: '#6E6E73',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            + New Application
          </button>
        </div>

        {/* Overall result hero card */}
        <div
          className="rounded-3xl p-8 mb-6 text-white relative overflow-hidden"
          style={{
            background: oc.gradient,
            boxShadow: `0 12px 40px ${oc.glow}`,
          }}
        >
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{
              background: 'rgba(255,255,255,0.08)',
              transform: 'translate(30%, -30%)',
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <span
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-bold"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                {oc.emoji}
              </span>
              <span className="text-3xl font-bold tracking-tight" style={{ letterSpacing: '-0.025em' }}>
                {oc.label}
              </span>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">{desc}</p>
          </div>
        </div>

        {/* Criteria analysis */}
        <div
          className="rounded-3xl overflow-hidden mb-6"
          style={{ background: '#FFFFFF', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}
        >
          <div
            className="px-8 py-5 border-b"
            style={{ borderColor: 'rgba(0,0,0,0.06)' }}
          >
            <h2
              className="font-semibold text-sm"
              style={{ color: '#1D1D1F', letterSpacing: '-0.01em' }}
            >
              Detailed Analysis
            </h2>
          </div>

          <div className="divide-y" style={{ '--tw-divide-opacity': 1, borderColor: 'transparent' } as React.CSSProperties}>
            {criteria.map((c: CriterionResult, i: number) => {
              const cfg = statusConfig[c.status];
              return (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_100px_2fr] gap-4 px-8 py-5 transition-colors duration-100"
                  style={{
                    background: cfg.bg,
                    borderBottom: i < criteria.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none',
                  }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: '#1D1D1F', letterSpacing: '-0.005em' }}
                  >
                    {c.criterion}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: cfg.color }}>{cfg.icon}</span>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={cfg.badge}
                    >
                      {c.status}
                    </span>
                  </div>
                  <span className="text-sm" style={{ color: '#6E6E73', lineHeight: '1.5' }}>
                    {c.justification}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setView('step1')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(0,0,0,0.08)',
              color: '#3A3A3C',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <ArrowLeft size={14} />
            Edit Application
          </button>
          {(status === 'PASS' || status === 'REVIEW') && (
            <button
              onClick={() => setView('draft')}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-2xl transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #4338CA 0%, #3730A3 100%)',
                boxShadow: '0 4px 20px rgba(67,56,202,0.3)',
                letterSpacing: '-0.01em',
              }}
            >
              <FileText size={14} />
              View Application Draft
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
