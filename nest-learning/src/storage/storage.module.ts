import { Module } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { LocalStorageProvider } from './providers/local-storage.provider.js';
import { STORAGE_PROVIDER } from './storage.constants.js';
import { CloudinaryStorageProvider } from './providers/cloudinary-storage.provider.js';

@Module({
    providers: [
        StorageService,
        LocalStorageProvider,
        CloudinaryStorageProvider,
        {
            // Set STORAGE_DRIVER=cloudinary in .env to use Cloudinary.
            // Defaults to local storage when the variable is missing or set to 'local'.
            provide: STORAGE_PROVIDER,
            useFactory: (
                local: LocalStorageProvider,
                cloudinary: CloudinaryStorageProvider,
            ) => {
                const driver = (process.env.STORAGE_DRIVER ?? 'local').toLowerCase().trim();
                return driver === 'cloudinary' ? cloudinary : local;
            },
            inject: [LocalStorageProvider, CloudinaryStorageProvider],
        },
    ],
    exports: [StorageService],
})
export class StorageModule {}

