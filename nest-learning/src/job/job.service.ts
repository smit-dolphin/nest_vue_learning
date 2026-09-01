import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class JobService {

    constructor(
        @InjectQueue('test') private readonly testQueue: Queue,
        @InjectQueue('video-processing') private readonly videoProcessingQueue: Queue,
        private readonly prisma: PrismaService
    ) { }

    async addJobToQueue(data: any) {
        await this.testQueue.add('test-job', data);
        return { message: 'Job added to the queue successfully' };
    }

    async addVideoProcessingJob(data: any) {
        const { videoId, options } = data;
        const job = await this.videoProcessingQueue.add('generate-subtitle', { videoId, options }, {
            removeOnComplete: {
                count: 1000,
            },
            removeOnFail: {
                count: 1000,
            },
        });
        return { jobId: job.id };
    }

    async getJobByUserId(userId: string) {
        return await this.prisma.subtitleJob.findMany({
            where: {
                video: {
                    userId,
                },
            },
            include: {
                video: {
                    select: {
                        id: true,
                        filename: true,
                        path: true,
                        mimetype: true,
                        duration: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

}
