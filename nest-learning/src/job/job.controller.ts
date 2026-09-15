import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JobService } from './job.service.js';
import { jobGateway } from './job.gateway.js';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('job')
export class JobController {
    constructor(private readonly jobService: JobService,
        private readonly gateway: jobGateway,
        @InjectQueue('video-processing') private readonly queue: Queue,

    ) { }

    @Get('add-job')
    @UseGuards(JwtAuthGuard)
    async addJob() {
        return this.jobService.addJobToQueue({ message: 'Hello, this is a test job!' });
    }

    @Get('test-progress')
    @UseGuards(JwtAuthGuard)
    testProgress() {
        return this.gateway.sendTestProgress();
    }

    @Get('/:userId/list')
    @UseGuards(JwtAuthGuard)
    async getJobsByUserId(@Param('userId') userId: string) {
        return await this.jobService.getJobByUserId(userId)
    }

    @Get('/:userId/list/:jobId')
    @UseGuards(JwtAuthGuard)
    async getJobById(
        @Param('userId') userId: string, 
        @Param('jobId') jobId: string
    ) {
        return this.jobService.getJobById(userId, jobId);
    }

    @Get(':jobId')
    @UseGuards(JwtAuthGuard)
    async getJobStatus(@Param('jobId') jobId: string) {
        const job = await this.queue.getJob(jobId);
        if (!job) {
            return { message: 'Job not found' };
        }

        return {
            id: job.id,
            status: await job.getState(),
            progress: job.progress,
        };
    }





}
