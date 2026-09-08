import { Controller,Post,Param, Get } from '@nestjs/common';
import { SubtitleService } from './subtitle.service.js';


@Controller('subtitle')
export class SubtitleController {

    constructor(private readonly subtitleService: SubtitleService) {}

    // @Post(':id')
    // genrateSubtitle(@Param('id') id:string){
    //     return this.subtitleService.genrateSubtitle(id)

    // }
    
    @Get(':videoId')
    getSubtitle(@Param('videoId') videoId:string){
        return this.subtitleService.getSubtitleFiles(videoId)
    }



}
