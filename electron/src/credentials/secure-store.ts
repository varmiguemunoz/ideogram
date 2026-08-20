import { err, ok, type Result } from '../result';

export interface CredentialsFile {
  replicate: string;
  blob: string;
}

export interface SafeStorageAvailabilityPort {
  isEncryptionAvailable(): boolean;
  platform: NodeJS.Platform | string;
  getSelectedStorageBackend?(): string;
}

export interface SecureStorePorts extends SafeStorageAvailabilityPort {
  encrypt(plainText: string): Buffer;
  decrypt(buffer: Buffer): string;
  readFile(): Buffer | null;
  writeFile(buffer: Buffer): void;
}

export interface CodecPort {
  encrypt(plainText: string): Buffer;
  decrypt(buffer: Buffer): string;
}

/**
 * On Linux, safeStorage can silently fall back to a plaintext backend. That
 * is not secure storage, so it is treated as unavailable rather than quietly
 * writing tokens in the clear.
 */
export function isSafeStorageAvailable(port: SafeStorageAvailabilityPort): boolean {
  if (!port.isEncryptionAvailable()) return false;
  if (port.platform === 'linux' && port.getSelectedStorageBackend?.() === 'basic_text') {
    return false;
  }
  return true;
}

export function encodeCredentials(creds: CredentialsFile, port: CodecPort): Buffer {
  const json = JSON.stringify(creds);
  const encoded = Buffer.from(json, 'utf-8').toString('base64');
  return port.encrypt(encoded);
}

export function decodeCredentials(buffer: Buffer, port: CodecPort): CredentialsFile {
  const encoded = port.decrypt(buffer);
  // Must be 'base64' to undo encodeCredentials. Reading this back as 'utf-8'
  // is an identity operation, which left JSON.parse receiving base64 text and
  // throwing, so a saved credentials file could never be read on the next
  // launch.
  const json = Buffer.from(encoded, 'base64').toString('utf-8');
  return JSON.parse(json) as CredentialsFile;
}

export function saveCredentials(creds: CredentialsFile, ports: SecureStorePorts): Result<void> {
  if (!isSafeStorageAvailable(ports)) {
    return err('E_NO_KEYCHAIN', 'Secure credential storage is not available on this system.');
  }
  ports.writeFile(encodeCredentials(creds, ports));
  return ok(undefined);
}

/**
 * Never throws. A corrupt or unreadable credentials file is reported as a
 * Result, because the previous behaviour of letting it throw took down the
 * whole app-ready handler.
 */
export function loadCredentials(ports: SecureStorePorts): Result<CredentialsFile | null> {
  if (!isSafeStorageAvailable(ports)) {
    return err('E_NO_KEYCHAIN', 'Secure credential storage is not available on this system.');
  }

  const buffer = ports.readFile();
  if (buffer === null) return ok(null);

  try {
    return ok(decodeCredentials(buffer, ports));
  } catch {
    return err('E_NO_KEYCHAIN', 'Stored credentials could not be read. Please enter them again.');
  }
}

export function credentialsStatus(
  ports: SecureStorePorts,
): Result<{ replicate: boolean; blob: boolean }> {
  const loaded = loadCredentials(ports);
  if (!loaded.ok) return loaded;

  return ok({
    replicate: Boolean(loaded.value?.replicate),
    blob: Boolean(loaded.value?.blob),
  });
}
