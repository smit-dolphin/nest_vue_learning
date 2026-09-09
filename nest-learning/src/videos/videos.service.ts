import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JobService } from '../job/job.service.js';
import { spawn } from 'child_process';


import { unlink } from 'fs/promises';
import { stat } from 'fs/promises';
import { basename, isAbsolute, resolve } from 'path';



export interface SubtitleOptions {
    leng: string;
    formate: string;
    lables: boolean;
    autoTranslate: boolean;
    autoPunctuation: boolean;
    wordLevelTiming: boolean;
    burnVideo: boolean;
}

@Injectable()
export class VideosService {

    constructor(private readonly prisma: PrismaService,
        private readonly jobService: JobService
    ) { }

    async saveVideo(file: Express.Multer.File, userId: string, options: SubtitleOptions) {
        const duration = await this.getVideoDuration(file.path);

        const result = await this.prisma.video.create({
            data: {
                filename: file.filename,
                path: file.path,
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
            videoId: result.id, options: {
                formate: options.formate,
                leng: options.leng,
                lables: options.lables,
                autoTranslate: options.autoTranslate,
                autoPunctuation: options.autoPunctuation,
                wordLevelTiming: options.wordLevelTiming,
                burnVideo: options.burnVideo,
            }
        });
        return { result, jobId: vidoeJob.jobId, options }; // Return the saved video information along with the job ID and options
    }

    async saveUploadedVideo(file: Express.Multer.File, userId: string) {
        const duration = await this.getVideoDuration(file.path);

        const result = await this.prisma.video.create({
            data: {
                filename: file.filename,
                path: file.path,
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

    async getSubtitleVideoById(videoId: string,options: SubtitleOptions) {

        const result = await this.prisma.video.findUnique({
            where: {
                id: videoId,
            }
        });

        if (!result) {
            throw new Error('Failed to fetch video');
        }

        const vidoeJob = await this.jobService.addVideoProcessingJob({
            videoId:result.id, options: {
                formate: options.formate,
                leng: options.leng,
                lables: options.lables,
                autoTranslate: options.autoTranslate,
                autoPunctuation: options.autoPunctuation,
                wordLevelTiming: options.wordLevelTiming,
                burnVideo: options.burnVideo,
            }
        });

        return { result, jobId: vidoeJob.jobId, options }
    }

    async getVideos() {
        return await this.prisma.video.findMany({ include: { user: { select: { email: true } } } });
    }

    async getUserVideos(userId: string) {
        return await this.prisma.video.findMany({ where: { userId } });
    }

    // Probes an uploaded video file with ffprobe and returns its duration in seconds.
    // Returns null if the file cannot be probed or duration is unavailable.
    async getVideoDuration(videoPath: string): Promise<number | null> {
        return new Promise((resolve) => {
            const ffprobe = spawn('ffprobe', [
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_entries', 'format=duration',
                videoPath,
            ]);

            let output = '';
            ffprobe.stdout.on('data', (chunk) => { output += chunk; });
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


    async deleteVideo(videoId: string) {
        const video = await this.prisma.video.findUnique({
            where: { id: videoId },
            include: {
                audio: true,
                subtitles: true,
                derivedVideos: {
                    include: {
                        audio: true,
                        subtitles: true,
                    },
                },
            },
        });

        if (!video) {
            throw new Error('Video not found');
        }

        await this.removeFile(video.path, 'video');

        for (const audio of video.audio) {
            await this.removeFile(audio.path, 'audio');
        }

        for (const subtitle of video.subtitles) {
            await this.removeFile(subtitle.path, 'subtitle');
        }

        for (const derivedVideo of video.derivedVideos) {
            await this.removeFile(derivedVideo.path, 'derived video');

            for (const audio of derivedVideo.audio) {
                await this.removeFile(audio.path, 'derived audio');
            }

            for (const subtitle of derivedVideo.subtitles) {
                await this.removeFile(subtitle.path, 'derived subtitle');
            }
        }

        // The relation cascade removes derived video records as well.
        return await this.prisma.video.delete({
            where: { id: videoId },
        });
    }

    async streamVideo(videoId: string) {
        const video = await this.prisma.video.findUnique({
            where: { id: videoId },
        });

        if (!video) {
            throw new NotFoundException('Video not found');
        }

        const filePath = isAbsolute(video.path)
            ? video.path
            : resolve(process.cwd(), video.path.replace(/^[/\\]+/, ''));

        try {
            await stat(filePath);
        } catch {
            throw new NotFoundException('Video file not found');
        }

        return {
            filePath,
            filename: basename(video.filename),
            mimetype: video.mimetype,
        };
    }

    async downloadVideo(videoId: string) {
        return this.streamVideo(videoId);
    }

    private async removeFile(filePath: string, fileType: string) {
        const absolutePath = resolve(process.cwd(), filePath.replace(/^[/\\]+/, ''));

        try {
            await unlink(absolutePath);
            console.log(`${fileType} file deleted: ${absolutePath}`);
        } catch (error) {
            console.error(
                `Failed to delete ${fileType} file: ${absolutePath}`,
                error,
            );
        }
    }

}
