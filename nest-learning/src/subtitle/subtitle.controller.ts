import { Controller, Post, Param, Get, StreamableFile, Delete, UseGuards, Req } from '@nestjs/common';
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
    
    @Get(':id/download')
    @UseGuards(JwtAuthGuard)
    async downloadSubtitle(@Param('id') id: string, @Req() req: any) {
        const subtitle = await this.subtitleService.downloadSubtitle(id, req.user.sub);

        return new StreamableFile(createReadStream(subtitle.filePath), {
            type: subtitle.mimeType,
            disposition: `attachment; filename="${subtitle.filename}"`,
        });
    }

    @Get(':videoId')
    @UseGuards(JwtAuthGuard)
    getSubtitle(@Param('videoId') videoId:string, @Req() req: any){
        return this.subtitleService.getSubtitleFiles(videoId, req.user.sub)
    }

    @Delete(':subtitleId')
    @UseGuards(JwtAuthGuard)
    deleteSubtitleById(@Param('subtitleId') subtitleId:string, @Req() req: any){
        return  this.subtitleService.deleteSubtitleById(subtitleId, req.user.sub)
          
    }

    @Delete('clean-up/local-files')
    @UseGuards(JwtAuthGuard)
    localFilesCleanup(){
        return this.subtitleService.cleanupLocalFiles()
    }


}
