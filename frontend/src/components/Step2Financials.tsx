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

const inputBase: React.CSSProperties = {
  width: '100%',
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: '14px',
  padding: '12px 16px',
  fontSize: '14px',
  color: '#1D1D1F',
  background: '#FFFFFF',
  outline: 'none',
  transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
};

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

  function focusStyle(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(67,56,202,0.18)';
    e.currentTarget.style.borderColor = '#4338CA';
  }
  function blurStyle(e: React.FocusEvent<HTMLInputElement>, hasError: boolean) {
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.borderColor = hasError ? '#FF3B30' : 'rgba(0,0,0,0.1)';
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
        <h1
          className="text-2xl font-semibold text-center mb-8"
          style={{ color: '#1D1D1F', letterSpacing: '-0.02em' }}
        >
          TANSEED Application
        </h1>
        <Stepper currentStep={2} />

        <div
          className="rounded-3xl p-10 space-y-8"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: '#1D1D1F', letterSpacing: '-0.015em' }}
          >
            Step 2: Financials & Impact
          </h2>

          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: '#1D1D1F', letterSpacing: '-0.01em' }}
            >
              Average Profit (3 years, INR)
            </label>
            <input
              type="number"
              value={form.avgProfit3y}
              onChange={(e) => setForm({ ...form, avgProfit3y: Number(e.target.value) })}
              style={errors.avgProfit3y ? { ...inputBase, borderColor: '#FF3B30' } : inputBase}
              onFocus={focusStyle}
              onBlur={(e) => blurStyle(e, !!errors.avgProfit3y)}
            />
            {errors.avgProfit3y ? (
              <p className="text-xs mt-1.5" style={{ color: '#FF3B30' }}>{errors.avgProfit3y}</p>
            ) : (
              <p className="text-xs mt-1.5" style={{ color: '#9898A0' }}>Must be below ₹5,00,000 to qualify.</p>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: '#1D1D1F', letterSpacing: '-0.01em' }}
            >
              Priority Sector *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {SECTORS.map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-2xl cursor-pointer text-sm transition-all duration-150 hover:scale-[1.01]"
                  style={
                    form.prioritySector === s
                      ? {
                          background: '#F0EFFE',
                          border: '1.5px solid #4338CA',
                          color: '#4338CA',
                          fontWeight: 600,
                          boxShadow: '0 2px 10px rgba(67,56,202,0.12)',
                        }
                      : {
                          background: '#FFFFFF',
                          border: '1px solid rgba(0,0,0,0.08)',
                          color: '#6E6E73',
                        }
                  }
                >
                  <input
                    type="radio"
                    name="sector"
                    value={s}
                    checked={form.prioritySector === s}
                    onChange={() => setForm({ ...form, prioritySector: s })}
                    className="sr-only"
                  />
                  <span
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={
                      form.prioritySector === s
                        ? { borderColor: '#4338CA', background: '#4338CA' }
                        : { borderColor: '#C7C7CC' }
                    }
                  >
                    {form.prioritySector === s && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  {s}
                </label>
              ))}
            </div>
            {errors.prioritySector && (
              <p className="text-xs mt-1.5" style={{ color: '#FF3B30' }}>{errors.prioritySector}</p>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: '#1D1D1F', letterSpacing: '-0.01em' }}
            >
              TRL Level:{' '}
              <span style={{ color: '#4338CA', fontWeight: 700 }}>{form.trlLevel}</span>
              {form.trlLevel >= 4 && (
                <span
                  className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                  style={{ background: '#ECFDF5', color: '#059669' }}
                >
                  High weightage
                </span>
              )}
            </label>
            <div
              className="px-4 py-4 rounded-2xl"
              style={{ background: '#FBFBFB', border: '1px solid rgba(0,0,0,0.06)' }}
            >
              <input
                type="range"
                min={1}
                max={9}
                value={form.trlLevel}
                onChange={(e) => setForm({ ...form, trlLevel: Number(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-2" style={{ color: '#9898A0' }}>
                <span>1 — Idea</span>
                <span>5 — Prototype</span>
                <span>9 — Market</span>
              </div>
            </div>
          </div>

          <div
            className="rounded-2xl p-6 space-y-4"
            style={{ background: '#FBFBFB', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <p
              className="text-sm font-semibold"
              style={{ color: '#1D1D1F', letterSpacing: '-0.01em' }}
            >
              Declarations *
            </p>
            {([
              ['noDues', 'We have no outstanding government dues or legal proceedings.'],
              ['notBlacklisted', 'We are not blacklisted by any government body or financial institution.'],
            ] as [keyof FinancialsData, string][]).map(([key, label]) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer group">
                <div className="mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={Boolean(form[key])}
                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                    className="sr-only"
                  />
                  <div
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-150"
                    style={
                      Boolean(form[key])
                        ? { background: '#4338CA', borderColor: '#4338CA' }
                        : { background: '#FFFFFF', borderColor: errors[key] ? '#FF3B30' : '#C7C7CC' }
                    }
                    onClick={() => setForm({ ...form, [key]: !Boolean(form[key]) })}
                  >
                    {Boolean(form[key]) && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm leading-snug" style={{ color: '#3A3A3C' }}>{label}</span>
              </label>
            ))}
            {(errors.noDues || errors.notBlacklisted) && (
              <p className="text-xs" style={{ color: '#FF3B30' }}>Both declarations are required</p>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setView('step1')}
              className="px-5 py-3 text-sm font-medium rounded-2xl transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                color: '#3A3A3C',
                background: '#F5F5F7',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-2xl transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #4338CA 0%, #3730A3 100%)',
                boxShadow: '0 4px 20px rgba(67,56,202,0.3)',
                letterSpacing: '-0.01em',
              }}
            >
              Next: Documents →
            </button>
          </div>
        </div>
    </div>
  );
}
