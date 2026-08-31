import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class JobService {

    constructor(
        @InjectQueue('test') private readonly testQueue: Queue,
        @InjectQueue('video-processing') private readonly videoProcessingQueue: Queue
    ){ }

    async addJobToQueue(data: any) {
        await this.testQueue.add('test-job', data);
        return { message: 'Job added to the queue successfully' };
    }

    async addVideoProcessingJob(data: any) {
        const {videoId}=data
        const job = await this.videoProcessingQueue.add('generate-subtitle', { videoId},{removeOnComplete: {
      count: 1000,
    },
    removeOnFail: {
      count: 1000,
    },});
        return {jobId: job.id}; 
    }

}
