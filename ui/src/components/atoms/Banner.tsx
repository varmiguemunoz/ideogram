import { JSX } from 'react';
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

type BannerVariant = 'success' | 'error' | 'info' | 'warning';

interface BannerProps {
  variant: BannerVariant;
  message: string;
  onClose?: () => void;
  className?: string;
}

const CONTAINER_CLASSES: Record<BannerVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-red-50 text-red-600 border-red-200',
  info: 'bg-slate-50 text-slate-600 border-slate-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
};

const ICONS: Record<BannerVariant, JSX.Element> = {
  success: <FiCheckCircle size={18} className="flex-shrink-0" />,
  error: <FiAlertCircle size={18} className="flex-shrink-0" />,
  info: <FiInfo size={18} className="flex-shrink-0" />,
  warning: <FiAlertTriangle size={18} className="flex-shrink-0" />,
};

export default function Banner({
  variant,
  message,
  onClose,
  className = '',
}: BannerProps): JSX.Element {
  return (
    <div
      role="status"
      className={`flex items-center gap-2 rounded border px-3 py-2 text-sm ${CONTAINER_CLASSES[variant]} ${className}`}
    >
      {ICONS[variant]}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="flex-shrink-0 opacity-70 hover:opacity-100"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
}
