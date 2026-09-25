import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { JobStatus } from '../../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  paginationHelper,
  searchHelper,
  enumFilter,
  dateRangeFilter,
  type PrismaWhere,
} from '../common/query/query.helpers.js';
import { ok } from '../common/response/response.js';

export interface ListJobsQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  status?: string;
  language?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class JobService {
  constructor(
    @InjectQueue('test') private readonly testQueue: Queue,
    @InjectQueue('video-processing')
    private readonly videoProcessingQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async addJobToQueue(data: any) {
    await this.testQueue.add('test-job', data);
    return { message: 'Job added to the queue successfully' };
  }

  async addVideoProcessingJob(data: any) {
    const { videoId, options } = data;

    const job = await this.videoProcessingQueue.add(
      'generate-subtitle',
      { videoId, options },
      {
        attempts: 3,

        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: {
          count: 1000,
        },
        removeOnFail: {
          count: 1000,
        },
      },
    );
    return { jobId: job.id };
  }

  async addBurnSubtitleJob(data: {
    videoId: string;
    subtitleId: string;
    options: any;
  }) {
    const { videoId, subtitleId, options } = data;
    const subtitle = await this.prisma.subtitle.findFirst({
      where: {
        id: subtitleId,
        videoId,
      },
      select: {
        subtitleFormat: true,
      },
    });

    if (!subtitle) {
      throw new BadRequestException(
        'Subtitle file was not found for this video',
      );
    }

    if (
      subtitle.subtitleFormat !== 'SRT' &&
      subtitle.subtitleFormat !== 'VTT'
    ) {
      throw new BadRequestException(
        'Only SRT and VTT subtitle files can be burned',
      );
    }

    const jobEntry = await this.prisma.subtitleJob.create({
      data: {
        videoId,
        status: 'PENDING',
      },
    });

    const job = await this.videoProcessingQueue.add(
      'burn-subtitle',
      {
        videoId,
        subtitleId,
        options,
        subtitleJobId: jobEntry.id,
      },
      {
        attempts: 3,

        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: {
          count: 1000,
        },
        removeOnFail: {
          count: 1000,
        },
      },
    );

    await this.prisma.subtitleJob.update({
      where: { id: jobEntry.id },
      data: { queueJobId: job.id },
    });

    return { jobId: job.id, historyId: jobEntry.id };
  }

  async getJobById(userId: string, jobId: string) {
    const job = await this.prisma.subtitleJob.findUnique({
      where: {
        id: jobId,
        video: {
          userId,
        },
      },
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async getJobByUserId(userId: string, query: ListJobsQuery = {}) {
    const where: PrismaWhere = {
      video: {
        userId,
      },
    };

    searchHelper(where, query.search, [
      'video.filename',
      'video.originalName',
    ]);
    enumFilter(where, 'status', query.status, JobStatus);
    enumFilter(where, 'languageCode', query.language);
    dateRangeFilter(where, 'createdAt', query.from, query.to);

    const totalData = await this.prisma.subtitleJob.count({
      where,
    });
    const { skip, take, meta } = paginationHelper(query, totalData, 10);

    const jobs = await this.prisma.subtitleJob.findMany({
      where,
      skip,
      take,
      include: {
        video: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            path: true,
            mimetype: true,
            duration: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return ok('Jobs fetched successfully', jobs, meta);
  }
}
