import { Controller, Get, Param } from '@nestjs/common';
import { JobService } from './job.service.js';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Controller('job')
export class JobController {
    constructor(private readonly jobService: JobService,
        @InjectQueue('video-processing') private readonly queue:Queue
    ) {}

    @Get('add-job')
    async addJob() {
        return this.jobService.addJobToQueue({ message: 'Hello, this is a test job!' });
    }

    @Get(':jobId')
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
