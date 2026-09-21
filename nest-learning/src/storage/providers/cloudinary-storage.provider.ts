import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { createWriteStream, existsSync } from 'fs';
import { mkdir, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

import { StorageProvider } from '../interfaces/storage-provider.interface.js';

@Injectable()
export class CloudinaryStorageProvider implements StorageProvider {
    private readonly logger = new Logger(CloudinaryStorageProvider.name);
    private readonly tempRoot = path.join(os.tmpdir(), 'subtitle-app');
    private readonly localRoot = process.cwd();

    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    /**
     * Upload a local file to Cloudinary.
     * Returns the canonical storageKey (e.g. /uploads/videos/xxx.mp4)
     * so it remains 100% compatible with LocalStorageProvider and SubtitleService.
     */
    async upload(
        filePath: string,
        storageKey: string,
    ): Promise<string> {
        const normalizedKey = this.normalizeStorageKey(storageKey);
        const resourceType = this.getResourceType(normalizedKey);
        const publicId = this.storageKeyToPublicId(normalizedKey, resourceType);

        await cloudinary.uploader.upload(filePath, {
            public_id: publicId,
            resource_type: resourceType,
            overwrite: true,
        });

        return storageKey;
    }

    /**
     * Download a Cloudinary file to a local file for processing (FFmpeg, Whisper, etc.)
     * or return existing local copy if already on disk.
     */
    async getLocalCopy(
        storageKey: string,
        workDir?: string,
    ): Promise<{
        localPath: string;
        cleanup: () => Promise<void>;
    }> {
        // Fast path: if the file already exists locally, reuse it directly
        const localCandidate = this.resolveLocalCandidatePath(storageKey);
        if (localCandidate && existsSync(localCandidate)) {
            return {
                localPath: localCandidate,
                cleanup: async () => {
                    // Do not delete persistent local files
                },
            };
        }

        const targetDir = workDir || this.tempRoot;
        await mkdir(targetDir, { recursive: true });

        const normalizedKey = this.normalizeStorageKey(storageKey);
        const resourceType = this.getResourceType(normalizedKey);
        const publicId = this.storageKeyToPublicId(normalizedKey, resourceType);

        const rawExt = path.extname(normalizedKey);
        const extension = rawExt || (resourceType === 'video' ? '.mp4' : resourceType === 'raw' ? '.srt' : '');
        const tempFileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${extension}`;
        const localPath = path.join(targetDir, tempFileName);

        // Build valid Cloudinary delivery URL with the proper resource_type
        let downloadUrl: string;
        if (resourceType === 'raw') {
            downloadUrl = cloudinary.url(publicId, {
                resource_type: 'raw',
                secure: true,
            });
        } else {
            const format = extension ? extension.replace(/^\./, '') : undefined;
            downloadUrl = cloudinary.url(publicId, {
                resource_type: resourceType,
                secure: true,
                format,
            });
        }

        let response = await fetch(downloadUrl);

        // Fallback: query resource details from Cloudinary API if direct URL was not reachable
        if (!response.ok || !response.body) {
            try {
                const resource = await cloudinary.api.resource(publicId, {
                    resource_type: resourceType,
                });
                if (resource?.secure_url) {
                    downloadUrl = resource.secure_url;
                    response = await fetch(downloadUrl);
                }
            } catch (err) {
                this.logger.debug(`Fallback resource lookup failed: ${err}`);
            }
        }

        if (!response.ok || !response.body) {
            throw new Error(
                `Failed to download file from Cloudinary: ${response.status} ${response.statusText} (${downloadUrl})`,
            );
        }

        await this.saveStreamToFile(response.body, localPath);

        return {
            localPath,
            cleanup: async () => {
                try {
                    await unlink(localPath);
                } catch (error) {
                    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                        throw error;
                    }
                }
            },
        };
    }

    /**
     * Delete a file from Cloudinary (and any matching local file if present).
     */
    async delete(storageKey: string): Promise<void> {
        // Delete local copy if present
        const localCandidate = this.resolveLocalCandidatePath(storageKey);
        if (localCandidate && existsSync(localCandidate)) {
            try {
                await unlink(localCandidate);
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
            }
        }

        const normalizedKey = this.normalizeStorageKey(storageKey);
        const resourceType = this.getResourceType(normalizedKey);
        const publicId = this.storageKeyToPublicId(normalizedKey, resourceType);

        try {
            await cloudinary.uploader.destroy(publicId, {
                resource_type: resourceType,
                invalidate: true,
            });
        } catch {
            // If destruction failed under detected resource type, try raw or video before giving up
            const altType = resourceType === 'video' ? 'raw' : 'video';
            try {
                await cloudinary.uploader.destroy(publicId, {
                    resource_type: altType,
                    invalidate: true,
                });
            } catch {
                // Silently ignore deletion failures for already-removed files
            }
        }
    }

    /**
     * Check whether a file exists on Cloudinary or in local storage.
     */
    async exists(storageKey: string): Promise<boolean> {
        const localCandidate = this.resolveLocalCandidatePath(storageKey);
        if (localCandidate && existsSync(localCandidate)) {
            return true;
        }

        const normalizedKey = this.normalizeStorageKey(storageKey);
        const resourceType = this.getResourceType(normalizedKey);
        const publicId = this.storageKeyToPublicId(normalizedKey, resourceType);

        try {
            await cloudinary.api.resource(publicId, {
                resource_type: resourceType,
            });
            return true;
        } catch {
            // Try alternate type if video/raw distinction had mismatch
            try {
                const altType = resourceType === 'video' ? 'raw' : 'video';
                await cloudinary.api.resource(publicId, {
                    resource_type: altType,
                });
                return true;
            } catch {
                return false;
            }
        }
    }

    /**
     * Determine Cloudinary resource_type:
     * - 'video': videos and audio (Cloudinary stores all audio under video)
     * - 'raw': subtitles, sidecars, json, text files
     * - 'image': image files
     */
    private getResourceType(storageKey: string): 'video' | 'raw' | 'image' {
        const ext = path.extname(storageKey).toLowerCase();

        const videoAudioExts = [
            '.mp4', '.webm', '.mkv', '.avi', '.mov', '.flv', '.m4v', '.wmv',
            '.wav', '.mp3', '.ogg', '.m4a', '.aac', '.flac', '.wma',
        ];
        if (videoAudioExts.includes(ext)) {
            return 'video';
        }

        const rawExts = [
            '.srt', '.vtt', '.json', '.wts', '.txt', '.ass', '.ssa', '.sub', '.xml', '.csv',
        ];
        if (rawExts.includes(ext)) {
            return 'raw';
        }

        const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        if (imageExts.includes(ext)) {
            return 'image';
        }

        // Path-based inference if extension is missing
        const lower = storageKey.toLowerCase();
        if (lower.includes('/video') || lower.includes('/audio') || lower.includes('/output')) {
            return 'video';
        }
        if (lower.includes('/subtitle') || lower.includes('wts')) {
            return 'raw';
        }

        return 'raw';
    }

    /**
     * Normalize storageKey whether it is passed as:
     * - '/uploads/videos/abc.mp4'
     * - 'uploads/videos/abc.mp4'
     * - '/home/user/project/uploads/videos/abc.mp4'
     * - Full Cloudinary URL
     */
    private normalizeStorageKey(storageKey: string): string {
        let key = storageKey.trim();

        // Extract relative key if full filesystem path was passed
        const uploadsIndex = key.indexOf('uploads/');
        if (uploadsIndex !== -1) {
            key = key.slice(uploadsIndex);
        }

        return key.replace(/^\/+/, '');
    }

    /**
     * Convert storageKey into Cloudinary public_id:
     * - For 'raw': retain extension (Cloudinary raw files require extension in public_id)
     * - For 'video' & 'image': strip extension (Cloudinary appends format to delivery URLs)
     */
    private storageKeyToPublicId(
        storageKey: string,
        resourceType: 'video' | 'raw' | 'image',
    ): string {
        let key = this.normalizeStorageKey(storageKey);

        if (resourceType === 'raw') {
            return key;
        }

        // Strip file extension for video and image
        return key.replace(/\.[^/.]+$/, '');
    }

    /**
     * Check if a storageKey corresponds to a local disk path and return that path.
     *
     * IMPORTANT: Logical storage keys like '/uploads/videos/xxx.mp4' start with '/'
     * which makes path.isAbsolute() return true on Linux, but they are NOT real OS
     * absolute paths — they live at {cwd}/uploads/... on local storage.
     * We must detect this case and resolve correctly relative to cwd.
     */
    private resolveLocalCandidatePath(storageKey: string): string | null {
        // Logical storage keys — always resolve relative to cwd.
        if (storageKey.startsWith('/uploads/') || storageKey.startsWith('uploads/')) {
            const cleanKey = storageKey.startsWith('/') ? storageKey.slice(1) : storageKey;
            return path.resolve(this.localRoot, cleanKey);
        }

        // Truly absolute OS paths (e.g. temp/work-dir files passed directly).
        if (path.isAbsolute(storageKey)) {
            return storageKey;
        }

        // Relative path — resolve against cwd.
        return path.resolve(this.localRoot, storageKey);
    }

    /**
     * Return a signed/unsigned Cloudinary delivery URL for a storage key.
     * Useful for HTTP redirects or generating public links without a local copy.
     */
    getUrl(storageKey: string): string {
        const normalizedKey = this.normalizeStorageKey(storageKey);
        const resourceType = this.getResourceType(normalizedKey);
        const publicId = this.storageKeyToPublicId(normalizedKey, resourceType);
        const ext = path.extname(normalizedKey);

        if (resourceType === 'raw') {
            return cloudinary.url(publicId, { resource_type: 'raw', secure: true });
        }

        const format = ext ? ext.replace(/^\./, '') : undefined;
        return cloudinary.url(publicId, { resource_type: resourceType, secure: true, format });
    }

    /**
     * Cloudinary files are served directly from the CDN so streaming can be
     * handed off without proxying the bytes through the backend.
     */
    getPublicUrl(storageKey: string): string | null {
        return this.getUrl(storageKey);
    }

    /**
     * Save a web/node stream to a local file.
     */
    private async saveStreamToFile(body: any, localPath: string): Promise<void> {
        const fileStream = createWriteStream(localPath);
        const nodeReadable = Readable.fromWeb
            ? Readable.fromWeb(body as any)
            : (body as unknown as NodeJS.ReadableStream);

        await pipeline(nodeReadable, fileStream);
    }
}