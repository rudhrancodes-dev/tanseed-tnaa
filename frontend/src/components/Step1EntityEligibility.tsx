import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Stepper from './Stepper';
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

const inputBase: React.CSSProperties = {
  width: '100%',
  border: '1px solid rgba(0,0,0,0.1)',
  borderRadius: '14px',
  padding: '12px 16px',
  fontSize: '14px',
  color: '#1D1D1F',
  background: '#FFFFFF',
  outline: 'none',
  transition: 'box-shadow 0.15s ease, border-color 0.15s ease, transform 0.15s ease',
};

const inputError: React.CSSProperties = {
  ...inputBase,
  borderColor: '#FF3B30',
};

function FormInput({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: '#1D1D1F', letterSpacing: '-0.01em' }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs mt-1.5" style={{ color: '#FF3B30' }}>
          {error}
        </p>
      )}
    </div>
  );
}

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

  function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(67,56,202,0.18)';
    e.currentTarget.style.borderColor = '#4338CA';
  }
  function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, hasError: boolean) {
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.borderColor = hasError ? '#FF3B30' : 'rgba(0,0,0,0.1)';
  }

  return (
    <div className="min-h-screen" style={{ background: '#FBFBFB' }}>
      <div className="max-w-2xl mx-auto px-6 py-14">
        <h1
          className="text-2xl font-semibold text-center mb-8"
          style={{ color: '#1D1D1F', letterSpacing: '-0.02em' }}
        >
          TANSEED Application
        </h1>
        <Stepper currentStep={1} />

        <div
          className="rounded-3xl p-10 space-y-6"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 8px 40px rgba(0,0,0,0.07)',
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: '#1D1D1F', letterSpacing: '-0.015em' }}
          >
            Step 1: Entity & Eligibility
          </h2>

          <FormInput label="Entity Name *" error={errors.entityName}>
            <input
              type="text"
              value={form.entityName}
              placeholder="e.g. Acme Technologies Pvt Ltd"
              onChange={(e) => setForm({ ...form, entityName: e.target.value })}
              style={errors.entityName ? inputError : inputBase}
              onFocus={focusStyle}
              onBlur={(e) => blurStyle(e, !!errors.entityName)}
            />
          </FormInput>

          <FormInput label="Registration Type *" error={errors.registrationType}>
            <select
              value={form.registrationType}
              onChange={(e) => setForm({ ...form, registrationType: e.target.value })}
              style={errors.registrationType ? inputError : inputBase}
              onFocus={focusStyle}
              onBlur={(e) => blurStyle(e, !!errors.registrationType)}
            >
              <option value="">Select type…</option>
              <option>Private Limited</option>
              <option>LLP</option>
              <option>Partnership</option>
            </select>
          </FormInput>

          <FormInput label="CIN (optional)">
            <input
              type="text"
              value={form.cin}
              placeholder="e.g. U72900TN2020PTC123456"
              onChange={(e) => setForm({ ...form, cin: e.target.value })}
              style={inputBase}
              onFocus={focusStyle}
              onBlur={(e) => blurStyle(e, false)}
            />
          </FormInput>

          <FormInput label="Location *" error={errors.location}>
            <select
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              style={errors.location ? inputError : inputBase}
              onFocus={focusStyle}
              onBlur={(e) => blurStyle(e, !!errors.location)}
            >
              <option value="">Select location…</option>
              <option>Tamil Nadu</option>
              <option>Other</option>
            </select>
            {form.location === 'Other' && (
              <div
                className="flex items-center gap-2 mt-3 px-4 py-3 rounded-2xl text-sm"
                style={{ background: '#FFF8EC', color: '#92570F' }}
              >
                <AlertTriangle size={15} />
                <span>TANSEED is primarily for Tamil Nadu-based startups.</span>
              </div>
            )}
          </FormInput>

          <FormInput label="Indian Ownership (%) *" error={errors.indianOwnership}>
            <input
              type="number"
              min={0}
              max={100}
              value={form.indianOwnership}
              onChange={(e) => setForm({ ...form, indianOwnership: Number(e.target.value) })}
              style={errors.indianOwnership ? inputError : inputBase}
              onFocus={focusStyle}
              onBlur={(e) => blurStyle(e, !!errors.indianOwnership)}
            />
          </FormInput>

          <FormInput label="TANSIM ID *" error={errors.tansimId}>
            <input
              type="text"
              value={form.tansimId}
              placeholder="Your TANSIM registration ID"
              onChange={(e) => setForm({ ...form, tansimId: e.target.value })}
              style={errors.tansimId ? inputError : inputBase}
              onFocus={focusStyle}
              onBlur={(e) => blurStyle(e, !!errors.tansimId)}
            />
          </FormInput>

          <FormInput label="DPIIT ID *" error={errors.dpiitId}>
            <input
              type="text"
              value={form.dpiitId}
              placeholder="Your DPIIT recognition number"
              onChange={(e) => setForm({ ...form, dpiitId: e.target.value })}
              style={errors.dpiitId ? inputError : inputBase}
              onFocus={focusStyle}
              onBlur={(e) => blurStyle(e, !!errors.dpiitId)}
            />
          </FormInput>

          <FormInput label="Employees *" error={errors.employees}>
            <input
              type="number"
              value={form.employees}
              placeholder="Number of employees"
              onChange={(e) => setForm({ ...form, employees: Number(e.target.value) })}
              style={errors.employees ? inputError : inputBase}
              onFocus={focusStyle}
              onBlur={(e) => blurStyle(e, !!errors.employees)}
            />
          </FormInput>

          <FormInput label="Description *" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{
                ...(errors.description ? inputError : inputBase),
                resize: 'vertical',
              }}
              rows={3}
              placeholder="Describe your innovation..."
              onFocus={focusStyle}
              onBlur={(e) => blurStyle(e, !!errors.description)}
            />
          </FormInput>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white rounded-2xl transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #4338CA 0%, #3730A3 100%)',
                boxShadow: '0 4px 20px rgba(67,56,202,0.3)',
                letterSpacing: '-0.01em',
              }}
            >
              Next: Financials →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
