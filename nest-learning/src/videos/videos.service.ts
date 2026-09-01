import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JobService } from '../job/job.service.js';



export interface SubtitleOptions {
    leng: string;
    formate: string;
    lables: boolean;
    autoTranslate: boolean;
    autoPunctuation: boolean;
    wordLevelTiming: boolean;
    burnVideo: boolean;
}

@Injectable()
export class VideosService {

    constructor(private readonly prisma: PrismaService,
        private readonly jobService: JobService
    ) { }

    async saveVideo(file: Express.Multer.File, userId: string, options: SubtitleOptions) {
        const result = await this.prisma.video.create({
            data: {
                filename: file.filename,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size,
                userId,
            },
        });

        if (!result) {
            throw new Error('Failed to save video');
        }

        const vidoeJob = await this.jobService.addVideoProcessingJob({
            videoId: result.id, options: {
                formate: options.formate,
                leng: options.leng,
                lables: options.lables,
                autoTranslate: options.autoTranslate,
                autoPunctuation: options.autoPunctuation,
                wordLevelTiming: options.wordLevelTiming,
                burnVideo: options.burnVideo,
            }
        });
        return { result, jobId: vidoeJob.jobId, options }; // Return the saved video information along with the job ID and options
    }

    async getVideos() {
        return await this.prisma.video.findMany({ include: { user: { select: { email: true } } } });
    }

    async getUserVideos(userId: string) {
        return await this.prisma.video.findMany({ where: { userId } });
    }
}
