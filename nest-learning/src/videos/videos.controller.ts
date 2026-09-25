import {
  Body,
  Controller,
  Post,
  Req,
  Get,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
  StreamableFile,
  Delete,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { extname } from 'path';
import type { Response } from 'express';
import { VideosService, type ListVideosQuery } from './videos.service.js';
import { SubtitleService } from '../subtitle/subtitle.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { StreamAuthGuard } from '../auth/guards/stream-auth.guard.js';
import { JobService } from '../job/job.service.js';
import { StorageService } from '../storage/storage.service.js';
import { uploadAndGenrateVideoDto } from './dto/video.dto.js';
import { Role } from '../auth/decorators/role.decorators.js';
import { RoleGuard } from '../auth/guards/roles-auth.guard.js';
import { ok } from '../common/response/response.js';
import {
  displayName,
  safeFilename,
} from '../common/file-names.js';

@Controller('videos')
export class VideosController {
  constructor(
    private readonly videosService: VideosService,
    private readonly subtitleService: SubtitleService,
    private readonly jobService: JobService,
    private readonly storageService: StorageService,
  ) {}

  // upload video only
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowed = ['video/mp4', 'video/webm', 'video/mkv', 'video/avi'];

        if (!allowed.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Only video files are allowed'),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  async uploadVideoOnly(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const userId = req.user?.sub;

    const video = await this.videosService.saveUploadedVideo(file, userId);

    return ok('Video uploaded successfully', video);
  }

  // ____________________________________________________________________________________________________________________

  @Post('subtitle-jobs')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowed = ['video/mp4', 'video/webm', 'video/mkv', 'video/avi'];

        if (!allowed.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Only video files are allowed'),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,

    @Query() options: uploadAndGenrateVideoDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.videosService.saveVideo(
      file,
      req.user.sub,
      options,
    );

    return ok('Subtitle job created successfully', {
      video: result.result,
      jobId: result.jobId,
      options: result.options,
    });
  }

  //genrate subtitle from video id ,existing upload video
  @Post(':videoId/subtitle-jobs')
  @UseGuards(JwtAuthGuard)
  async genrateSubtitleFromVideo(
    @Param('videoId') videoId: string,

    @Query() options: uploadAndGenrateVideoDto,
  ) {
    const result = await this.videosService.getSubtitleVideoById(
      videoId,
      options,
    );

    return ok('Subtitle job created successfully', {
      video: result.result,
      jobId: result.jobId,
      options: result.options,
    });
  }

  @Post(':videoId/burn-jobs')
  @UseGuards(JwtAuthGuard)
  async burnExistingSubtitle(
    @Param('videoId') videoId: string,
    @Body() body: { subtitleId: string },
    @Query() options: uploadAndGenrateVideoDto,
  ) {
    const result = await this.jobService.addBurnSubtitleJob({
      videoId,
      subtitleId: body.subtitleId,
      options: {
        ...options,
        subtitleStyle: this.videosService.buildBurnSubtitleStyle(options),
      },
    });

    return ok('Burn job created successfully', {
      jobId: result.jobId,
      historyId: result.historyId,
    });
  }

  // GET all videos
  @Get()
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Role('USER')
  getVideos(@Req() req: any, @Query() query: ListVideosQuery) {
    return this.videosService.getVideos(req.user.sub, query);
  }

  //delete video by id
  @Delete(':videoId')
  @UseGuards(JwtAuthGuard)
  async deleteVideo(@Param('videoId') videoId: string, @Req() req: any) {
    await this.videosService.deleteVideo(videoId, req.user.sub);
    return ok('Video deleted successfully');
  }

  @Get('stream/:videoId')
  @UseGuards(StreamAuthGuard)
  async streamVideo(
    @Param('videoId') videoId: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const video = await this.videosService.streamVideo(videoId, req.user.sub);

    // Cloudinary-backed storage: hand the browser off to the CDN URL so the
    // video is streamed directly (the CDN supports HTTP Range requests).
    const publicUrl = this.storageService.getPublicUrl(video.storageKey);
    if (publicUrl) {
      res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
      return res.redirect(302, publicUrl);
    }

    // Local storage: stream the file with HTTP Range support so the browser
    // can seek and progressively buffer the video.
    const { localPath, cleanup } = await this.storageService.getLocalCopy(
      video.storageKey,
    );
    res.on('close', () => cleanup());

    try {
      const { size } = await stat(localPath);
      const range = req.headers.range as string | undefined;

      const baseHeaders = {
        'Accept-Ranges': 'bytes',
        'Content-Type': video.mimetype,
        'Content-Disposition': `inline; filename="${ safeFilename(displayName(video.originalName, video.filename)) }"`,
        'Cache-Control': 'private, max-age=0, must-revalidate',
      };

      if (range) {
        const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
        const start = parseInt(startStr, 10);
        const end = endStr ? parseInt(endStr, 10) : size - 1;

        const chunkStart = Number.isNaN(start) || start < 0 ? 0 : start;
        const chunkEnd = Number.isNaN(end) || end >= size ? size - 1 : end;

        if (chunkStart > chunkEnd || chunkStart >= size) {
          res.writeHead(416, { 'Content-Range': `bytes */${size}` });
          res.end();
          return;
        }

        const chunkSize = chunkEnd - chunkStart + 1;
        res.writeHead(206, {
          ...baseHeaders,
          'Content-Range': `bytes ${chunkStart}-${chunkEnd}/${size}`,
          'Content-Length': chunkSize,
        });

        createReadStream(localPath, { start: chunkStart, end: chunkEnd })
          .pipe(res)
          .on('finish', () => cleanup());
      } else {
        res.writeHead(200, {
          ...baseHeaders,
          'Content-Length': size,
        });

        createReadStream(localPath)
          .pipe(res)
          .on('finish', () => cleanup());
      }
    } catch {
      cleanup();
      throw new NotFoundException('Video file not found');
    }
  }

  @Get(':videoId/download')
  @UseGuards(JwtAuthGuard)
  async downloadVideo(@Param('videoId') videoId: string, @Req() req: any) {
    const video = await this.videosService.downloadVideo(videoId, req.user.sub);

    // Materialise a local copy when the video lives on a remote provider.
    const { localPath, cleanup } = await this.storageService.getLocalCopy(
      video.storageKey,
    );

    const readable = createReadStream(localPath);
    readable.on('close', () => cleanup());

    return new StreamableFile(readable, {
      type: video.mimetype,
      disposition: `attachment; filename="${safeFilename(displayName(video.originalName, video.filename))}"`,
    });
  }
}
