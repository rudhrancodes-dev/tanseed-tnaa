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
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
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
        <Stepper currentStep={3} />

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
            Step 3: Document Upload
          </h2>

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
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: '#1D1D1F', letterSpacing: '-0.01em' }}
            >
              <Link size={14} className="inline mr-1.5 align-middle" />
              Prototype Video URL
            </label>
            <input
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={form.prototypeVideoUrl}
              onChange={(e) => setForm({ ...form, prototypeVideoUrl: e.target.value })}
              style={inputBase}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(67,56,202,0.18)';
                e.currentTarget.style.borderColor = '#4338CA';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
              }}
            />
            <p className="text-xs mt-1.5" style={{ color: '#9898A0' }}>YouTube, Vimeo, or Drive link</p>
          </div>

          {error && (
            <div
              className="px-5 py-4 rounded-2xl text-sm"
              style={{ background: '#FFF1F0', border: '1px solid #FFCDD2', color: '#C0392B' }}
            >
              {error}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setView('step2')}
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
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold text-white rounded-2xl transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                boxShadow: '0 4px 20px rgba(5,150,105,0.3)',
                letterSpacing: '-0.01em',
              }}
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
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
  const [hovered, setHovered] = useState(false);

  return (
    <div>
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: '#1D1D1F', letterSpacing: '-0.01em' }}
      >
        {label}
      </label>
      <div
        className="relative flex flex-col items-center justify-center p-8 rounded-2xl cursor-pointer transition-all duration-200"
        style={{
          border: hovered ? '2px dashed #4338CA' : `2px dashed ${value ? '#059669' : 'rgba(0,0,0,0.12)'}`,
          background: hovered ? 'rgba(67,56,202,0.03)' : value ? 'rgba(5,150,105,0.03)' : '#FBFBFB',
          transform: hovered ? 'scale(1.005)' : 'scale(1)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <input
          type="file"
          accept={accept}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange(file.name);
          }}
        />
        <div className="flex flex-col items-center gap-2" style={{ color: value ? '#059669' : '#9898A0' }}>
          {icon}
          {value ? (
            <span className="text-sm font-medium" style={{ color: '#059669' }}>{value}</span>
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
