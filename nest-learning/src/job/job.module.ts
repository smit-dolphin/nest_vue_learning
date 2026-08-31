import { Module } from '@nestjs/common';
import { JobService } from './job.service.js';
import { BullModule } from '@nestjs/bullmq';
import { JobProcessor } from './job.processor.js';
import { JobController } from './job.controller.js';
import { SubtitleModule } from '../subtitle/subtitle.module.js';

@Module({

  imports: [
    BullModule.registerQueue({ 
      name:"test"
    }),
    BullModule.registerQueue({ 
      name:"video-processing"
    }),
    SubtitleModule
  ],
  providers: [JobService,JobProcessor],
  controllers: [JobController],
  exports: [JobService]
})
export class JobModule {}
