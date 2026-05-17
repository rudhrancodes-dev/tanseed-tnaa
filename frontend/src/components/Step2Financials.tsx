import { useState } from 'react';
import Stepper from './Stepper';
import { useApplication } from '../context/ApplicationContext';
import type { FinancialsData } from '../types';

const DEFAULTS: FinancialsData = {
  avgProfit3y: 0,
  prioritySector: '',
  trlLevel: 4,
  noDues: false,
  notBlacklisted: false,
};

const SECTORS = ['Deep Tech/AI', 'Climate', 'Women-led', 'Rural', 'General'];

export default function Step2Financials() {
  const { data, setData, setView } = useApplication();
  const [form, setForm] = useState<FinancialsData>(data.financials ?? DEFAULTS);
  const [errors, setErrors] = useState<Partial<Record<keyof FinancialsData, string>>>({});

  function validate() {
    const e: typeof errors = {};
    if (form.avgProfit3y >= 500000) e.avgProfit3y = 'Must be less than ₹5,00,000';
    if (!form.prioritySector) e.prioritySector = 'Select a sector';
    if (!form.noDues) e.noDues = 'Required declaration';
    if (!form.notBlacklisted) e.notBlacklisted = 'Required declaration';
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setData({ ...data, financials: form });
    setView('step3');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#1E3A8A] text-center mb-6">TANSEED Application</h1>
        <Stepper currentStep={2} />

        <div className="bg-white rounded-2xl shadow p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">Step 2: Financials & Impact</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average Profit (3 years, INR)
            </label>
            <input
              type="number"
              value={form.avgProfit3y}
              onChange={(e) => setForm({ ...form, avgProfit3y: Number(e.target.value) })}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] ${
                errors.avgProfit3y ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.avgProfit3y && <p className="text-red-500 text-xs mt-1">{errors.avgProfit3y}</p>}
            <p className="text-gray-400 text-xs mt-1">Must be below ₹5,00,000 to qualify.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority Sector *</label>
            <div className="grid grid-cols-2 gap-2">
              {SECTORS.map((s) => (
                <label
                  key={s}
                  className={`flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer text-sm transition-colors ${
                    form.prioritySector === s
                      ? 'border-[#1E3A8A] bg-blue-50 text-[#1E3A8A] font-medium'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="sector"
                    value={s}
                    checked={form.prioritySector === s}
                    onChange={() => setForm({ ...form, prioritySector: s })}
                    className="sr-only"
                  />
                  {s}
                </label>
              ))}
            </div>
            {errors.prioritySector && <p className="text-red-500 text-xs mt-1">{errors.prioritySector}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TRL Level: <span className="text-[#1E3A8A] font-bold">{form.trlLevel}</span>
              {form.trlLevel >= 4 && (
                <span className="ml-2 text-emerald-600 text-xs font-normal">High weightage</span>
              )}
            </label>
            <input
              type="range"
              min={1}
              max={9}
              value={form.trlLevel}
              onChange={(e) => setForm({ ...form, trlLevel: Number(e.target.value) })}
              className="w-full accent-[#1E3A8A]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 (Idea)</span>
              <span>5 (Prototype)</span>
              <span>9 (Market)</span>
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-medium text-gray-700">Declarations *</p>
            {([
              ['noDues', 'We have no outstanding government dues or legal proceedings.'],
              ['notBlacklisted', 'We are not blacklisted by any government body or financial institution.'],
            ] as [keyof FinancialsData, string][]).map(([key, label]) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(form[key])}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="mt-0.5 accent-[#1E3A8A]"
                />
                <span className="text-sm text-gray-600">{label}</span>
                {errors[key] && <p className="text-red-500 text-xs">{errors[key]}</p>}
              </label>
            ))}
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setView('step1')}
              className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors text-sm"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              className="bg-[#1E3A8A] hover:bg-blue-800 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              Next: Documents →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
