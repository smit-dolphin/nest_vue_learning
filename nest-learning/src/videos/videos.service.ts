import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JobService } from '../job/job.service.js';

@Injectable()
export class VideosService {

    constructor(private readonly prisma: PrismaService,
        private readonly jobService:JobService
    ) {}

    async saveVideo(file: Express.Multer.File, userId: string) {
        const result=await this.prisma.video.create({
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
        const vidoeJob=await this.jobService.addVideoProcessingJob({ videoId: result.id });
        return {result,jobId: vidoeJob.jobId}; // Return the saved video information along with the job ID
    }

    async getVideos() {
        return await this.prisma.video.findMany({ include: { user:{select:{email:true}} } });
    }

    async getUserVideos(userId: string) {
        return await this.prisma.video.findMany({ where: { userId } });
    }
}
