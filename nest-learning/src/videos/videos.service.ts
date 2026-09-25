import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { VideoStatus, VideoType } from '../../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JobService } from '../job/job.service.js';
import { FfmpegService } from '../ffmpeg/ffmpeg.service.js';
import { spawn } from 'child_process';

import { unlink } from 'fs/promises';
import { stat } from 'fs/promises';
import { basename, dirname, isAbsolute, join, resolve } from 'path';
import { StorageService } from '../storage/storage.service.js';
import {
  paginationHelper,
  searchHelper,
  enumFilter,
  dateRangeFilter,
  type PrismaWhere,
} from '../common/query/query.helpers.js';
import { ok } from '../common/response/response.js';

export interface ListVideosQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  type?: string;
  status?: string;
  from?: string;
  to?: string;
}

export interface SubtitleStyle {
  fontSize: number;
  fontColor: string;
  background: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  position: 'bottom' | 'top' | 'middle';
  outline: number;
}

export interface SubtitleOptions {
  leng?: string;
  formate?: string;
  lables?: boolean | string;
  autoTranslate?: boolean | string;
  autoPunctuation?: boolean | string;
  wordLevelTiming?: boolean | string;
  burnVideo?: boolean | string;
  // Raw burn-in subtitle style query params (only present when burnVideo=true).
  fontSize?: number | string;
  fontColor?: string;
  background?: boolean | string;
  backgroundColor?: string;
  backgroundOpacity?: number | string;
  position?: string;
  outline?: number | string;
  subtitleStyle?: SubtitleStyle;
}

@Injectable()
export class VideosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobService: JobService,
    private readonly ffmpegService: FfmpegService,
    private readonly storageService: StorageService,
  ) {}

  async saveVideo(
    file: Express.Multer.File,
    userId: string,
    options: SubtitleOptions,
  ) {
    const duration = await this.getVideoDuration(file.path);

    const videoKey = await this.storageService.upload(
      file.path,
      `/uploads/videos/${Date.now()}-${file.filename}`,
    );

    await unlink(file.path).catch(() => {});

    const result = await this.prisma.video.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        path: videoKey,
        mimetype: file.mimetype,
        size: file.size,
        duration: duration ?? null,
        userId,
      },
    });

    if (!result) {
      throw new Error('Failed to save video');
    }

    const vidoeJob = await this.jobService.addVideoProcessingJob({
      videoId: result.id,
      options: {
        formate: options.formate,
        leng: options.leng,
        lables: options.lables,
        autoTranslate: options.autoTranslate,
        autoPunctuation: options.autoPunctuation,
        wordLevelTiming: options.wordLevelTiming,
        burnVideo: options.burnVideo,
        subtitleStyle: this.buildSubtitleStyle(options),
      },
    });
    return { result, jobId: vidoeJob.jobId, options }; // Return the saved video information along with the job ID and options
  }

  async saveUploadedVideo(file: Express.Multer.File, userId: string) {
    const duration = await this.getVideoDuration(file.path);

    const videoKey = await this.storageService.upload(
      file.path,
      `/uploads/videos/${Date.now()}-${file.filename}`,
    );

    await unlink(file.path).catch(() => {});
    const result = await this.prisma.video.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        path: videoKey,
        mimetype: file.mimetype,
        size: file.size,
        duration: duration ?? null,
        userId,
      },
    });

    if (!result) {
      throw new Error('Failed to save video');
    }

    return result;
  }

  async getSubtitleVideoById(videoId: string, options: SubtitleOptions) {
    const result = await this.prisma.video.findUnique({
      where: {
        id: videoId,
      },
    });

    if (!result) {
      throw new Error('Failed to fetch video');
    }

    const vidoeJob = await this.jobService.addVideoProcessingJob({
      videoId: result.id,
      options: {
        formate: options.formate,
        leng: options.leng,
        lables: options.lables,
        autoTranslate: options.autoTranslate,
        autoPunctuation: options.autoPunctuation,
        wordLevelTiming: options.wordLevelTiming,
        burnVideo: options.burnVideo,
        subtitleStyle: this.buildSubtitleStyle(options),
      },
    });

    return { result, jobId: vidoeJob.jobId, options };
  }

  // Normalises the burn-in subtitle style coming from query params.
  // Query params arrive as strings, so validate/coerce each value and only
  // build the style object when the video will actually be burned.
  private buildSubtitleStyle(
    options: SubtitleOptions,
  ): SubtitleStyle | undefined {
    if (options.burnVideo !== true && options.burnVideo !== 'true') {
      return undefined;
    }

    const toBool = (value: unknown): boolean | undefined => {
      if (value === undefined || value === null || value === '')
        return undefined;
      return value === true || value === 'true';
    };

    const toNumber = (value: unknown): number | undefined => {
      if (value === undefined || value === null || value === '')
        return undefined;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const position = String(options.position ?? '')
      .toLowerCase()
      .trim();
    const validPosition: SubtitleStyle['position'] =
      position === 'top' || position === 'middle' ? position : 'bottom';

    return {
      fontSize: toNumber(options.fontSize) ?? 24,
      fontColor: String(options.fontColor || 'white'),
      background: toBool(options.background) ?? true,
      backgroundColor: String(options.backgroundColor || 'black'),
      backgroundOpacity: toNumber(options.backgroundOpacity) ?? 0.8,
      position: validPosition,
      outline: toNumber(options.outline) ?? 2,
    };
  }

  // Builds the burn-in subtitle style for a burn-only job. The options
  // arrive from the request query/body, so values may already be typed,
  // but they are still coerced to be safe against string inputs.
  public buildBurnSubtitleStyle(options: SubtitleOptions): SubtitleStyle {
    return this.buildSubtitleStyle({
      ...options,
      burnVideo: true,
    }) as SubtitleStyle;
  }

  async getVideos(userId: string, query: ListVideosQuery = {}) {
    const where: PrismaWhere = { userId };

    searchHelper(where, query.search, ['filename', 'originalName']);
    enumFilter(where, 'type', query.type, VideoType);
    enumFilter(where, 'status', query.status, VideoStatus);
    dateRangeFilter(where, 'createdAt', query.from, query.to);

    const totalData = await this.prisma.video.count({ where });
    const { skip, take, meta } = paginationHelper(query, totalData, 10);

    const videos = await this.prisma.video.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } },
    });

    return ok('Videos fetched successfully', videos, meta);
  }

  async getUserVideos(userId: string) {
    return await this.prisma.video.findMany({ where: { userId } });
  }

  // Probes an uploaded video file with ffprobe and returns its duration in seconds.
  // Returns null if the file cannot be probed or duration is unavailable.
  async getVideoDuration(videoPath: string): Promise<number | null> {
    return new Promise((resolve) => {
      const ffprobe = spawn('ffprobe', [
        '-v',
        'quiet',
        '-print_format',
        'json',
        '-show_entries',
        'format=duration',
        videoPath,
      ]);

      let output = '';
      ffprobe.stdout.on('data', (chunk) => {
        output += chunk;
      });
      ffprobe.on('error', () => resolve(null));
      ffprobe.on('close', (code) => {
        if (code !== 0) {
          resolve(null);
          return;
        }
        try {
          const info = JSON.parse(output);
          const duration = Number(info?.format?.duration);
          resolve(Number.isFinite(duration) ? duration : null);
        } catch {
          resolve(null);
        }
      });
    });
  }

  async deleteVideo(videoId: string, userId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (video.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this video',
      );
    }

    const allVideos = await this.prisma.video.findMany({
      where: { userId: video.userId },
      include: {
        audio: true,
        subtitles: true,
      },
    });

    const videosToDelete = allVideos.filter((candidate) => {
      let currentId: string | null = candidate.id;

      while (currentId) {
        if (currentId === videoId) return true;

        const currentVideo = allVideos.find((item) => item.id === currentId);
        currentId = currentVideo?.parentVideoId ?? null;
      }

      return false;
    });

    for (const videoToDelete of videosToDelete) {
      await this.removeFile(videoToDelete.path, 'video');

      for (const audio of videoToDelete.audio) {
        await this.removeFile(audio.path, 'audio');
      }

      for (const subtitle of videoToDelete.subtitles) {
        await this.removeSubtitleFiles(
          subtitle.path,
          videoToDelete.id,
          'subtitle',
        );
      }
    }

    // The relation cascade removes derived video records as well.
    return await this.prisma.video.delete({
      where: { id: videoId },
    });
  }

  async streamVideo(videoId: string, userId: string) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (video.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this video',
      );
    }

    return {
      storageKey: video.path,
      filename: basename(video.filename),
      originalName: video.originalName,
      mimetype: video.mimetype,
    };
  }

  async downloadVideo(videoId: string, userId: string) {
    return this.streamVideo(videoId, userId);
  }

  async downloadAudio(videoId: string, audioId: string) {
    const audio = await this.prisma.audio.findFirst({
      where: {
        id: audioId,
        videoId,
      },
    });

    if (!audio) {
      throw new NotFoundException('Audio file not found for this video');
    }

    const filePath = this.resolveStoredPath(audio.path);

    try {
      await stat(filePath);
    } catch {
      throw new NotFoundException('Audio file not found');
    }

    return {
      filePath,
      filename: basename(audio.filename),
      mimetype: audio.mimetype,
    };
  }

  async deleteAudio(audioId: string) {
    const audio = await this.prisma.audio.findUnique({
      where: { id: audioId },
    });

    if (!audio) {
      throw new NotFoundException('Audio file not found');
    }

    await this.removeFile(audio.path, 'audio');
    return this.prisma.audio.delete({ where: { id: audioId } });
  }

  private resolveStoredPath(filePath: string) {
    return isAbsolute(filePath) && !filePath.startsWith('/uploads/')
      ? filePath
      : resolve(process.cwd(), filePath.replace(/^[/\\]+/, ''));
  }

  private async removeFile(filePath: string, fileType: string) {
    const absolutePath = this.resolveStoredPath(filePath);

    try {
      // await unlink(absolutePath);
      await this.storageService.delete(absolutePath);
      console.log(`${fileType} file deleted: ${absolutePath}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;

      console.error(
        `Failed to delete ${fileType} file: ${absolutePath}`,
        error,
      );
    }
  }

  private async removeSubtitleFiles(
    subtitlePath: string,
    videoId: string,
    fileType: string,
  ) {
    const absoluteSubtitlePath =
      isAbsolute(subtitlePath) && !subtitlePath.startsWith('/uploads/')
        ? subtitlePath
        : resolve(process.cwd(), subtitlePath.replace(/^[/\\]+/, ''));

    await this.removeFile(subtitlePath, fileType);

    const subtitleExtension = basename(absoluteSubtitlePath).lastIndexOf('.');
    const subtitleSidecarPath = join(
      dirname(absoluteSubtitlePath),
      `${videoId}.wts`,
    );
    const matchingSidecarPath =
      subtitleExtension === -1
        ? `${absoluteSubtitlePath}.wts`
        : `${absoluteSubtitlePath.slice(0, subtitleExtension)}.wts`;

    await this.removeFile(subtitleSidecarPath, 'word-timing sidecar');

    if (matchingSidecarPath !== subtitleSidecarPath) {
      await this.removeFile(matchingSidecarPath, 'word-timing sidecar');
    }
  }
}
