import { Injectable } from '@nestjs/common';
import { access, copyFile, mkdir, unlink } from 'fs/promises';
import { StorageProvider } from '../interfaces/storage-provider.interface.js';
import path from 'path';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly root = process.cwd();

  private resolveKeyToPath(storageKey: string): string {
    if (storageKey.startsWith('/uploads/')) {
      return path.join(this.root, storageKey.slice(1));
    }
    return path.isAbsolute(storageKey) ? storageKey : path.resolve(this.root, storageKey);
  }

  async upload(filePath: string, storageKey: string): Promise<string> {
    const destPath = this.resolveKeyToPath(storageKey);
    if (path.resolve(filePath) === destPath) return storageKey; // already there
    await mkdir(path.dirname(destPath), { recursive : true });
    await copyFile(filePath, destPath);
    return storageKey;
  }

  async getLocalCopy(storageKey: string) {
    return { localPath: this.resolveKeyToPath(storageKey), cleanup: async () => {} };
  }

  async delete(storageKey: string): Promise<void> {
    const absolutePath = this.resolveKeyToPath(storageKey);
    try { await unlink(absolutePath); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  }

  async exists(storageKey: string): Promise<boolean> {
    try { await access(this.resolveKeyToPath(storageKey)); return true; }
    catch { return false; }
  }

  getPublicUrl(): string | null {
    return null;
  }
}