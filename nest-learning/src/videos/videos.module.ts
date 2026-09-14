import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller.js';
import { VideosService } from './videos.service.js';
import { SubtitleModule } from '../subtitle/subtitle.module.js';
import { JobModule } from '../job/job.module.js';
import { FfmpegModule } from '../ffmpeg/ffmpeg.module.js';
import { StorageModule } from '../storage/storage.module.js';

@Module({
    imports: [SubtitleModule, JobModule, FfmpegModule,StorageModule],
    controllers: [VideosController],
    providers: [VideosService],
})
export class VideosModule {}
