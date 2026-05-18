import { useState } from 'react';
import { BarChart3, CircleAlert, Sparkles } from 'lucide-react';
import ApplicationShell from './ApplicationShell';
import { Field, errorInputClassName, inputClassName } from './FormPrimitives';
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
    <ApplicationShell
      title="Financials and impact signals"
      description="This step checks core threshold rules, sector alignment, technology maturity, and the declarations required before a draft can be generated."
      currentStep={2}
      aside={
        <div className="space-y-5">
          <div className="rounded-[24px] bg-slate-950 p-5 text-white">
            <div className="flex items-center gap-3">
              <BarChart3 size={20} className="text-emerald-300" />
              <p className="text-sm font-semibold">Funding fit indicators</p>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li>Average profit must remain below ₹5,00,000.</li>
              <li>TRL 4 and above improves review weightage.</li>
              <li>Priority sectors help shape the recommended ticket narrative.</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-[var(--line)] bg-white p-5">
            <div className="flex items-start gap-3">
              <Sparkles size={18} className="mt-0.5 text-[var(--primary-700)]" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Reviewer tip</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Choose the sector your reviewers would recognize first. Use the startup description to explain any nuance later in the draft.
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        <Field
          label="Average Profit (3 years, INR)"
          htmlFor="avgProfit3y"
          hint="Threshold: below ₹5,00,000"
          error={errors.avgProfit3y}
        >
          <input
            id="avgProfit3y"
            type="number"
            value={form.avgProfit3y}
            onChange={(e) => setForm({ ...form, avgProfit3y: Number(e.target.value) })}
            className={errors.avgProfit3y ? errorInputClassName : inputClassName}
          />
        </Field>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-slate-900">Priority Sector</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {SECTORS.map((sector) => {
              const checked = form.prioritySector === sector;
              return (
                <label
                  key={sector}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-4 text-sm transition ${
                    checked
                      ? 'border-[var(--primary-500)] bg-[rgba(30,58,138,0.05)] shadow-[0_10px_24px_rgba(30,58,138,0.08)]'
                      : 'border-[var(--line)] bg-white hover:border-[var(--line-strong)]'
                  }`}
                >
                  <input
                    type="radio"
                    name="sector"
                    value={sector}
                    checked={checked}
                    onChange={() => setForm({ ...form, prioritySector: sector })}
                    className="mt-1 h-4 w-4"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{sector}</p>
                    <p className="mt-1 leading-6 text-slate-600">
                      {sector === 'Deep Tech/AI' || sector === 'Climate'
                        ? 'High strategic fit with technology-led review framing.'
                        : sector === 'Women-led'
                        ? 'Use when founding control or leadership story is central.'
                        : sector === 'Rural'
                        ? 'Use when reach, adoption, or market creation is outside major metros.'
                        : 'Use when no priority bucket is a precise fit.'}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
          {errors.prioritySector ? <p className="text-sm text-[var(--danger-600)]">{errors.prioritySector}</p> : null}
        </fieldset>

        <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-muted)] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Technology Readiness Level</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">TRL scores of 4 or above usually read as stronger commercialization readiness.</p>
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[var(--primary-700)] shadow-sm">
              TRL {form.trlLevel}
            </div>
          </div>
          <input
            aria-label="TRL Level"
            type="range"
            min={1}
            max={9}
            value={form.trlLevel}
            onChange={(e) => setForm({ ...form, trlLevel: Number(e.target.value) })}
            className="mt-5 w-full"
          />
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>1: Concept</span>
            <span>5: Prototype</span>
            <span>9: Deployed</span>
          </div>
        </div>

        <fieldset className="space-y-4 rounded-[24px] border border-[var(--line)] bg-white p-5">
          <legend className="px-2 text-sm font-semibold text-slate-900">Declarations</legend>
          {([
            ['noDues', 'We have no outstanding government dues or material legal proceedings.'],
            ['notBlacklisted', 'We are not blacklisted by any government body or financial institution.'],
          ] as [keyof FinancialsData, string][]).map(([key, label]) => (
            <label key={key} className="flex items-start gap-3 rounded-2xl border border-[var(--line)] px-4 py-4">
              <input
                type="checkbox"
                checked={Boolean(form[key])}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                className="mt-1 h-4 w-4"
              />
              <span className="text-sm leading-6 text-slate-700">{label}</span>
            </label>
          ))}
          {errors.noDues || errors.notBlacklisted ? (
            <div className="flex items-center gap-2 text-sm text-[var(--danger-600)]">
              <CircleAlert size={16} />
              <span>Both declarations are required.</span>
            </div>
          ) : null}
        </fieldset>

        <div className="flex justify-between gap-3">
          <button
            onClick={() => setView('step1')}
            className="rounded-2xl border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--line-strong)]"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1E3A8A,#325EC7)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(30,58,138,0.22)] transition hover:-translate-y-0.5"
          >
            Continue to documents
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </ApplicationShell>
  );
}
