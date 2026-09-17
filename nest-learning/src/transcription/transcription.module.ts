import { Module } from '@nestjs/common';
import { TranscriptionService } from './transcription.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StorageModule } from '../storage/storage.module.js';

@Module({
  imports: [PrismaModule,StorageModule],
  providers: [TranscriptionService],
  exports: [TranscriptionService]
})
export class TranscriptionModule {}
