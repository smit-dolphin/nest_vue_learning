export interface StorageProvider {
    upload(filePath: string, storageKey: string): Promise<string>;
 
  getLocalCopy(storageKey: string, workDir?: string): Promise<{
    localPath: string;
    cleanup: () => Promise<void>;
  }>;

  delete(storageKey: string): Promise<void>;

  exists(storageKey: string): Promise<boolean>;
}