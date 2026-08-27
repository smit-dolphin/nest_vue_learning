import { Controller, Post, Req,Get, Param,UseGuards, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { VideosService } from './videos.service.js';
import {SubtitleService} from '../subtitle/subtitle.service.js'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
@Controller('videos')
export class VideosController {

    constructor(
        private readonly videosService: VideosService,
        private readonly subtitleService: SubtitleService
        ) {}

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
        limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
        fileFilter: (req, file, cb) => {
            const allowed = ['video/mp4', 'video/webm', 'video/mkv', 'video/avi'];
            if (!allowed.includes(file.mimetype)) {
                return cb(new BadRequestException('Only video files are allowed'), false);
            }
            cb(null, true);
        },
    }))
    uploadVideo(@UploadedFile() file: Express.Multer.File, @Req() req:any) {
        if (!file) throw new BadRequestException('No file uploaded');
        return this.videosService.saveVideo(file, req.user.sub);
    }

    @Get()
    getVideos() {
        return this.videosService.getVideos();
    }

    @Get('user/:userId')
    getUserVideos(@Param('userId') userId: string) {
        return this.videosService.getUserVideos(userId);
    }
}
