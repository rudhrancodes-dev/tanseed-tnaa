import { CheckCircle, XCircle, AlertCircle, Info, FileText } from 'lucide-react';
import { useApplication } from '../context/ApplicationContext';
import type { CriterionResult } from '../types';

const statusConfig = {
  PASS: { icon: <CheckCircle size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50', badge: 'bg-emerald-100 text-emerald-700' },
  FAIL: { icon: <XCircle size={18} />, color: 'text-red-600', bg: 'bg-red-50', badge: 'bg-red-100 text-red-700' },
  REVIEW: { icon: <AlertCircle size={18} />, color: 'text-amber-600', bg: 'bg-amber-50', badge: 'bg-amber-100 text-amber-700' },
  INFO: { icon: <Info size={18} />, color: 'text-blue-600', bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700' },
};

export default function EligibilityDashboard() {
  const { result, setView, data } = useApplication();

  if (!result) return null;

  const { status, ticketSize, missingInfo, failReason, criteria } = result;

  const overallConfig = {
    PASS: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Eligible', desc: `Recommended ticket size: ${ticketSize}` },
    REVIEW: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Needs Review', desc: `Missing info: ${missingInfo?.join(', ')}` },
    FAIL: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Not Eligible', desc: `Reason: ${failReason}` },
  }[status];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1E3A8A]">Eligibility Results</h1>
          <button
            onClick={() => setView('landing')}
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5"
          >
            New Application
          </button>
        </div>

        {/* Overall result */}
        <div className={`border rounded-2xl p-6 mb-6 ${overallConfig.bg}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-3xl font-bold ${overallConfig.color}`}>{overallConfig.label}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig[status].badge}`}>
              {status}
            </span>
          </div>
          <p className={`text-sm ${overallConfig.color}`}>{overallConfig.desc}</p>
        </div>

        {/* Criteria grid */}
        <div className="bg-white rounded-2xl shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="font-semibold text-gray-700">Detailed Analysis</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 uppercase border-b">
                <th className="text-left px-6 py-3">Criterion</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">AI Justification</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c: CriterionResult, i: number) => {
                const cfg = statusConfig[c.status];
                return (
                  <tr key={i} className={`border-b last:border-0 ${cfg.bg}`}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{c.criterion}</td>
                    <td className="px-6 py-4">
                      <div className={`flex items-center gap-1.5 ${cfg.color} font-medium text-sm`}>
                        {cfg.icon}
                        {c.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.justification}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setView('step1')}
            className="border border-gray-200 text-gray-600 hover:border-gray-400 font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            ← Edit Application
          </button>
          {(status === 'PASS' || status === 'REVIEW') && (
            <button
              onClick={() => setView('draft')}
              className="flex items-center gap-2 bg-[#1E3A8A] hover:bg-blue-800 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              <FileText size={16} />
              View Application Draft
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
