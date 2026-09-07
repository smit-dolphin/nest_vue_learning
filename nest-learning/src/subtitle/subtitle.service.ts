
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { FfmpegService } from '../ffmpeg/ffmpeg.service.js';
import { TranscriptionService } from '../transcription/transcription.service.js';
import path from 'node:path';
import { Job } from 'bullmq';
import { getWhisperOutputFormat } from '../../commans/constants/outputType.constatns.js';
import { AgentService } from '../agent/agent.service.js';

@Injectable()
export class SubtitleService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly ffmpegService: FfmpegService,
        private readonly transcriptionService: TranscriptionService,
        private readonly agentService: AgentService
    ) { }

    async genrateSubtitle(
        id: string,
        options: any,
        job: Job
    ) {

        const root = process.cwd();

        //___Find_Video_____________________________

        const videoResult = await this.prisma.video.findUnique({
            where: {
                id: id
            }
        });

        await job.updateProgress(10);

        if (videoResult === undefined || videoResult === null) {
            throw new NotFoundException("video not found");
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
            }
        });


        try {
            const shouldTranslate =
                options.autoTranslate === true ||
                options.autoTranslate === 'true';
            const targetLanguage = options.targetLanguage || options.leng || 'en';

            //___Video_to_Audio__Service_____________

            const resultGenrate =
                await this.ffmpegService.videoToAudio(
                    videoResult.path,
                    videoResult.id
                );

            await job.updateProgress(30);


            //___Audio_to_Subtitle__Service__________

            const absoluteAudioPath =
                path.join(root, resultGenrate.path);

            const resultGenratedSubtitle =
                await this.transcriptionService.transcriptAudio(
                    absoluteAudioPath,
                    videoResult.id,
                    {
                        ...options,
                        leng: shouldTranslate ? 'en' : targetLanguage,
                    }
                );

            await job.updateProgress(60);

            //___AI_Agent_based_Translation__________
            if (shouldTranslate) {
                await this.agentService.TranslateTranscribtionFile(
                    resultGenratedSubtitle.id,
                    targetLanguage
                );
            }


            //___Valid_Output_Format__Check__________

            const selectedFormat =
                getWhisperOutputFormat(options.formate);

            const shouldBurn =
                options.burnVideo === true ||
                options.burnVideo === 'true';

            const isBurnableFormat =
                selectedFormat.extension === '.srt' ||
                selectedFormat.extension === '.vtt';


            //___No_Burn____________________________

            if (!shouldBurn || !isBurnableFormat) {

                await job.updateProgress(100);

                // Mark DB job as completed
                await this.prisma.subtitleJob.update({
                    where: {
                        id: jobEntry.id
                    },
                    data: {
                        status: 'COMPLETED',
                        completedAt: new Date(),
                        errorMessage: null
                    }
                });

                return resultGenratedSubtitle;
            }


            //___Burn_Subtitle_in_Video_____________

            const burnedVideo =
                await this.ffmpegService.burnSubtitleInVideo(
                    videoResult.path,
                    this.resolveStoredPath(resultGenratedSubtitle.path)
                );

            await job.updateProgress(100);


            //___Mark_Job_Completed_________________

            await this.prisma.subtitleJob.update({
                where: {
                    id: jobEntry.id
                },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                    errorMessage: null
                }
            });


            //___Return_Burned_Video________________

            return burnedVideo;

        } catch (error) {

            //___Mark_Job_Failed___________________

            await this.prisma.subtitleJob.update({
                where: {
                    id: jobEntry.id
                },
                data: {
                    status: 'FAILED',
                    errorMessage:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                }
            });

            // IMPORTANT:
            // Re-throw the error so BullMQ
            // also marks its job as FAILED.

            throw error;
        }
    }



    // i should create services which genrate only subtitles files and limited formates 
    // and also create a service which only burn video subtitle by allowed formates 
    
    //_____Genrate_Subtitle_File_________________________
    async generateSubtitleFile(
        id: string,
        options: any,
        job: Job
    ) {
        const root = process.cwd();

        // ─────────────────────────────────────────────
        // 1. Find Video
        // ─────────────────────────────────────────────

        const videoResult = await this.prisma.video.findUnique({
            where: {
                id,
            },
        });

        await job.updateProgress(10);

        if (!videoResult) {
            throw new NotFoundException('Video not found');
        }

        // ─────────────────────────────────────────────
        // 2. Create Subtitle Job DB Entry
        // ─────────────────────────────────────────────

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

        try {
            // ─────────────────────────────────────────
            // 3. Translation Options
            // ─────────────────────────────────────────

            const shouldTranslate =
                options?.autoTranslate === true ||
                options?.autoTranslate === 'true';

            const targetLanguage =
                options?.targetLanguage ||
                options?.leng ||
                'en';

            // ─────────────────────────────────────────
            // 4. Video → Audio
            // ─────────────────────────────────────────

            const generatedAudio =
                await this.ffmpegService.videoToAudio(
                    videoResult.path,
                    videoResult.id,
                );

            await job.updateProgress(30);

            // ─────────────────────────────────────────
            // 5. Audio → Subtitle using Whisper
            // ─────────────────────────────────────────

            const absoluteAudioPath =
                path.join(root, generatedAudio.path);

            const generatedSubtitle =
                await this.transcriptionService.transcriptAudio(
                    absoluteAudioPath,
                    videoResult.id,
                    {
                        ...options,

                        // If translation is enabled:
                        // Whisper first generates English,
                        // then Gemini translates English → target.
                        //
                        // Otherwise Whisper directly generates
                        // the requested language.
                        leng: shouldTranslate
                            ? 'en'
                            : targetLanguage,
                    },
                );

            await job.updateProgress(60);

            // ─────────────────────────────────────────
            // 6. Optional AI Translation
            // ─────────────────────────────────────────

            if (shouldTranslate) {
                await this.agentService.TranslateTranscribtionFile(
                    generatedSubtitle.id,
                    targetLanguage,
                );
            }

            await job.updateProgress(80);

            // ─────────────────────────────────────────
            // 7. Mark Job Completed
            // ─────────────────────────────────────────

            await this.prisma.subtitleJob.update({
                where: {
                    id: jobEntry.id,
                },
                data: {
                    status: 'COMPLETED',
                    completedAt: new Date(),
                    errorMessage: null,
                },
            });

            await job.updateProgress(100);

            // ─────────────────────────────────────────
            // 8. Return Generated Subtitle
            // ─────────────────────────────────────────

            return generatedSubtitle;

        } catch (error) {

            // ─────────────────────────────────────────
            // Job Failed
            // ─────────────────────────────────────────

            await this.prisma.subtitleJob.update({
                where: {
                    id: jobEntry.id,
                },
                data: {
                    status: 'FAILED',
                    errorMessage:
                        error instanceof Error
                            ? error.message
                            : 'Unknown error',
                },
            });

            // Very important:
            // Let BullMQ know that the job failed.
            throw error;
        }
    }


    //_____Burn_Subtitle_in_Video_________________________
    async burnSubtitleInVideo(
        videoPath: string,
        subtitlePath: string,
    ) {
        return this.ffmpegService.burnSubtitleInVideo(
            videoPath,
            this.resolveStoredPath(subtitlePath),
        );
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
