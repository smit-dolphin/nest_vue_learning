import { Injectable ,NotFoundException} from '@nestjs/common';
import { spawn } from 'node:child_process';
import { PrismaService } from '../prisma/prisma.service.js';
import {FfmpegService} from '../ffmpeg/ffmpeg.service.js'


@Injectable()
export class SubtitleService {

    constructor(private readonly prisma:PrismaService,
        private readonly ffmpegService:FfmpegService
    ){}

    async genrateSubtitle(id:string){
        //for now to genrat subtitle 
        // we need video file first
        // current service just genrate subtitle but need video id
        //the db will called from that 
        // and then we will; call db from that

        const videoResult=await this.prisma.video.findUnique ({where:{
            id:id
        }})

        if(videoResult===undefined ||videoResult===null){
             throw new NotFoundException("video not found")
        }

        //we get that video and create a audio file for now 

        const resultGenrate=await this.ffmpegService.videoToAudio( videoResult.path,videoResult.id)

        
        // return it thats it ,finish
        return resultGenrate
    }
}
