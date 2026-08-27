import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller.js';
import { VideosService } from './videos.service.js';
import { SubtitleModule } from '../subtitle/subtitle.module.js';

@Module({
    imports: [SubtitleModule],
    controllers: [VideosController],
    providers: [VideosService],
})
export class VideosModule {}
