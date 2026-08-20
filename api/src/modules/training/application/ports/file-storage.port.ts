/**
 * Somewhere public the provider can fetch the training archive from.
 *
 * The archive is deleted again as soon as training succeeds, so this is
 * short lived scratch space rather than a durable store.
 */
export interface FileStoragePort {
  upload(pathname: string, data: Buffer, contentType: string): Promise<{ url: string }>;
  remove(url: string): Promise<void>;
}
