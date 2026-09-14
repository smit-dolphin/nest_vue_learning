import { Inject, Injectable } from '@nestjs/common';
import type { StorageProvider } from './interfaces/storage-provider.interface.js';
import { STORAGE_PROVIDER } from './storage.constants.js';

@Injectable()
export class StorageService {
  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly provider: StorageProvider,
  ) {}

  upload(filePath: string, storageKey: string) {
    return this.provider.upload(filePath, storageKey);
  }

  delete(storageKey: string) {
    return this.provider.delete(storageKey);
  }

  exists(storageKey: string) {
    return this.provider.exists(storageKey);
  }
}