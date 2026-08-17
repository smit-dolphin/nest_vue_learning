import { Module } from '@nestjs/common';
import { FfmpegService } from './ffmpeg.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  providers: [FfmpegService],
  exports: [FfmpegService],
})
export class FfmpegModule {}
