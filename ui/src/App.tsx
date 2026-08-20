import { JSX, useState } from 'react';
import TrainingPage from './components/pages/TrainingPage';
import GenerationPage from './components/pages/GenerationPage';
import SettingsPage from './components/pages/SettingsPage';
import { useBootstrap } from './hooks/useBootstrap';

const TABS = [
  { key: 'training',   label: 'Training'  },
  { key: 'generation', label: 'Generate'  },
  { key: 'settings',   label: 'Settings'  },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export default function App(): JSX.Element {
  const [active, setActive] = useState<TabKey>('training');

  // Loads training and credential state into the store and keeps it fresh.
  useBootstrap();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-6 py-8">

        {/* App header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Content Generation App</h1>
          <p className="text-sm text-slate-500 mt-0.5">Generate your Personal images</p>
        </header>

        {/* Tab nav */}
        <nav className="flex gap-1 mb-8 border-b border-slate-200" aria-label="Main navigation">
          {TABS.map((tab) => {
            const isActive = active === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                aria-current={isActive ? 'page' : undefined}
                className={[
                  'px-4 py-2 text-sm font-medium rounded-t transition-colors',
                  isActive
                    ? 'text-slate-900 border-b-2 border-slate-900 -mb-px bg-white'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
                ].join(' ')}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Page content */}
        <main>
          {active === 'training'   && <TrainingPage />}
          {active === 'generation' && <GenerationPage />}
          {active === 'settings'   && <SettingsPage />}
        </main>

      </div>
    </div>
  );
}
