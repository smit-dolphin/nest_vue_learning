export interface StorageProvider {
  upload(filePath: string, storageKey: string): Promise<string>;

  delete(storageKey: string): Promise<void>;

  exists(storageKey: string): Promise<boolean>;

  getLocalPath(storageKey:string) : Promise<string>

   downloadToLocal(storageKey: string): Promise<string>;
}