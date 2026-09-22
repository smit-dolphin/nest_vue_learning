import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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

    async addBurnSubtitleJob(data: { videoId: string; subtitleId: string; options:any}) {
        const { videoId, subtitleId ,options} = data;
        const subtitle = await this.prisma.subtitle.findFirst({
            where: {
                id: subtitleId,
                videoId,
            },
            select: {
                subtitleFormat: true,
            },
        });

        if (!subtitle) {
            throw new BadRequestException('Subtitle file was not found for this video');
        }

        if (subtitle.subtitleFormat !== 'SRT' && subtitle.subtitleFormat !== 'VTT') {
            throw new BadRequestException('Only SRT and VTT subtitle files can be burned');
        }

        const jobEntry = await this.prisma.subtitleJob.create({
            data: {
                videoId,
                status: 'PENDING',
            },
        });

        const job = await this.videoProcessingQueue.add('burn-subtitle', {
            videoId,
            subtitleId,
            options,
            subtitleJobId: jobEntry.id,
        }, {
            removeOnComplete: {
                count: 1000,
            },
            removeOnFail: {
                count: 1000,
            },
        });

        await this.prisma.subtitleJob.update({
            where: { id: jobEntry.id },
            data: { queueJobId: job.id },
        });

        return { jobId: job.id, historyId: jobEntry.id };
    }

    async getJobById(userId:string,jobId: string) {
        const job = await this.prisma.subtitleJob.findUnique({
            where: {
                id: jobId,
                video: {
                    userId,
                },
            },
        });
        if (!job) {
            return { message: 'Job not found' };
        }

        return job
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


    // async cancelJobById(userId:string,jobId:string){
    //     //my goal is to cancell the job it here so i need bull mq then job tables 
    //     const job =await this.prisma.subtitleJob.findUnique({where:{
    //         queueJobId:jobId
    //     }})

    //     if (!job ) return new NotFoundException('the queue job not found')

    //     const queue = this.videoProcessingQueue.job
    // }

}
