import AdmZip from 'adm-zip';
import type { ArchiveBuilderPort } from '../application/ports/archive-builder.port';

export class AdmZipArchiveBuilder implements ArchiveBuilderPort {
  zip(absolutePaths: string[]): Buffer {
    const archive = new AdmZip();
    for (const filePath of absolutePaths) archive.addLocalFile(filePath);
    return archive.toBuffer();
  }
}
