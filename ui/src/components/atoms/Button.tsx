import { JSX } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    'bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed',
  secondary:
    'bg-slate-200 text-slate-800 hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed',
};

export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center px-4 py-1.5 rounded text-sm font-medium transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
