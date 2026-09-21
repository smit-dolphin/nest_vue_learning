import { Module } from '@nestjs/common';
import { FfmpegService } from './ffmpeg.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { StorageModule } from '../storage/storage.module.js';

@Module({
  imports: [PrismaModule,StorageModule],
  providers: [FfmpegService],
  exports: [FfmpegService],
})
export class FfmpegModule {}
