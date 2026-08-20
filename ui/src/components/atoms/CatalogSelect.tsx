import { JSX } from 'react';

export interface CatalogOption<T extends string> {
  id: T;
  label: string;
}

interface CatalogSelectProps<T extends string> {
  label: string;
  value: T;
  options: CatalogOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  id?: string;
}

/**
 * A typed select element driven by a plugin catalog.
 * Options come from scenarioCatalog or framingCatalog — no hardcoded values.
 */
export function CatalogSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  id,
}: CatalogSelectProps<T>): JSX.Element {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className="block w-full rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-50 disabled:text-slate-400"
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CatalogSelect;
