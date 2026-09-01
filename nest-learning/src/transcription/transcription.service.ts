import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { spawn } from 'child_process';
import path from 'path';
import { getWhisperOutputFormat } from '../../commans/constants/outputType.constatns.js';
import * as fs from 'fs/promises';

@Injectable()
export class TranscriptionService {
  constructor(private readonly prisma: PrismaService) { }




  // adding the output path for genrated audio 
  async transcriptAudio(audioPath: string, videoId: string, options: any) {

    // using process.cwd() to always resolve from project root (works in CommonJS)
    const root = process.cwd();

    // creating output path for file (no extension — whisper-cli appends it automatically)
    const absoultePath = path.join(root, 'uploads', 'subtitle', `${videoId}`);
    const absoluteWisperPath = path.join(root, 'Release', 'whisper-cli');
    const absoluteModelPath = path.join(root, 'Release', 'models', 'ggml-base.bin');

    // ensure subtitle output directory exists
    await fs.mkdir(path.join(root, 'uploads', 'subtitle'), { recursive: true });

    // resolve format safely from options (handles missing / wrong-case values)
    const subtitleFormat = getWhisperOutputFormat(options.formate);

    // word level timing check — query params arrive as strings, handle both boolean and 'true'
    const isWordLevel = options.wordLevelTiming === true || options.wordLevelTiming === 'true';
    const wordLevelTiming = isWordLevel ? ['-owts', '-wt', '0.01'] : [];

    // create spawn process and create the wisper.cpp process
    const wisper = spawn(absoluteWisperPath, [
      "-m",
      absoluteModelPath,
      "-f",
      audioPath,
      subtitleFormat.flag,       // resolved flag e.g. '-osrt'
      "-of",
      absoultePath,
      "-l",
      `${options.leng || 'en'}`,
      ...wordLevelTiming
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
          console.log('[Whisper] process exited successfully (code 0)');
          resolve("transcription genrated successfully ")
        }
        else {
          reject(new Error(`"failed to genrate transcription : ${code}`))
        }
      })

    })

    // whisper-cli appends the extension itself, so the actual file on disk is:
    //   absoultePath + subtitleFormat.extension  (e.g. "…/videoId.srt")
    const fullSubtitlePath = `${absoultePath}${subtitleFormat.extension}`;
    console.log('[Whisper] expected subtitle file path:', fullSubtitlePath);
    const filename = path.basename(fullSubtitlePath);
    const filesize = await fs.stat(fullSubtitlePath);

    const subtitleObject = {
      filename: filename,
      mimeType: subtitleFormat.mimeType,
      // store the full path including extension so downstream services can use it directly
      path: fullSubtitlePath,
      size: filesize.size,
      duration: 0.0,
      subtitleFormat: subtitleFormat.extension,
      videoId: videoId,
      languageCode: options.leng || "en"
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
    languageCode: string;
  }) {
    const transcriptionAudio = await this.prisma.subtitle.create({
      data: {
        path: file.path,
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
        duration: file.duration,
        videoId: file.videoId,
        languageCode: file.languageCode
      }
    })


    if (transcriptionAudio === undefined || transcriptionAudio === null) {
      throw new InternalServerErrorException("transcription is not genrated")
    }

    return transcriptionAudio

  }

}
