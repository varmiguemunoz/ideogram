import * as fs from 'node:fs';
import type { FileSystemPort } from '../application/ports/file-system.port';

export class NodeFileSystemAdapter implements FileSystemPort {
  isReadableFile(absolutePath: string): boolean {
    try {
      return fs.statSync(absolutePath).isFile();
    } catch {
      return false;
    }
  }

  readFile(absolutePath: string): Buffer {
    return fs.readFileSync(absolutePath);
  }
}
