import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { SubtitleService } from "../subtitle/subtitle.service.js";



@Processor('video-processing')
export class JobProcessor extends WorkerHost{

    constructor(
        private readonly subtitleService:SubtitleService
    ) {
        super()
    }

    async process(job: Job) {
        const { videoId ,options} = job.data;
        await this.subtitleService.genrateSubtitle(videoId,options,job)
        console.log(`Processing video with ID: ${videoId}`);
  }
}