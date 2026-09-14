import { Module } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { LocalStorageProvider } from './providers/local-storage.provider.js';
import { STORAGE_PROVIDER } from './storage.constants.js';

@Module({


    providers:[
        StorageService,
        LocalStorageProvider,
        {
            provide:STORAGE_PROVIDER,
            useExisting:LocalStorageProvider
        }
    ],
     exports: [StorageService],

})
export class StorageModule {}
