import { useState } from 'react';
import { Upload, Link, Loader2 } from 'lucide-react';
import Stepper from './Stepper';
import { useApplication } from '../context/ApplicationContext';
import { runEligibilityCheck } from '../api';
import type { DocumentsData } from '../types';

const DEFAULTS: DocumentsData = {
  pitchDeckUrl: '',
  financialModelUrl: '',
  prototypeVideoUrl: '',
  additionalDocsUrls: [],
};

export default function Step3Documents() {
  const { data, setData, setView, setResult } = useApplication();
  const [form, setForm] = useState<DocumentsData>(data.documents ?? DEFAULTS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const fullData = { ...data, documents: form };
      setData(fullData);
      const result = await runEligibilityCheck(fullData as Parameters<typeof runEligibilityCheck>[0]);
      setResult(result);
      setView('results');
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-[#1E3A8A] text-center mb-6">TANSEED Application</h1>
        <Stepper currentStep={3} />

        <div className="bg-white rounded-2xl shadow p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">Step 3: Document Upload</h2>

          <DropzoneField
            label="Pitch Deck (PDF)"
            icon={<Upload size={20} />}
            accept=".pdf"
            hint="PDF only"
            value={form.pitchDeckUrl}
            onChange={(v) => setForm({ ...form, pitchDeckUrl: v })}
          />

          <DropzoneField
            label="Financial Model (PDF / XLSX)"
            icon={<Upload size={20} />}
            accept=".pdf,.xlsx"
            hint="PDF or Excel"
            value={form.financialModelUrl}
            onChange={(v) => setForm({ ...form, financialModelUrl: v })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Link size={16} className="inline mr-1" />
              Prototype Video URL
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={form.prototypeVideoUrl}
              onChange={(e) => setForm({ ...form, prototypeVideoUrl: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
            />
            <p className="text-gray-400 text-xs mt-1">YouTube, Vimeo, or Drive link</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setView('step2')}
              className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors text-sm"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Checking Eligibility…' : 'Submit & Check Eligibility'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DropzoneField({
  label,
  icon,
  accept,
  hint,
  value,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  accept: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#1E3A8A] transition-colors cursor-pointer relative">
        <input
          type="file"
          accept={accept}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange(file.name);
          }}
        />
        <div className="flex flex-col items-center gap-2 text-gray-400">
          {icon}
          {value ? (
            <span className="text-emerald-600 font-medium text-sm">{value}</span>
          ) : (
            <>
              <span className="text-sm">Drop file here or click to browse</span>
              <span className="text-xs">{hint}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
