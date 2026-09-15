import { Controller, Post, Param, Get, StreamableFile, Delete, UseGuards } from '@nestjs/common';
import { createReadStream } from 'node:fs';
import { SubtitleService } from './subtitle.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';


@Controller('subtitle')
export class SubtitleController {

    constructor(private readonly subtitleService: SubtitleService) {}

    // @Post(':id')
    // genrateSubtitle(@Param('id') id:string){
    //     return this.subtitleService.genrateSubtitle(id)

    // }
    
    @Get('download/:id')
    @UseGuards(JwtAuthGuard)
    async downloadSubtitle(@Param('id') id: string) {
        const subtitle = await this.subtitleService.downloadSubtitle(id);

        return new StreamableFile(createReadStream(subtitle.filePath), {
            type: subtitle.mimeType,
            disposition: `attachment; filename="${subtitle.filename}"`,
        });
    }

    @Get(':videoId')
    @UseGuards(JwtAuthGuard)
    getSubtitle(@Param('videoId') videoId:string){
        return this.subtitleService.getSubtitleFiles(videoId)
    }

    @Delete(':subtitleId')
    @UseGuards(JwtAuthGuard)
    deleteSubtitleById(@Param('subtitleId') subtitleId:string){
        return  this.subtitleService.deleteSubtitleById(subtitleId)
          
    }



}
