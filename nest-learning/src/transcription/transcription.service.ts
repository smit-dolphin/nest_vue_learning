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
    private readonly storageService:StorageService
  ) { }




  // adding the output path for genrated audio 
  async transcriptAudio(audioPath: string, videoId: string, options: any) {

    // using process.cwd() to always resolve from project root (works in CommonJS)
    const root = process.cwd();

    const subtitleFormat = getWhisperOutputFormat(options.formate);
    const languageCode = options.leng || 'en';
    const subtitleFormatEnum = this.mapSubtitleFormat(subtitleFormat.extension);

    const existingSubtitleRecords = await this.prisma.subtitle.findMany({
      where: {
        videoId,
        languageCode,
        mimeType: subtitleFormat.mimeType,
        subtitleFormat: subtitleFormatEnum,
      },
      orderBy: { createdAt: 'desc' },
    });

    for (const existingSubtitle of existingSubtitleRecords) {
      const existingExtension = path.extname(
        existingSubtitle.filename || existingSubtitle.path,
      ).toLowerCase();

      if (existingExtension !== subtitleFormat.extension) {
        continue;
      }

      const existingSubtitlePath = this.resolveStoredPath(existingSubtitle.path);

      try {
        await fs.access(existingSubtitlePath);
        return existingSubtitle;
      } catch {
        await this.prisma.subtitle.delete({ where: { id: existingSubtitle.id } });
      }
    }


    //  so here we are goint to start support the changes 
    // we need to download the file from key
    const localSubtitleFile=await this.storageService.downloadToLocal(audioPath)
    //now local file will be given to processing 


    // creating output path for file (no extension — whisper-cli appends it automatically)
    const absoultePath = path.join(root, 'uploads', 'subtitle', `${videoId}`);
    const absoluteWisperPath = path.join(root, 'Release', 'whisper-cli');
    const absoluteModelPath = path.join(root, 'Release', 'models', 'ggml-small.bin');

    // ensure subtitle output directory exists
    await fs.mkdir(path.join(root, 'uploads', 'subtitle'), { recursive: true });

    // resolve format safely from options (handles missing / wrong-case values)
    // word level timing check — query params arrive as strings, handle both boolean and 'true'
    const isWordLevel = options.wordLevelTiming === true || options.wordLevelTiming === 'true';
    const wordLevelTiming = isWordLevel ? ['-owts', '-wt', '0.01'] : [];

    // create spawn process and create the wisper.cpp process
    const wisper = spawn(absoluteWisperPath, [
      "-m",
      absoluteModelPath,
      "-f",
      localSubtitleFile,
      subtitleFormat.flag,       // resolved flag e.g. '-osrt'
      "-of",
      absoultePath,
      "-l",
      "auto",
      ...wordLevelTiming
    ])

    // `${options.leng || 'en'}`

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
    const storedSubtitlePath = path.relative(root, fullSubtitlePath);
    console.log('[Whisper] expected subtitle file path:', fullSubtitlePath);
    const filename = path.basename(fullSubtitlePath);
    const filesize = await fs.stat(fullSubtitlePath);

    const subtitleObject = {
      filename: filename,
      mimeType: subtitleFormat.mimeType,
      path: storedSubtitlePath,
      size: filesize.size,
      duration: 0.0,
      subtitleFormat: subtitleFormat.extension,
      videoId: videoId,
      languageCode,
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
