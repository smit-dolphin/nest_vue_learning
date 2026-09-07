import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JobService } from '../job/job.service.js';
import { spawn } from 'child_process';


import { unlink } from 'fs/promises';
import { resolve } from 'path';



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
        });

        if (!video) {
            throw new Error('Video not found');
        }

        // Convert relative path like:
        // uploads/video.mp4
        //
        // into absolute path like:
        // /your/project/uploads/video.mp4
        const absolutePath = resolve(process.cwd(), video.path);

        try {
            await unlink(absolutePath);
            console.log(`Video file deleted: ${absolutePath}`);
        } catch (error) {
            console.error(
                `Failed to delete video file: ${absolutePath}`,
                error,
            );
        }

        // Delete database record
        return await this.prisma.video.delete({
            where: { id: videoId },
        });
    }

}
