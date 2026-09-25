import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { spawn } from 'child_process';
import path from 'path';
import * as fs from 'fs/promises';
import { PrismaService } from '../prisma/prisma.service.js';
import { StorageService } from '../storage/storage.service.js';

interface SubtitleBurnStyle {
  fontSize?: number;
  fontColor?: string;
  background?: boolean;
  backgroundColor?: string;
  backgroundOpacity?: number;
  position?: 'bottom' | 'top' | 'middle';
  outline?: number;
}

@Injectable()
export class FfmpegService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storagService: StorageService,
  ) {}

  // here we are going to create the audio to video genrator
  // first disscuss tables needed then use them
  // so what are going to do ??
  //we are going do create 1:n table with the
  //for tables the audio also is file so we have to make thet sapration
  //like audio also have propretys as files as type and stuff
  //current service just get video from path and save in db and return audio file data
  async videoToAudio(videoPath: string, videoId: string, workDir: string) {
    //get video from path
    //execute command from it
    //return audio file in output
    //create db entry
    // return the db entry

    // const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    // const audioOutputPath= path.resolve('upload','audio',`${unique}.wav`)
    // const audioOutputPath= `/upload/audio/${unique}.wav`

    // const existingAudioRecords = await this.prisma.audio.findMany({
    //   where: { videoId },
    //   orderBy: { createdAt: 'desc' },
    // });

    // for (const existingAudio of existingAudioRecords) {
    //   const stillexist=await this.storagService.exists(existingAudio.path);

    //   if (stillexist){
    //     return existingAudio
    //   }

    //   await this.prisma.audio.delete({ where: { id: existingAudio.id } });

    // }

    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);

    // Physical directory on your computer
    // const audioDirectory = path.resolve(
    //   'uploads',
    //   'audio'
    // );

    // Make sure directory exists
    // await fs.mkdir(audioDirectory, {
    //   recursive: true
    // });

    // Physical filesystem path
    // const audioOutputPath = path.join(
    //   audioDirectory,
    //   `${unique}.wav`
    // );

    // Path that you store in DB
    // const audioOutputRelativePath =
    //   `/uploads/audio/${unique}.wav`;
    // const audioOutputRelativePath=`/upload/audio/${unique}.wav`
    //upload/audio is exist aleady

    const audioOutputPath = path.join(workDir, `${unique}.mp3`);

    const audio = await this.createAudio(videoPath, audioOutputPath);

    return {
      localPath: audioOutputPath,
      filename: path.basename(audioOutputPath),
      mimetype: audio.format.format_name,
      size: Number(audio.format.size),
      duration: Number(audio.format.duration),
    };
  }

  async createAudio(videoPath: string, outputPath: string) {
    // const ffmpeg = spawn("ffmpeg", [
    //   "-i",
    //   videoPath,
    //   "-vn",
    //   outputPath
    // ])
    const ffmpeg = spawn('ffmpeg', [
      '-i',
      videoPath,
      '-vn',
      '-ac',
      '1',
      '-ar',
      '16000',
      '-b:a',
      '64k',
      outputPath,
    ]);

    ffmpeg.stderr.on('data', (chunk) => {
      console.log('FFmpeg:', chunk.toString());
    });

    await new Promise((resolve, reject) => {
      ffmpeg.on('error', (error) => {
        reject(error);
      });
      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve('ffmpeg success');
        } else {
          reject(new Error(`ffmpeg failed: ${code}`));
        }
      });
    });

    const ffprobe = spawn('ffprobe', [
      '-v',
      'quiet',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      outputPath,
    ]);

    let output = '';

    ffprobe.stdout.on('data', (chunk) => {
      output += chunk;
    });

    await new Promise((resolve, reject) => {
      ffprobe.on('error', (error) => {
        reject(error);
      });
      ffprobe.on('close', (code) => {
        if (code === 0) {
          resolve('ffprobe success!');
        } else {
          reject(new Error(`ffprobe failed: ${code}`));
        }
      });
    });

    const info = JSON.parse(output);

    return info;
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
      },
    });

    if (!result || result === undefined) {
      throw new InternalServerErrorException('failed to create audio entry');
    }

    return result;
  }

  async burnSubtitleInVideo(
    videoPath: string,
    subtitlePath: string,
    workDir: string,
    subtitleStyle?: SubtitleBurnStyle,
  ) {
    const outputPath = path.join(workDir, `burned-${Date.now()}.mp4`);

    const subtitleFilterPath = this.escapeSubtitlePath(subtitlePath);
    const forceStyle = this.buildSubtitleForceStyle(subtitleStyle);

    const ffmpeg = spawn('ffmpeg', [
      '-i',
      videoPath,
      '-vf',
      `subtitles='${subtitleFilterPath}':force_style='${forceStyle}'`,
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
      localPath: outputPath, // renamed from `path` for consistency with the other 3 services' return shapes
      filename: path.basename(outputPath),
    };
  }

  escapeSubtitlePath(filePath: string) {
    return filePath.replace(/\\/g, '/').replace(/:/g, '\\:');
  }

  // Builds an ffmpeg "force_style" (ASS style) string from the burn-in
  // subtitle style settings coming from the frontend query params.
  private buildSubtitleForceStyle(style?: SubtitleBurnStyle): string {
    const {
      fontSize = 24,
      fontColor = 'white',
      background = true,
      backgroundColor = 'black',
      backgroundOpacity = 0.8,
      position = 'bottom',
      outline = 2,
    } = style || {};

    const parts: string[] = [
      `FontSize=${Math.max(4, Math.round(fontSize))}`,
      `PrimaryColour=${this.cssColorToAss(fontColor, 0)}`,
    ];

    if (background) {
      // Alpha byte: 00 = fully opaque, FF = fully transparent.
      // backgroundOpacity 0..1 -> transparency 1 - backgroundOpacity.
      const alpha = Math.round(
        255 * Math.min(1, Math.max(0, 1 - backgroundOpacity)),
      );

      parts.push('BorderStyle=4');
      parts.push(`BackColour=${this.cssColorToAss(backgroundColor, alpha)}`);
      // BorderStyle 4 renders an opaque box sized by the outline value.
      parts.push(`Outline=${Math.max(2, Math.round(outline))}`);
    } else {
      parts.push('BorderStyle=1');
      parts.push(`Outline=${Math.max(0, Math.round(outline))}`);
      parts.push('BackColour=&H80000000&');
      parts.push('Shadow=1');
    }

    parts.push(`Alignment=${this.positionToAssAlignment(position)}`);

    return parts.join(',');
  }

  // Converts a CSS color (#rgb / #rrggbb or common color names) into an
  // ASS colour code: &HAABBGGRR& (alpha, blue, green, red).
  private cssColorToAss(color: string, alpha: number): string {
    const rgb = this.parseCssColor(color);
    const alphaByte = Math.min(255, Math.max(0, alpha))
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();

    const bgr =
      rgb.b.toString(16).padStart(2, '0').toUpperCase() +
      rgb.g.toString(16).padStart(2, '0').toUpperCase() +
      rgb.r.toString(16).padStart(2, '0').toUpperCase();

    return `&H${alphaByte}${bgr}&`;
  }

  private parseCssColor(color: string): { r: number; g: number; b: number } {
    const named: Record<string, string> = {
      white: '#ffffff',
      black: '#000000',
      red: '#ff0000',
      green: '#008000',
      blue: '#0000ff',
      yellow: '#ffff00',
      cyan: '#00ffff',
      magenta: '#ff00ff',
      orange: '#ffa500',
      purple: '#800080',
      gray: '#808080',
      grey: '#808080',
    };

    const trimmed = (color || '').trim();
    let hex = (named[trimmed.toLowerCase()] ?? trimmed)
      .replace(/^#/, '')
      .toLowerCase();

    if (/^[0-9a-f]{3}$/.test(hex)) {
      hex = hex
        .split('')
        .map((char) => char + char)
        .join('');
    }

    if (!/^[0-9a-f]{6}$/.test(hex)) {
      hex = 'ffffff';
    }

    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  private positionToAssAlignment(position?: string): number {
    switch (position) {
      case 'top':
        return 8;
      case 'middle':
        return 5;
      case 'bottom':
      default:
        return 2;
    }
  }
}
