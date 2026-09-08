import { Controller, Post, Param, Get, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { SubtitleService } from './subtitle.service.js';


@Controller('subtitle')
export class SubtitleController {

    constructor(private readonly subtitleService: SubtitleService) {}

    // @Post(':id')
    // genrateSubtitle(@Param('id') id:string){
    //     return this.subtitleService.genrateSubtitle(id)

    // }
    
    @Get('download/:id')
    async downloadSubtitle(@Param('id') id: string) {
        const subtitle = await this.subtitleService.downloadSubtitle(id);

        return new StreamableFile(createReadStream(subtitle.filePath), {
            type: subtitle.mimeType,
            disposition: `attachment; filename="${subtitle.filename}"`,
        });
    }

    @Get(':videoId')
    getSubtitle(@Param('videoId') videoId:string){
        return this.subtitleService.getSubtitleFiles(videoId)
    }



}
