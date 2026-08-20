/** Bundles the training photos into the single archive the provider expects. */
export interface ArchiveBuilderPort {
  zip(absolutePaths: string[]): Buffer;
}
