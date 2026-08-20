import { JSX } from 'react';
import CredentialsForm from '../organisms/CredentialsForm';
import ModelForm from '../organisms/ModelForm';

/**
 * Settings page — pure shell.
 * Composes credentials and destination-model sections with a divider.
 */
export default function SettingsPage(): JSX.Element {
  return (
    <div className="space-y-8">
      <CredentialsForm />
      <hr className="border-slate-200" />
      <ModelForm />
    </div>
  );
}
