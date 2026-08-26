import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { spawn } from 'child_process';
import path from 'path';
import * as fs from 'fs/promises';
import { PrismaService } from '../prisma/prisma.service.js';


@Injectable()
export class FfmpegService {
  constructor(private readonly prisma: PrismaService) { }



  // here we are going to create the audio to video genrator
  // first disscuss tables needed then use them
  // so what are going to do ??
  //we are going do create 1:n table with the 
  //for tables the audio also is file so we have to make thet sapration 
  //like audio also have propretys as files as type and stuff
  //current service just get video from path and save in db and return audio file data 
  async videoToAudio(videoPath: string, videoId: string) {
    //get video from path 
    //execute command from it
    //return audio file in output
    //create db entry
    // return the db entry

    // const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    // const audioOutputPath= path.resolve('upload','audio',`${unique}.wav`)
    // const audioOutputPath= `/upload/audio/${unique}.wav`


    const unique =
      Date.now() + '-' + Math.round(Math.random() * 1e9);

    // Physical directory on your computer
    const audioDirectory = path.resolve(
      'uploads',
      'audio'
    );

    // Make sure directory exists
    await fs.mkdir(audioDirectory, {
      recursive: true
    });

    // Physical filesystem path
    const audioOutputPath = path.join(
      audioDirectory,
      `${unique}.wav`
    );

    // Path that you store in DB
    const audioOutputRelativePath =
      `/uploads/audio/${unique}.wav`;
    // const audioOutputRelativePath=`/upload/audio/${unique}.wav`
    //upload/audio is exist aleady

    const audio = await this.createAudio(videoPath, audioOutputPath)

    const audioObject = {
      filename: path.basename(audioOutputPath),
      path: audioOutputRelativePath,
      mimetype: audio.format.format_name,
      size: Number(audio.format.size),
      duration: Number(audio.format.duration),
      videoId: videoId
    }
    //sotre audio in db 
    const result = await this.createAudioDbEntry(audioObject)

    console.log(result)

    //now return the reult bcs audio entry is created
    return result



  }

  async createAudio(videoPath: string, outputPath: string) {

    const ffmpeg = spawn("ffmpeg", [
      "-i",
      videoPath,
      "-vn",
      outputPath
    ])

    ffmpeg.stderr.on("data", (chunk) => {
      console.log("FFmpeg:", chunk.toString());
    });

    await new Promise((resolve, reject) => {

      ffmpeg.on("error", (error) => {
        reject(error);
      });
      ffmpeg.on("close", (code) => {
        if (code === 0) {
          resolve("ffmpeg success")
        }
        else {
          reject(new Error(`ffmpeg failed: ${code}`))
        }
      })
    })

    const ffprobe = spawn("ffprobe", [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      outputPath,
    ])

    let output = "";

    ffprobe.stdout.on("data", (chunk) => {
      output += chunk;
    });

    await new Promise((resolve, reject) => {

      ffprobe.on("error", (error) => {
        reject(error);
      });
      ffprobe.on("close", (code) => {
        if (code === 0) {
          resolve("ffprobe success!")
        }
        else {
          reject(new Error(`ffprobe failed: ${code}`))
        }
      })
    })

    const info = JSON.parse(output);





    return info

  }

  async createAudioDbEntry(file: {
    filename: string;
    path: string;
    mimetype: string;
    size: number;
    duration?: number;
    videoId: string;
  }) {

    const result = await this.prisma.audio.create({
      data: {
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        duration: file.duration,
        videoId: file.videoId,
      }
    })


    if (!result || result === undefined) {
      throw new InternalServerErrorException("failed to create audio entry")
    }

    return result

  }

  async burnSubtitleInVideo(videoPath: string, subtitlePath: string) {
    const root = process.cwd();

    const outputPath = path.join(
      root,
      'uploads',
      'output',
      `burned-${Date.now()}.mp4`
    );

    const subtitleFilterPath = this.escapeSubtitlePath(subtitlePath);
    console.log("path of burned video srt",subtitleFilterPath)

    const ffmpeg = spawn('ffmpeg', [
      '-i',
      videoPath,

      '-vf',
      `subtitles='${subtitleFilterPath}'`,

      outputPath,
    ]);

    ffmpeg.stderr.on('data', (data) => {
      console.log('ffmpeg:', data.toString());
    });

    await new Promise((resolve, reject) => {
      ffmpeg.on('error', reject);

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve('done');
        } else {
          reject(new Error(`failed to burn subtitle ${code}`));
        }
      });
    });

    return {
      path: outputPath,
    };
  }

  escapeSubtitlePath(filePath: string) {
  return filePath
    .replace(/\\/g, '/')
.replace(/:/g, '\\:')
}




}


