import { Injectable ,NotFoundException} from '@nestjs/common';
import { spawn } from 'node:child_process';
import { PrismaService } from '../prisma/prisma.service.js';
import {FfmpegService} from '../ffmpeg/ffmpeg.service.js'
import { TranscriptionService } from '../transcription/transcription.service.js';
import path from 'node:path';
import { Job } from 'bullmq';


@Injectable()
export class SubtitleService {

    constructor(private readonly prisma:PrismaService,
        private readonly ffmpegService:FfmpegService,
        private readonly transcriptionService:TranscriptionService
    ){}

    async genrateSubtitle(id:string,job:Job){
        //for now to genrat subtitle 
        // we need video file first
        // current service just genrate subtitle but need video id
        //the db will called from that 
        // and then we will; call db from that

        const root=process.cwd();

        
        const videoResult=await this.prisma.video.findUnique ({where:{
            id:id
        }})
        await job.updateProgress(10)

        if(videoResult===undefined ||videoResult===null){
            throw new NotFoundException("video not found")
        }
        
        //we get that video and create a audio file for now 
        
        const resultGenrate=await this.ffmpegService.videoToAudio( videoResult.path,videoResult.id)

        await job.updateProgress(30)

        const absoluteAudioPath = path.join(root, resultGenrate.path);

        const resultGenratedSubtitle=await this.transcriptionService.transcriptAudio(absoluteAudioPath ,videoResult.id)
        await job.updateProgress(60)
        const burnedVideo=await this.ffmpegService.burnSubtitleInVideo(videoResult.path,resultGenratedSubtitle.path+".srt")
        await job.updateProgress(100)
        
        // return it thats it ,finish
        return burnedVideo
    }
}
