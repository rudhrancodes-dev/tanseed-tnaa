import { useState } from 'react';
import { Upload, Link, Loader2, FileStack, FileText, CircleCheckBig } from 'lucide-react';
import ApplicationShell from './ApplicationShell';
import { Field, inputClassName } from './FormPrimitives';
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
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ApplicationShell
      title="Documents and evidence"
      description="Attach the review material needed for a faster eligibility decision and draft generation. The current prototype keeps filenames locally and sends the simplified eligibility payload to the backend."
      currentStep={3}
      aside={
        <div className="space-y-5">
          <div className="rounded-[24px] bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-3">
              <FileStack size={20} className="text-[var(--primary-700)]" />
              <p className="text-sm font-semibold text-slate-900">Suggested upload pack</p>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>Pitch deck with problem, product, and traction story.</li>
              <li>Financial model matching the stage and ticket ask.</li>
              <li>Prototype or demo video showing usability and maturity.</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex items-start gap-3">
              <CircleCheckBig size={18} className="mt-0.5 text-[var(--success-600)]" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Current backend mode</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">
                  Eligibility is computed from the simplified 5-field request contract. Upload selections stay in the UI for the review narrative and future file handling.
                </p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        <DropzoneField
          label="Pitch Deck"
          icon={<Upload size={20} />}
          accept=".pdf"
          hint="Accepted: PDF"
          value={form.pitchDeckUrl}
          onChange={(v) => setForm({ ...form, pitchDeckUrl: v })}
        />

        <DropzoneField
          label="Financial Model"
          icon={<FileText size={20} />}
          accept=".pdf,.xlsx"
          hint="Accepted: PDF, XLSX"
          value={form.financialModelUrl}
          onChange={(v) => setForm({ ...form, financialModelUrl: v })}
        />

        <Field label="Prototype Video URL" htmlFor="prototypeVideoUrl" hint="YouTube, Vimeo, or Drive link">
          <div className="relative">
            <Link size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="prototypeVideoUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={form.prototypeVideoUrl}
              onChange={(e) => setForm({ ...form, prototypeVideoUrl: e.target.value })}
              className={`${inputClassName} pl-11`}
            />
          </div>
        </Field>

        <DropzoneField
          label="Additional Documents"
          icon={<FileStack size={20} />}
          accept=".pdf,.png,.jpg,.jpeg"
          hint="Accepted: PDF, PNG, JPG"
          value={form.additionalDocsUrls.join(', ')}
          multiple
          onChange={(v) => setForm({ ...form, additionalDocsUrls: v ? v.split(', ') : [] })}
        />

        {error ? (
          <div className="rounded-2xl border border-[var(--danger-400)]/40 bg-red-50 px-5 py-4 text-sm text-[var(--danger-600)]">
            {error}
          </div>
        ) : null}

        <div className="flex justify-between gap-3">
          <button
            onClick={() => setView('step2')}
            className="rounded-2xl border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[var(--line-strong)]"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#059669,#10B981)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(5,150,105,0.22)] transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
            {submitting ? 'Checking eligibility' : 'Submit and check eligibility'}
          </button>
        </div>
      </div>
    </ApplicationShell>
  );
}

function DropzoneField({
  label,
  icon,
  accept,
  hint,
  value,
  multiple,
  onChange,
}: {
  label: string;
  icon: React.ReactNode;
  accept: string;
  hint: string;
  value: string;
  multiple?: boolean;
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
          multiple={multiple}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) onChange(files.map((file) => file.name).join(', '));
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
