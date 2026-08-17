import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { spawn } from 'child_process';
import path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class TranscriptionService {
  constructor(private readonly prisma: PrismaService) {}

  transcribeAudio(audioPath: string, outputDir: string, format: 'vtt' | 'srt' = 'vtt'): Promise<string> {
    return new Promise((resolve, reject) => {
      // Running the standard whisper CLI command
      // Example: whisper audio.wav --model base --output_dir ./uploads/subtitles --output_format vtt
      const whisper = spawn('whisper', [
        audioPath,
        '--model', 'base',
        '--output_dir', outputDir,
        '--output_format', format
      ]);

      whisper.stderr.on('data', (data) => {
        console.log(`Whisper (stderr): ${data}`);
      });

      whisper.stdout.on('data', (data) => {
        console.log(`Whisper (stdout): ${data}`);
      });

      whisper.on('error', (error) => {
        reject(error);
      });

      whisper.on('close', (code) => {
        if (code === 0) {
          // Whisper generates the output file using the original filename but with the format extension.
          const parsedPath = path.parse(audioPath);
          const outputPath = path.join(outputDir, `${parsedPath.name}.${format}`);
          resolve(outputPath);
        } else {
          reject(new Error(`Whisper process exited with code ${code}`));
        }
      });
    });
  }

  async generateTextFromAudio(videoId: string) {
    // 1. Fetch the audio record associated with this video
    const audio = await this.prisma.audio.findUnique({
      where: { videoId },
    });

    if (!audio) {
      throw new NotFoundException(`Audio not found for video ID ${videoId}`);
    }

    // 2. Prepare output directory
    const outputDir = path.join(process.cwd(), 'uploads', 'subtitles');
    await fs.mkdir(outputDir, { recursive: true });

    // 3. Transcribe audio to VTT format (STT)
    let subtitlePath: string;
    try {
      subtitlePath = await this.transcribeAudio(audio.path, outputDir, 'vtt');
    } catch (error) {
      throw new InternalServerErrorException(`Failed to transcribe audio: ${error.message}`);
    }

    // 4. Save Subtitle record in DB
    const subtitleRecord = await this.prisma.subtitle.create({
      data: {
        language: 'auto', // Whisper usually auto-detects language
        format: 'VTT',
        path: subtitlePath,
        videoId: videoId,
      },
    });

    return subtitleRecord;
  }
}
