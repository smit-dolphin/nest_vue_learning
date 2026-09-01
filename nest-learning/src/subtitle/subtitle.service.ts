
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { FfmpegService } from '../ffmpeg/ffmpeg.service.js';
import { TranscriptionService } from '../transcription/transcription.service.js';
import path from 'node:path';
import { Job } from 'bullmq';
import { getWhisperOutputFormat } from '../../commans/constants/outputType.constatns.js';

@Injectable()
export class SubtitleService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly ffmpegService: FfmpegService,
        private readonly transcriptionService: TranscriptionService
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
                languageCode: options?.leng || 'en',
                status: 'PROCESSING',
                startedAt: new Date(),
                completedAt: null,
                errorMessage: null,
            }
        });


        try {

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
                    options
                );

            await job.updateProgress(60);


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
                    resultGenratedSubtitle.path
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
}
