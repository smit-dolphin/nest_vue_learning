import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { spawn } from 'child_process';
import path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class TranscriptionService {
  constructor(private readonly prisma: PrismaService) { }

  // adding the output path for genrated audio 
  async transcriptAudio(audioPath: string, videoId: string) {

    // using process.cwd() to always resolve from project root (works in CommonJS)
    const root = process.cwd();

    // creating output path for file 
    const absoultePath = path.join(root, 'uploads', 'subtitle', `${videoId}`);
    const absoluteWisperPath = path.join(root, 'Release', 'whisper-cli');
    const absoluteModelPath = path.join(root, 'Release', 'models', 'ggml-base.bin');

    // ensure subtitle output directory exists
    await fs.mkdir(path.join(root, 'uploads', 'subtitle'), { recursive: true });

    // create spawn process and create the wisper.cpp process
    const wisper = spawn(absoluteWisperPath, [
      "-m",
      absoluteModelPath,
      "-f",
      audioPath,
      "-osrt",
      "-of",
      absoultePath,
      "-l",
      "en"
    ])



    wisper.stdout?.on("data", (data) => {
      console.log(`Whisper stdout: ${data.toString()}`);
    });

    wisper.stderr?.on("data", (data) => {
      console.error(`Whisper stderr: ${data.toString()}`);
    });




    await new Promise((resolve, reject) => {


      wisper.on("error", (err) => {
        reject(new Error(`failed to run wisper : ${err.message}`))
      })

      wisper.on('close', (code) => {
        if (code === 0) {
          resolve("transcription genrated successfully ")
        }
        else {
          reject(new Error(`"failed to genrate transcription : ${code}`))
        }
      })

    })

    // now spawn process is exist now check its data 
    // and get data?? no we got wisper perocees  wait until data is genrated

    //now useing ffmpeg prob to get file informatiion
    // i have to get file information

    //there is no tool provide by wisper to check the genrated file mete data 
    // and i cant use ffmpeg probe here
    // so i am sticking with fs module

    const filename = path.basename(absoultePath)
    const filesize = await fs.stat(`${absoultePath}.srt`)
    const subtitleObject = {

      filename: filename,
      mimeType: "text/srt",
      path: absoultePath,
      size: filesize.size,
      duration: 0.0,
      subtitleFormat: "SRT",
      videoId: videoId
    }

    const result = await this.transcriptionAudioDbEntry(subtitleObject)


    return result


  }


  async transcriptionAudioDbEntry(file: {
    filename: string;
    mimeType: string;
    path: string;
    size: number;
    duration: number;
    subtitleFormat: string;
    videoId: string;
  }) {
    const transcriptionAudio = await this.prisma.subtitle.create({
      data: {
        path: file.path,
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
        duration: file.duration,
        videoId: file.videoId,
        languageCode: "en"
      }
    })


    if (transcriptionAudio === undefined || transcriptionAudio === null) {
      throw new InternalServerErrorException("transcription is not genrated")
    }

    return transcriptionAudio

  }

}
