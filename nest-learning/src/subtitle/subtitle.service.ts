import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SubtitleFormat } from '../../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { FfmpegService } from '../ffmpeg/ffmpeg.service.js';
import { TranscriptionService } from '../transcription/transcription.service.js';
import path, { resolve } from 'node:path';
import { readdir, readFile, rm, stat, unlink } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { Job } from 'bullmq';
import { getWhisperOutputFormat } from '../../commans/constants/outputType.constatns.js';
import { AgentService } from '../agent/agent.service.js';
import { NotFoundError } from 'rxjs';
import { cwd } from 'node:process';
import { StorageService } from '../storage/storage.service.js';
import { createWorkDir, cleanupWorkDir } from '../storage/tmp-workspace.js';
import { Result } from 'pg';
import {
  paginationHelper,
  searchHelper,
  enumFilter,
  dateRangeFilter,
  type PrismaWhere,
} from '../common/query/query.helpers.js';
import { ok } from '../common/response/response.js';

export interface ListSubtitlesQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  format?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class SubtitleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ffmpegService: FfmpegService,
    private readonly transcriptionService: TranscriptionService,
    private readonly agentService: AgentService,
    private readonly storageService: StorageService,
  ) {}

  async genrateSubtitle(id: string, options: any, job: Job) {
    //___Find_Video_____________________________

    const videoResult = await this.prisma.video.findUnique({
      where: { id },
    });

    await job.updateProgress(10);

    if (!videoResult) {
      throw new NotFoundException('video not found');
    }

    //___Create_Subtitle_Job_DB_Entry____________

    const jobEntry = await this.prisma.subtitleJob.create({
      data: {
        videoId: videoResult.id,
        queueJobId: job.id,
        languageCode: options?.leng || 'en',
        status: 'PROCESSING',
        startedAt: new Date(),
        completedAt: null,
        errorMessage: null,
      },
    });

    // ── ONE workDir for the whole job ──
    const workDir = await createWorkDir(String(job.id));

    // ── ONE checkout for the source video ──
    const { localPath: videoLocalPath, cleanup: cleanupVideo } =
      await this.storageService.getLocalCopy(videoResult.path);

    try {
      const shouldTranslate =
        options?.autoTranslate === true || options?.autoTranslate === 'true';
      const targetLanguage = options?.targetLanguage || options?.leng || 'en';

      //___Video_to_Audio__Service_____________

      const audioResult = await this.ffmpegService.videoToAudio(
        videoLocalPath,
        videoResult.id,
        workDir,
      );

      await job.updateProgress(30);

      const subtitleResult = await this.agentService.transcriptAudioGemini(
        audioResult.localPath,
        videoResult.id,
        { ...options, leng: targetLanguage },
        workDir,
      );
      const finalSubtitleLocalPath = subtitleResult.localPath;
      const finalSubtitleFilename = subtitleResult.filename;

      // ── Persist the subtitle now that we know the pipeline got this far ──
      const subtitleKey = await this.storageService.upload(
        finalSubtitleLocalPath,
        `/uploads/subtitle/${videoResult.id}-${Date.now()}${subtitleResult.subtitleFormat}`,
      );

      const subtitleOriginalName = this.deriveSubtitleName(videoResult);

      const subtitleRecord = await this.prisma.subtitle.create({
        data: {
          filename: finalSubtitleFilename,
          originalName: `${subtitleOriginalName}${subtitleResult.subtitleFormat}`,
          mimeType: subtitleResult.mimeType,
          path: subtitleKey,
          size: subtitleResult.size,
          duration: subtitleResult.duration,
          videoId: videoResult.id,
          languageCode: shouldTranslate
            ? targetLanguage
            : subtitleResult.languageCode,
          subtitleFormat: this.transcriptionService.mapSubtitleFormat(
            subtitleResult.subtitleFormat,
          ),
        },
      });

      //___Valid_Output_Format__Check__________

      const selectedFormat = getWhisperOutputFormat(options?.formate);
      const shouldBurn =
        options?.burnVideo === true || options?.burnVideo === 'true';
      const isBurnableFormat =
        selectedFormat.extension === '.srt' ||
        selectedFormat.extension === '.vtt';

      //___No_Burn____________________________

      if (!shouldBurn || !isBurnableFormat) {
        await job.updateProgress(100);

        await this.prisma.subtitleJob.update({
          where: { id: jobEntry.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            errorMessage: null,
          },
        });
        const createNotification = await this.prisma.notification.create({
          data: {
            userId: videoResult.userId,
            type: 'JOB_COMPLETED',
            title: 'Subtitle generation completed',
            message: 'Your video subtitles have been generated successfully.',
            data: {
              jobId: job.id,
              videoId: videoResult.id,
              subtitleId: subtitleRecord.id,
            },
          },
        });

        return subtitleRecord;
      }

      //___Burn_Subtitle_in_Video_____________

      const burnedVideo = await this.ffmpegService.burnSubtitleInVideo(
        videoLocalPath,
        finalSubtitleLocalPath, // still local, no re-download needed — same workDir
        workDir,
        options?.subtitleStyle,
      );

      const burnedVideoStats = await stat(burnedVideo.localPath);
      const burnedVideoDuration = await this.getVideoDuration(
        burnedVideo.localPath,
      );

      // ── Persist the burned video ──
      const burnedKey = await this.storageService.upload(
        burnedVideo.localPath,
        `/uploads/output/${videoResult.id}-burned-${Date.now()}.mp4`,
      );

      const burnedVideoRecord = await this.prisma.video.create({
        data: {
          filename: burnedVideo.filename,
          originalName: `${this.deriveSubtitleName(videoResult)}-burned.mp4`,
          path: burnedKey,
          mimetype: 'video/mp4',
          size: burnedVideoStats.size,
          duration: burnedVideoDuration,
          type: 'BURNED_VIDEO',
          userId: videoResult.userId,
          parentVideoId: videoResult.id,
        },
      });

      await job.updateProgress(100);

      //___Mark_Job_Completed_________________

      await this.prisma.subtitleJob.update({
        where: { id: jobEntry.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          errorMessage: null,
        },
      });

      //___Return_Burned_Video________________

      const createNotification = await this.prisma.notification.create({
        data: {
          userId: videoResult.userId,
          type: 'JOB_COMPLETED',
          title: 'Subtitle generation completed',
          message: 'Your video subtitles have been generated successfully.',
          data: {
            jobId: job.id,
            videoId: videoResult.id,
            subtitleId: subtitleRecord.id,
            ...(burnedVideoRecord && {
              burnedVideoId: burnedVideoRecord.id,
            }),
          },
        },
      });

      return burnedVideoRecord;
    } catch (error) {
      //___Mark_Job_Failed___________________

      await this.prisma.subtitleJob.update({
        where: { id: jobEntry.id },
        data: {
          status: 'FAILED',
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      const createNotification = await this.prisma.notification.create({
        data: {
          userId: videoResult.userId,
          type: 'JOB_FAILED',
          title: 'Subtitle generation failed',
          message: 'Your video subtitles have been failed.',
          data: {
            jobId: job.id,
            videoId: videoResult.id,
          },
        },
      });

      throw error;
    } finally {
      // ── ONE cleanup for everything: checked-out video + entire workDir ──
      await cleanupVideo();
      await cleanupWorkDir(String(job.id));
    }
  }

  private async getVideoDuration(videoPath: string): Promise<number | null> {
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
      ffprobe.stdout.on('data', (chunk: Buffer) => {
        output += chunk.toString();
      });
      ffprobe.on('error', () => resolve(null));
      ffprobe.on('close', (code: number) => {
        if (code !== 0) {
          resolve(null);
          return;
        }

        try {
          const duration = Number(JSON.parse(output)?.format?.duration);
          resolve(Number.isFinite(duration) ? duration : null);
        } catch {
          resolve(null);
        }
      });
    });
  }

  async burnExistingSubtitle(
    videoId: string,
    subtitleId: string,
    job: Job,
    options: any,
    subtitleJobId: string,
  ) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });
    const subtitle = await this.prisma.subtitle.findUnique({
      where: { id: subtitleId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (!subtitle) {
      throw new NotFoundException('Subtitle not found');
    }

    if (subtitle.videoId !== video.id) {
      throw new Error('Subtitle does not belong to this video');
    }

    await this.prisma.subtitleJob.update({
      where: { id: subtitleJobId },
      data: {
        status: 'PROCESSING',
        startedAt: new Date(),
        errorMessage: null,
      },
    });

    await job.updateProgress(20);

    // ── ONE workDir for this job ──
    const workDir = await createWorkDir(String(job.id));

    // ── Checkout both inputs — this IS a separate job, so real checkout applies ──
    const { localPath: videoLocalPath, cleanup: cleanupVideo } =
      await this.storageService.getLocalCopy(video.path);
    const { localPath: subtitleLocalPath, cleanup: cleanupSubtitle } =
      await this.storageService.getLocalCopy(subtitle.path);

    try {
      const burnedVideo = await this.ffmpegService.burnSubtitleInVideo(
        videoLocalPath,
        subtitleLocalPath,
        workDir,
        options?.subtitleStyle,
      );

      await job.updateProgress(80);

      const burnedVideoStats = await stat(burnedVideo.localPath);
      const burnedVideoDuration = await this.getVideoDuration(
        burnedVideo.localPath,
      );

      // ── Persist the burned video now that ffmpeg succeeded ──
      const burnedKey = await this.storageService.upload(
        burnedVideo.localPath,
        `/uploads/output/${videoId}-burned-${Date.now()}.mp4`,
      );

      const result = await this.prisma.video.create({
        data: {
          filename: burnedVideo.filename,
          originalName: `${this.deriveSubtitleName(video)}-burned.mp4`,
          path: burnedKey,
          mimetype: 'video/mp4',
          size: burnedVideoStats.size,
          duration: burnedVideoDuration,
          type: 'BURNED_VIDEO',
          userId: video.userId,
          parentVideoId: video.id,
        },
      });

      await this.prisma.subtitleJob.update({
        where: { id: subtitleJobId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          errorMessage: null,
        },
      });

      await job.updateProgress(100);
      return result;
    } catch (error) {
      await this.prisma.subtitleJob.update({
        where: { id: subtitleJobId },
        data: {
          status: 'FAILED',
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    } finally {
      await cleanupVideo();
      await cleanupSubtitle();
      await cleanupWorkDir(String(job.id));
    }
  }

  async getSubtitleFiles(
    videoId: string,
    userId: string,
    query: ListSubtitlesQuery = {},
  ) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    if (video.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access subtitles for this video',
      );
    }

    const where: PrismaWhere = {
      videoId: videoId,
    };

    searchHelper(where, query.search, ['filename', 'languageCode']);
    enumFilter(where, 'subtitleFormat', query.format, SubtitleFormat);
    dateRangeFilter(where, 'createdAt', query.from, query.to);

    const totalData = await this.prisma.subtitle.count({
      where,
    });

    if (totalData === 0) {
      throw new NotFoundException(
        'No subtitle files found for the given video ID',
      );
    }

    const { skip, take, meta } = paginationHelper(query, totalData, 10);

    const subtitleFiles = await this.prisma.subtitle.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return ok('Subtitles fetched successfully', subtitleFiles, meta);
  }

  async getSubtitleContent(id: string, userId: string) {
    const subtitle = await this.prisma.subtitle.findUnique({
      where: { id },
      include: { video: true },
    });

    if (!subtitle) {
      throw new NotFoundException('Subtitle not found');
    }

    if (subtitle.video.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this subtitle',
      );
    }

    const exists = await this.storageService.exists(subtitle.path);
    if (!exists) {
      throw new NotFoundException('Subtitle file not found');
    }

    const { localPath, cleanup } = await this.storageService.getLocalCopy(
      subtitle.path,
    );

    try {
      return readFile(localPath, 'utf8');
    } finally {
      cleanup();
    }
  }

  async downloadSubtitle(id: string, userId: string) {
    const subtitle = await this.prisma.subtitle.findUnique({
      where: { id },
      include: { video: true },
    });

    if (!subtitle) {
      throw new NotFoundException('Subtitle not found');
    }

    if (subtitle.video.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to download this subtitle',
      );
    }

    const exists = await this.storageService.exists(subtitle.path);
    if (!exists) {
      throw new NotFoundException('Subtitle file not found');
    }

    const { localPath } = await this.storageService.getLocalCopy(subtitle.path);

    return {
      filePath: localPath,
      filename: subtitle.filename,
      originalName: subtitle.originalName,
      mimeType: subtitle.mimeType,
    };
  }

  async deleteSubtitleById(subtitleId: string, userId: string) {
    const sub = await this.prisma.subtitle.findUnique({
      where: { id: subtitleId },
      include: { video: true },
    });

    if (!sub) {
      throw new NotFoundException('The subtitle not found');
    }

    if (sub.video.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this subtitle',
      );
    }

    // sub.path is the storage key, e.g. "/uploads/subtitle/abc123-171234.srt"
    // sub.videoId is the video this subtitle belongs to
    const deletedFile = await this.deleteFilesFromStorage(
      sub.path,
      sub.videoId,
    );

    const result = await this.prisma.subtitle.delete({
      where: { id: sub.id },
    });

    return { result, deletedFile };
  }

  async cleanupLocalFiles() {
    const jobDirectory = path.resolve(process.cwd(), 'temp', 'job');

    const entries = await readdir(jobDirectory);

    await Promise.all(
      entries.map((entry) =>
        rm(path.join(jobDirectory, entry), {
          recursive: true,
          force: true,
        }),
      ),
    );
  }

  /**
   * Builds a friendly base name (no extension) for generated files using the
   * parent video's original name, falling back to its stored filename.
   */
  private deriveSubtitleName(video: {
    originalName?: string | null;
    filename: string;
  }): string {
    const name = video.originalName?.trim() || video.filename;
    const ext = path.extname(name);
    const base = ext ? name.slice(0, -ext.length) : name;
    return base.trim() || 'subtitle';
  }

  private async deleteFilesFromStorage(
    storageKey: string,
    videoId?: string,
  ): Promise<string[]> {
    const keysToDelete = new Set<string>();
    keysToDelete.add(storageKey);

    const extension = path.extname(storageKey);
    const baseName = path.basename(storageKey, extension);
    const directory = path.dirname(storageKey);

    keysToDelete.add(
      extension ? path.join(directory, `${baseName}.wts`) : `${storageKey}.wts`,
    );

    if (videoId) {
      keysToDelete.add(path.join(directory, `${videoId}.wts`));
    }

    const deletedFiles: string[] = [];

    for (const key of keysToDelete) {
      const existed = await this.storageService.exists(key);
      if (existed) {
        await this.storageService.delete(key);
        deletedFiles.push(key);
      }
    }

    return deletedFiles;
  }
}
