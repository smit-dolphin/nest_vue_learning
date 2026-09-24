import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SubtitleService } from '../subtitle/subtitle.service.js';

@Processor('video-processing', {
  concurrency: 5,
})
export class JobProcessor extends WorkerHost {
  constructor(private readonly subtitleService: SubtitleService) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case 'generate-subtitle':
        return this.subtitleService.genrateSubtitle(
          job.data.videoId,
          job.data.options,
          job,
        );
      case 'burn-subtitle':
        return this.subtitleService.burnExistingSubtitle(
          job.data.videoId,
          job.data.subtitleId,
          job,
          job.data.options,
          job.data.subtitleJobId,
        );
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  }
}
