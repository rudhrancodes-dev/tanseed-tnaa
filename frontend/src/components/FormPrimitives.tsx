import type { ReactNode } from 'react';

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-900">
          {label}
        </label>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
      {error ? <p className="text-sm text-[var(--danger-600)]">{error}</p> : null}
    </div>
  );
}

export const inputClassName =
  'w-full rounded-2xl border border-[var(--line-strong)] bg-white px-4 py-3 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.02)] outline-none transition focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[color:rgba(30,58,138,0.12)]';

export const errorInputClassName =
  'w-full rounded-2xl border border-[var(--danger-400)] bg-white px-4 py-3 text-sm text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.02)] outline-none transition focus:border-[var(--danger-500)] focus:ring-4 focus:ring-[color:rgba(220,38,38,0.12)]';
