import { Body, Controller, Post, Req, Get, Param, UseGuards, UploadedFile, UseInterceptors, BadRequestException, Query, StreamableFile, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { createReadStream } from 'fs';
import { extname } from 'path';
import { VideosService } from './videos.service.js';
import { SubtitleService } from '../subtitle/subtitle.service.js'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { JobService } from '../job/job.service.js';





@Controller('videos')
export class VideosController {

    constructor(
        private readonly videosService: VideosService,
        private readonly subtitleService: SubtitleService,
        private readonly jobService: JobService
    ) {}


    // ─────────────────────────────────────────
    // VIDEO ROUTES
    // ─────────────────────────────────────────

    @Post('upload/:userId')
    @UseInterceptors(FileInterceptor('video', {
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
            const allowed = [
                'video/mp4',
                'video/webm',
                'video/mkv',
                'video/avi',
            ];

            if (!allowed.includes(file.mimetype)) {
                return cb(
                    new BadRequestException('Only video files are allowed'),
                    false,
                );
            }

            cb(null, true);
        },
    }))
    uploadVideoOnly(
        @UploadedFile() file: Express.Multer.File,
        @Param('userId') userId: string,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        return this.videosService.saveUploadedVideo(file, userId);
    }

    @Post('/')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('video', {
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
            const allowed = [
                'video/mp4',
                'video/webm',
                'video/mkv',
                'video/avi',
            ];

            if (!allowed.includes(file.mimetype)) {
                return cb(
                    new BadRequestException('Only video files are allowed'),
                    false,
                );
            }

            cb(null, true);
        },
    }))
    uploadVideo(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,

        @Query('leng') leng: string,
        @Query('formate') formate: string,
        @Query('lables') lables: boolean,
        @Query('autoTranslate') autoTranslate: boolean,
        @Query('autoPunctuation') autoPunctuation: boolean,
        @Query('wordLevelTiming') wordLevelTiming: boolean,
        @Query('burnVideo') burnVideo: boolean,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const option = {
            leng,
            formate,
            lables,
            autoTranslate,
            autoPunctuation,
            wordLevelTiming,
            burnVideo,
        };

        return this.videosService.saveVideo(
            file,
            req.user.sub,
            option,
        );
    }

    //genrate subtitle from video id ,existing upload video
    @Post('generate-subtitle/:videoId')
     genrateSubtitleFromVideo(
        @Param('videoId') videoId: string,

        @Query('leng') leng: string,
        @Query('formate') formate: string,
        @Query('lables') lables: boolean,
        @Query('autoTranslate') autoTranslate: boolean,
        @Query('autoPunctuation') autoPunctuation: boolean,
        @Query('wordLevelTiming') wordLevelTiming: boolean,
        @Query('burnVideo') burnVideo: boolean,
    ){
        return this.videosService.getSubtitleVideoById(videoId, {
            leng,
            formate,
            lables,
            autoTranslate,
            autoPunctuation,
            wordLevelTiming,
            burnVideo,
        });
    }

    @Post(':videoId/burn-subtitle')
    burnExistingSubtitle(
        @Param('videoId') videoId: string,
        @Body() body: { subtitleId: string },
    ) {
        return this.jobService.addBurnSubtitleJob({
            videoId,
            subtitleId: body.subtitleId,
        });
    }


    // GET all videos
    @Get()
    getVideos() {
        return this.videosService.getVideos();
    }


    // GET videos of specific user
    @Get('user/:userId')
    getUserVideos(
        @Param('userId') userId: string,
    ) {
        return this.videosService.getUserVideos(userId);
    }

    //delete video by id
    @Get('delete/:videoId')
    deleteVideo(
        @Param('videoId') videoId: string,
    ) {
        return this.videosService.deleteVideo(videoId);
    }

    @Get('stream/:videoId')
    async streamVideo(
        @Param('videoId') videoId: string,
    ) {
        const video = await this.videosService.streamVideo(videoId);

        return new StreamableFile(createReadStream(video.filePath), {
            type: video.mimetype,
            disposition: `inline; filename="${video.filename}"`,
        });
    }

    @Get('download/:videoId')
    async downloadVideo(
        @Param('videoId') videoId: string,
    ) {
        const video = await this.videosService.downloadVideo(videoId);

        return new StreamableFile(createReadStream(video.filePath), {
            type: video.mimetype,
            disposition: `attachment; filename="${video.filename}"`,
        });
    }

    @Get(':videoId/audio')
    getAudioByVideoId(@Param('videoId') videoId: string) {
        return this.videosService.getAudioByVideoId(videoId);
    }

    @Get(':videoId/audio/:audioId/download')
    async downloadAudio(
        @Param('videoId') videoId: string,
        @Param('audioId') audioId: string,
    ) {
        const audio = await this.videosService.downloadAudio(videoId, audioId);

        return new StreamableFile(createReadStream(audio.filePath), {
            type: audio.mimetype,
            disposition: `attachment; filename="${audio.filename}"`,
        });
    }

    @Delete('audio/:audioId')
    deleteAudio(@Param('audioId') audioId: string) {
        return this.videosService.deleteAudio(audioId);
    }

    
}