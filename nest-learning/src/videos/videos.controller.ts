import { Body, Controller, Post, Req, Get, Param, UseGuards, UploadedFile, UseInterceptors, BadRequestException, Query, StreamableFile, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { createReadStream } from 'fs';
import { extname } from 'path';
import { VideosService } from './videos.service.js';
import { SubtitleService } from '../subtitle/subtitle.service.js'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { JobService } from '../job/job.service.js';
import { uploadAndGenrateVideoDto } from './dto/video.dto.js';





@Controller('videos')
export class VideosController {

    constructor(
        private readonly videosService: VideosService,
        private readonly subtitleService: SubtitleService,
        private readonly jobService: JobService
    ) { }


    // upload video only 
    @Post()
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
    uploadVideoOnly(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const userId = req.user?.sub

        return this.videosService.saveUploadedVideo(file, userId);
    }


    // ____________________________________________________________________________________________________________________

    @Post('subtitle-jobs')
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

        @Query() options: uploadAndGenrateVideoDto,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }


        return this.videosService.saveVideo(
            file,
            req.user.sub,
            options,
        );
    }

    //genrate subtitle from video id ,existing upload video
    @Post(':videoId/subtitle-jobs')
    @UseGuards(JwtAuthGuard)
    genrateSubtitleFromVideo(
        @Param('videoId') videoId: string,

        @Query() options: uploadAndGenrateVideoDto,
    ) {
        return this.videosService.getSubtitleVideoById(videoId, options);
    }


    

    @Post(':videoId/burn-jobs')
    @UseGuards(JwtAuthGuard)
    burnExistingSubtitle(
        @Param('videoId') videoId: string,
        @Body() body: { subtitleId: string },
        @Query() options:uploadAndGenrateVideoDto
    ) {

        console.log("______________burn job__________________")
        return this.jobService.addBurnSubtitleJob({
            videoId,
            subtitleId: body.subtitleId,
            options: {
                ...options,
                subtitleStyle: this.videosService.buildBurnSubtitleStyle(options),
            }
        });
    }


    // GET all videos
    @Get()
    @UseGuards(JwtAuthGuard)
    getVideos(@Req() req: any) {
        return this.videosService.getVideos(req.user.sub);
    }


    // GET videos of specific user
    // @Get('user/:userId')
    // @UseGuards(JwtAuthGuard)
    // getUserVideos(
    //     @Param('userId') userId: string,
    // ) {
    //     return this.videosService.getUserVideos(userId);
    // }

    //delete video by id
    @Delete(':videoId')
    @UseGuards(JwtAuthGuard)
    deleteVideo(
        @Param('videoId') videoId: string,
        @Req() req: any,
    ) {
        return this.videosService.deleteVideo(videoId, req.user.sub);
    }


    // @Get('stream/:videoId')
    // @UseGuards(JwtAuthGuard)
    // async streamVideo(
    //     @Param('videoId') videoId: string,
    // ) {
    //     const video = await this.videosService.streamVideo(videoId);

    //     return new StreamableFile(createReadStream(video.filePath), {
    //         type: video.mimetype,
    //         disposition: `inline; filename="${video.filename}"`,
    //     });
    // }

    @Get(':videoId/download')
    @UseGuards(JwtAuthGuard)
    async downloadVideo(
        @Param('videoId') videoId: string,
        @Req() req: any,
    ) {
        const video = await this.videosService.downloadVideo(videoId, req.user.sub);

        return new StreamableFile(createReadStream(video.filePath), {
            type: video.mimetype,
            disposition: `attachment; filename="${video.filename}"`,
        });
    }

    
    // @Get(':videoId/audio')
    // @UseGuards(JwtAuthGuard)
    // getAudioByVideoId(@Param('videoId') videoId: string) {
    //     return this.videosService.getAudioByVideoId(videoId);
    // }

    // @Get(':videoId/audio/:audioId/download')
    // @UseGuards(JwtAuthGuard)
    // async downloadAudio(
    //     @Param('videoId') videoId: string,
    //     @Param('audioId') audioId: string,
    // ) {
    //     const audio = await this.videosService.downloadAudio(videoId, audioId);

    //     return new StreamableFile(createReadStream(audio.filePath), {
    //         type: audio.mimetype,
    //         disposition: `attachment; filename="${audio.filename}"`,
    //     });
    // }

    // @Delete('audio/:audioId')
    // @UseGuards(JwtAuthGuard)
    // deleteAudio(@Param('audioId') audioId: string) {
    //     return this.videosService.deleteAudio(audioId);
    // }


}