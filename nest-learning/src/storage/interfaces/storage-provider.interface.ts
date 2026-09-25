export interface StorageProvider {
  upload(filePath: string, storageKey: string): Promise<string>;

  getLocalCopy(
    storageKey: string,
    workDir?: string,
  ): Promise<{
    localPath: string;
    cleanup: () => Promise<void>;
  }>;

  delete(storageKey: string): Promise<void>;

  exists(storageKey: string): Promise<boolean>;

  /* Returns a publicly accessible delivery URL for a stored file when the
     provider can serve it directly (e.g. Cloudinary CDN), otherwise null. */
  getPublicUrl(storageKey: string): string | null;
}
