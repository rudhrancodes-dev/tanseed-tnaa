import { useState } from 'react';
import { AlertTriangle, BadgeCheck, Building2, MapPin, ShieldCheck } from 'lucide-react';
import ApplicationShell from './ApplicationShell';
import { Field, errorInputClassName, inputClassName } from './FormPrimitives';
import { useApplication } from '../context/ApplicationContext';
import type { EntityEligibilityData } from '../types';

const DEFAULTS: EntityEligibilityData = {
  entityName: '',
  registrationType: '',
  cin: '',
  location: '',
  indianOwnership: 100,
  tansimId: '',
  dpiitId: '',
  employees: 1,
  description: '',
};

export default function Step1EntityEligibility() {
  const { data, setData, setView } = useApplication();
  const [form, setForm] = useState<EntityEligibilityData>(data.entity ?? DEFAULTS);
  const [errors, setErrors] = useState<Partial<Record<keyof EntityEligibilityData, string>>>({});

  function validate() {
    const e: typeof errors = {};
    if (!form.entityName.trim()) e.entityName = 'Entity name is required';
    if (!form.registrationType) e.registrationType = 'Registration type is required';
    if (!form.location) e.location = 'Location is required';
    if (form.indianOwnership < 51) e.indianOwnership = 'Must be ≥ 51%';
    if (!form.tansimId.trim()) e.tansimId = 'TANSIM ID is required';
    if (!form.dpiitId.trim()) e.dpiitId = 'DPIIT ID is required';
    if (form.employees < 1) e.employees = 'Must be at least 1';
    if (form.description.length < 20) e.description = 'Description must be at least 20 characters';
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setData({ ...data, entity: form });
    setView('step2');
  }

  return (
    <ApplicationShell
      title="Entity and eligibility screening"
      description="Capture the legal and operating details TANSEED needs for an initial fit check. Required fields are validated before the portal moves to financial review."
      currentStep={1}
      aside={
        <div className="space-y-5">
          <div className="rounded-[24px] bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-700)]/10 text-[var(--primary-700)]">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">What is checked here</p>
                <p className="text-sm text-slate-600">Entity type, Tamil Nadu fit, promoter ownership, and startup registrations.</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 rounded-[24px] border border-[var(--line)] bg-white/75 p-5">
            {[
              ['Tamil Nadu presence', 'Primary preference for TN-based startups.'],
              ['Indian ownership', 'Minimum 51% promoter ownership.'],
              ['Recognitions', 'TANSIM and DPIIT identifiers should be ready.'],
            ].map(([title, copy]) => (
              <div key={title} className="flex items-start gap-3">
                <BadgeCheck size={18} className="mt-0.5 text-[var(--success-600)]" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="text-sm leading-6 text-slate-600">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Entity Name" htmlFor="entityName" error={errors.entityName}>
            <input
              id="entityName"
              type="text"
              value={form.entityName}
              placeholder="Acme Technologies Pvt Ltd"
              onChange={(e) => setForm({ ...form, entityName: e.target.value })}
              className={errors.entityName ? errorInputClassName : inputClassName}
            />
          </Field>

          <Field label="Registration Type" htmlFor="registrationType" error={errors.registrationType}>
            <select
              id="registrationType"
              value={form.registrationType}
              onChange={(e) => setForm({ ...form, registrationType: e.target.value })}
              className={errors.registrationType ? errorInputClassName : inputClassName}
            >
              <option value="">Select entity type</option>
              <option>Private Limited</option>
              <option>LLP</option>
              <option>Partnership</option>
            </select>
          </Field>

          <Field label="CIN" htmlFor="cin" hint="Optional">
            <input
              id="cin"
              type="text"
              value={form.cin}
              placeholder="U72900TN2020PTC123456"
              onChange={(e) => setForm({ ...form, cin: e.target.value })}
              className={inputClassName}
            />
          </Field>

          <Field label="Location" htmlFor="location" error={errors.location}>
            <select
              id="location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={errors.location ? errorInputClassName : inputClassName}
            >
              <option value="">Choose registered state</option>
              <option>Tamil Nadu</option>
              <option>Other</option>
            </select>
          </Field>
        </div>

        {form.location === 'Other' ? (
          <div className="flex items-start gap-3 rounded-2xl border border-[var(--warning-600)]/15 bg-[var(--warning-100)]/55 px-4 py-4 text-sm text-amber-900">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-[var(--warning-600)]" />
            <div>
              <p className="font-semibold">Tamil Nadu preference warning</p>
              <p className="mt-1 leading-6">
                TANSEED primarily supports Tamil Nadu startups. Continue if your registered entity is elsewhere but the operating footprint is still relevant.
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Indian Ownership (%)" htmlFor="indianOwnership" error={errors.indianOwnership}>
            <input
              id="indianOwnership"
              type="number"
              min={0}
              max={100}
              value={form.indianOwnership}
              onChange={(e) => setForm({ ...form, indianOwnership: Number(e.target.value) })}
              className={errors.indianOwnership ? errorInputClassName : inputClassName}
            />
          </Field>

          <Field label="Employees" htmlFor="employees" error={errors.employees}>
            <input
              id="employees"
              type="number"
              min={1}
              value={form.employees}
              onChange={(e) => setForm({ ...form, employees: Number(e.target.value) })}
              className={errors.employees ? errorInputClassName : inputClassName}
            />
          </Field>

          <Field label="TANSIM ID" htmlFor="tansimId" error={errors.tansimId}>
            <input
              id="tansimId"
              type="text"
              value={form.tansimId}
              placeholder="StartupTN or TANSIM registration ID"
              onChange={(e) => setForm({ ...form, tansimId: e.target.value })}
              className={errors.tansimId ? errorInputClassName : inputClassName}
            />
          </Field>

          <Field label="DPIIT ID" htmlFor="dpiitId" error={errors.dpiitId}>
            <input
              id="dpiitId"
              type="text"
              value={form.dpiitId}
              placeholder="DPIIT recognition number"
              onChange={(e) => setForm({ ...form, dpiitId: e.target.value })}
              className={errors.dpiitId ? errorInputClassName : inputClassName}
            />
          </Field>
        </div>

        <Field
          label="Startup Description"
          htmlFor="description"
          hint="Minimum 20 characters"
          error={errors.description}
        >
          <textarea
            id="description"
            rows={5}
            value={form.description}
            placeholder="Describe the innovation, customer problem, and why your solution matters."
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className={errors.description ? `${errorInputClassName} resize-y` : `${inputClassName} resize-y`}
          />
        </Field>

        <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-muted)] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary-700)] text-white">
              <ShieldCheck size={20} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">Review guidance</p>
              <p className="text-sm leading-6 text-slate-600">
                Use the same entity details that appear on the incorporation and startup recognition records to reduce clarification loops during review.
              </p>
            </div>
            <MapPin size={18} className="ml-auto hidden text-slate-400 md:block" />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#1E3A8A,#325EC7)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(30,58,138,0.22)] transition hover:-translate-y-0.5"
          >
            Continue to financials
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </ApplicationShell>
  );
}
