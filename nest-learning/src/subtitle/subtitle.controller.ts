import {
  Controller,
  Param,
  Get,
  StreamableFile,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { createReadStream } from 'node:fs';
import {
  SubtitleService,
  type ListSubtitlesQuery,
} from './subtitle.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ok } from '../common/response/response.js';
import {
  displayName,
  safeFilename,
} from '../common/file-names.js';

@Controller('subtitle')
export class SubtitleController {
  constructor(private readonly subtitleService: SubtitleService) {}

  // @Post(':id')
  // genrateSubtitle(@Param('id') id:string){
  //     return this.subtitleService.genrateSubtitle(id)

  // }

  @Get(':id/content')
  @UseGuards(JwtAuthGuard)
  getSubtitleContent(@Param('id') id: string, @Req() req: any) {
    return this.subtitleService.getSubtitleContent(id, req.user.sub);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async downloadSubtitle(@Param('id') id: string, @Req() req: any) {
    const subtitle = await this.subtitleService.downloadSubtitle(
      id,
      req.user.sub,
    );

    return new StreamableFile(createReadStream(subtitle.filePath), {
      type: subtitle.mimeType,
      disposition: `attachment; filename="${safeFilename(displayName(subtitle.originalName, subtitle.filename))}"`,
    });
  }

  @Get(':videoId')
  @UseGuards(JwtAuthGuard)
  getSubtitle(
    @Param('videoId') videoId: string,
    @Req() req: any,
    @Query() query: ListSubtitlesQuery,
  ) {
    return this.subtitleService.getSubtitleFiles(videoId, req.user.sub, query);
  }

  @Delete(':subtitleId')
  @UseGuards(JwtAuthGuard)
  async deleteSubtitleById(
    @Param('subtitleId') subtitleId: string,
    @Req() req: any,
  ) {
    await this.subtitleService.deleteSubtitleById(subtitleId, req.user.sub);

    return ok('Subtitle deleted successfully');
  }

  @Delete('clean-up/local-files')
  @UseGuards(JwtAuthGuard)
  async localFilesCleanup() {
    await this.subtitleService.cleanupLocalFiles();
    return ok('Local files cleaned up successfully');
  }
}
