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
    return e;
  }

  function handleNext() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setData({ ...data, entity: form });
    setView('step2');
  }

  const field = (
    label: string,
    key: keyof EntityEligibilityData,
    type: string = 'text',
    placeholder = ''
  ) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={String(form[key])}
        placeholder={placeholder}
        onChange={(e) =>
          setForm({ ...form, [key]: type === 'number' ? Number(e.target.value) : e.target.value })
        }
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] ${
          errors[key] ? 'border-red-400' : 'border-gray-300'
        }`}
      />
      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#1E3A8A] text-center mb-6">TANSEED Application</h1>
        <Stepper currentStep={1} />

        <div className="bg-white rounded-2xl shadow p-8 space-y-5">
          <h2 className="text-lg font-semibold text-gray-800">Step 1: Entity & Eligibility</h2>

          {field('Entity Name *', 'entityName', 'text', 'e.g. Acme Technologies Pvt Ltd')}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Type *</label>
            <select
              value={form.registrationType}
              onChange={(e) => setForm({ ...form, registrationType: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] ${
                errors.registrationType ? 'border-red-400' : 'border-gray-300'
              }`}
            >
              <option value="">Select type…</option>
              <option>Private Limited</option>
              <option>LLP</option>
              <option>Partnership</option>
            </select>
            {errors.registrationType && <p className="text-red-500 text-xs mt-1">{errors.registrationType}</p>}
          </div>

          {field('CIN (optional)', 'cin', 'text', 'e.g. U72900TN2020PTC123456')}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <select
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] ${
                errors.location ? 'border-red-400' : 'border-gray-300'
              }`}
            >
              <option value="">Select location…</option>
              <option>Tamil Nadu</option>
              <option>Other</option>
            </select>
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
            {form.location === 'Other' && (
              <div className="flex items-center gap-2 mt-2 text-amber-600 bg-amber-50 rounded-lg px-3 py-2 text-sm">
                <AlertTriangle size={16} />
                <span>TANSEED is primarily for Tamil Nadu-based startups.</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Indian Ownership (%) *
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.indianOwnership}
              onChange={(e) => setForm({ ...form, indianOwnership: Number(e.target.value) })}
              className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] ${
                errors.indianOwnership ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.indianOwnership && <p className="text-red-500 text-xs mt-1">{errors.indianOwnership}</p>}
          </div>

          {field('TANSIM ID *', 'tansimId', 'text', 'Your TANSIM registration ID')}
          {field('DPIIT ID *', 'dpiitId', 'text', 'Your DPIIT recognition number')}

          <div className="flex justify-end pt-2">
            <button
              onClick={handleNext}
              className="bg-[#1E3A8A] hover:bg-blue-800 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              Next: Financials →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
