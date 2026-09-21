import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { spawn } from 'child_process';
import path from 'path';
import { getWhisperOutputFormat } from '../../commans/constants/outputType.constatns.js';
import * as fs from 'fs/promises';
import { StorageService } from '../storage/storage.service.js';

@Injectable()
export class TranscriptionService {
  constructor(private readonly prisma: PrismaService,
    private readonly storageService: StorageService
  ) { }




  // adding the output path for genrated audio 
  async transcriptAudio(audioPath: string, videoId: string, options: any, workDir: string): Promise<{
    localPath: string;
    filename: string;
    mimeType: string;
    size: number;
    duration: number;
    subtitleFormat: string; // extension, e.g. '.srt'
    languageCode: string;
}> {
    const subtitleFormat = getWhisperOutputFormat(options.formate);
    const languageCode = options.leng || 'en';

    const absoluteWisperPath = path.join(process.cwd(), 'Release', 'whisper-cli');
    const absoluteModelPath = path.join(process.cwd(), 'Release', 'models', 'ggml-base.bin');

    // output path now lives in workDir, no extension — whisper-cli appends it
    const outputBasePath = path.join(workDir, videoId);

    const isWordLevel = options.wordLevelTiming === true || options.wordLevelTiming === 'true';
    const wordLevelTiming = isWordLevel ? ['-owts', '-wt', '0.01'] : [];

    const wisper = spawn(absoluteWisperPath, [
        "-m", absoluteModelPath,
        "-f", audioPath,
        subtitleFormat.flag,
        "-of", outputBasePath,
        "-l", "auto",
        ...wordLevelTiming
    ]);

    wisper.stdout?.on("data", (data) => {
        console.log(`Whisper stdout: ${data.toString()}`);
    });

    wisper.stderr?.on("data", (data) => {
        console.error(`Whisper stderr: ${data.toString()}`);
    });

    await new Promise((resolve, reject) => {
        wisper.on("error", (err) => {
            reject(new Error(`failed to run wisper : ${err.message}`));
        });
        wisper.on('close', (code) => {
            if (code === 0) {
                resolve("transcription genrated successfully");
            } else {
                reject(new Error(`failed to genrate transcription : ${code}`));
            }
        });
    });

    const fullSubtitlePath = `${outputBasePath}${subtitleFormat.extension}`;
    const filename = path.basename(fullSubtitlePath);
    const fileStats = await fs.stat(fullSubtitlePath);

    return {
        localPath: fullSubtitlePath,
        filename,
        mimeType: subtitleFormat.mimeType,
        size: fileStats.size,
        duration: 0.0,
        subtitleFormat: subtitleFormat.extension,
        languageCode,
    };
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
        languageCode: file.languageCode,
        subtitleFormat: this.mapSubtitleFormat(file.subtitleFormat),
      }
    })


    if (transcriptionAudio === undefined || transcriptionAudio === null) {
      throw new InternalServerErrorException("transcription is not genrated")
    }

    return transcriptionAudio

  }

  // Maps a subtitle extension string (e.g. ".srt", ".vtt") to the schema's
  // SubtitleFormat enum ("SRT" | "VTT"). Falls back to SRT for formats the
  // schema does not support (JSON, Plain Text).
  mapSubtitleFormat(extension: string): 'SRT' | 'VTT' {
    const normalized = (extension || '').toLowerCase();
    if (normalized === '.vtt' || normalized === 'vtt') return 'VTT';
    return 'SRT';
  }

  private resolveStoredPath(storedPath: string): string {
    const root = process.cwd();

    if (storedPath.startsWith('/uploads/')) {
      return path.join(root, storedPath.slice(1));
    }

    return path.isAbsolute(storedPath)
      ? storedPath
      : path.resolve(root, storedPath);
  }

}
