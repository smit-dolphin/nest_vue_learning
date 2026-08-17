import { Module } from '@nestjs/common';
import { SubtitleService } from './subtitle.service.js';
import { SubtitleController } from './subtitle.controller.js';
import { FfmpegModule } from '../ffmpeg/ffmpeg.module.js';


@Module({
  imports:[FfmpegModule],
  providers: [SubtitleService],
  controllers: [SubtitleController]
})
export class SubtitleModule {}
