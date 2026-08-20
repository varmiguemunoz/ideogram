import { del, put } from '@vercel/blob';
import { UpstreamError } from '../../../shared/domain/domain.error';
import type { FileStoragePort } from '../application/ports/file-storage.port';

/**
 * The token is read lazily through a getter rather than captured at
 * construction, because Electron may push credentials after the container has
 * already been built.
 */
export class VercelBlobFileStorage implements FileStoragePort {
  constructor(private readonly tokenProvider: () => string) {}

  async upload(pathname: string, data: Buffer, contentType: string): Promise<{ url: string }> {
    try {
      const result = await put(pathname, data, {
        access: 'public',
        token: this.tokenProvider(),
        addRandomSuffix: true,
        contentType,
      });
      return { url: result.url };
    } catch (e) {
      throw new UpstreamError(e instanceof Error ? e.message : 'Blob upload failed');
    }
  }

  async remove(url: string): Promise<void> {
    try {
      await del(url, { token: this.tokenProvider() });
    } catch (e) {
      throw new UpstreamError(e instanceof Error ? e.message : 'Blob delete failed');
    }
  }
}
