import { Injectable } from '@nestjs/common';
import { access, copyFile } from 'fs/promises';
import { StorageProvider } from '../interfaces/storage-provider.interface.js';
import { unlink } from 'fs/promises';
import path from 'path';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  async upload(
    filePath: string,
    storageKey: string,
  ): Promise<string> {
    await copyFile(filePath, storageKey);

    return storageKey;
  }


  async delete(storageKey: string): Promise<void> {
      await unlink(storageKey);
  }

  async exists(storageKey: string): Promise<boolean> {
      try {
        await access(storageKey)
        return true
      } catch (error) {
        return false
      }
  }


  async getLocalPath(storageKey: string): Promise<string> {
    return path.resolve(process.cwd(),'uploads',storageKey);
  }


  async downloadToLocal(storageKey: string): Promise<string> {
    return path.resolve(process.cwd(),'uploads',storageKey);
  }

}