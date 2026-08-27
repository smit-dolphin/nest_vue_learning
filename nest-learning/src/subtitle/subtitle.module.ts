import { Module } from '@nestjs/common';
import { SubtitleService } from './subtitle.service.js';
import { SubtitleController } from './subtitle.controller.js';
import { FfmpegModule } from '../ffmpeg/ffmpeg.module.js';
import { TranscriptionModule } from '../transcription/transcription.module.js';


@Module({
  imports:[FfmpegModule,TranscriptionModule],
  providers: [SubtitleService],
  controllers: [SubtitleController],
  exports:[SubtitleService]
})
export class SubtitleModule {}
