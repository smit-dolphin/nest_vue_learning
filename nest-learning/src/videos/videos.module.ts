import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller.js';
import { VideosService } from './videos.service.js';
import { SubtitleModule } from '../subtitle/subtitle.module.js';
import { JobModule } from '../job/job.module.js';

@Module({
    imports: [SubtitleModule,JobModule],
    controllers: [VideosController],
    providers: [VideosService],
})
export class VideosModule {}
