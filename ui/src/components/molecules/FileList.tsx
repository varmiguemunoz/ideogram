import { JSX } from 'react';
import { CiCircleRemove } from "react-icons/ci";
import { FiRotateCw } from "react-icons/fi";

interface FileListProps {
  fileNames: string[];
  onRemove: (index: number) => void;
  removingIndex?: number | null;
}

/**
 * Displays the list of selected photo file names.
 * Renders nothing when the list is empty.
 */
export default function FileList({ fileNames, onRemove, removingIndex }: FileListProps): JSX.Element | null {
  if (fileNames.length === 0) return null;

  function handleRemove(index: number) {
    onRemove(index);
  }

  return (
    <ul className="rounded border border-slate-200 bg-slate-50 divide-y divide-slate-100">
      {fileNames.map((name, index) => (
        <li key={`${name}-${index}`} className="px-3 py-1.5 flex items-center justify-between text-sm text-slate-700 truncate">
          {name}
          <button
            onClick={() => handleRemove(index)}
            disabled={removingIndex === index}
            className="p-1 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-wait"
            aria-label={`Remove ${name}`}
          >
            {removingIndex === index ? <FiRotateCw size={18} className="animate-spin" /> : <CiCircleRemove size={24} />}
          </button>
        </li>
      ))}
    </ul>
  );
}
