import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { QueueEvents } from 'bullmq';
import { jobGateway } from './job.gateway.js';

@Injectable()
export class JobEvents implements OnModuleInit, OnModuleDestroy {

  private queueEvents!: QueueEvents;

  constructor(
    private readonly gateway: jobGateway,
  ) {}

  async onModuleInit() {

    this.queueEvents = new QueueEvents('video-processing', {
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        password: process.env.REDIS_PASSWORD,
      },
    });

    await this.queueEvents.waitUntilReady();

    console.log('QueueEvents connected');

    this.queueEvents.on('progress', ({ jobId, data }) => {

      console.log('BullMQ progress:', jobId, data);

      this.gateway.sendProgress(
        jobId,
        Number(data),
        'Processing',
      );
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {

      console.log(
        'BullMQ failed:',
        jobId,
        failedReason,
      );

      this.gateway.sendProgress(
        jobId,
        0,
        'Failed',
      );
    });

    this.queueEvents.on('stalled', ({ jobId }) => {

      console.log('BullMQ stalled:', jobId);

      this.gateway.sendProgress(
        jobId,
        0,
        'Stalled',
      );
    });
  

    
  }

  async onModuleDestroy() {
    await this.queueEvents.close();
  }
}