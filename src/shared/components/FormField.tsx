import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export const FormField = ({ label, hint, required, children }: FormFieldProps) => (
  <label className="block">
    <span className="mb-1.5 block text-sm font-medium text-gold-200">
      {label}
      {required && <span className="ml-1 text-ember-500">*</span>}
    </span>
    {children}
    {hint && <span className="mt-1 block text-xs text-jade-500 italic">{hint}</span>}
  </label>
);

export const TextInput = ({
  className = '',
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...rest}
    className={`w-full rounded-md border bg-ink-700/60 px-3 py-2 text-gold-100 placeholder:text-jade-700 focus:border-gold-500 focus:outline-none ${className}`}
    style={{ borderColor: 'var(--border-gold-subtle)' }}
  />
);

export const TextArea = ({
  className = '',
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...rest}
    className={`w-full rounded-md border bg-ink-700/60 px-3 py-2 text-gold-100 placeholder:text-jade-700 focus:border-gold-500 focus:outline-none ${className}`}
    style={{ borderColor: 'var(--border-gold-subtle)' }}
    rows={rest.rows ?? 3}
  />
);

export const Select = ({
  className = '',
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    {...rest}
    className={`w-full rounded-md border bg-ink-700/60 px-3 py-2 text-gold-100 focus:border-gold-500 focus:outline-none ${className}`}
    style={{ borderColor: 'var(--border-gold-subtle)' }}
  >
    {children}
  </select>
);
