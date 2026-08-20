import { JSX } from 'react';

interface PageTitleProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTitle({ children, className = '' }: PageTitleProps): JSX.Element {
  return (
    <h2 className={`text-xl font-semibold text-slate-900 mb-4 ${className}`}>
      {children}
    </h2>
  );
}
