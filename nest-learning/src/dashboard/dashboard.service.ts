import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

type JobStatusKey = 'done' | 'processing' | 'queued' | 'failed';

export interface DashboardStat {
  key: string;
  label: string;
  value: number;
  change: string;
  trend: 'up' | 'down';
}

export interface RecentJob {
  id: string;
  title: string;
  lang: string;
  duration: string;
  status: JobStatusKey;
  time: string;
}

const JOB_STATUS_MAP: Record<string, JobStatusKey> = {
  COMPLETED: 'done',
  PROCESSING: 'processing',
  PENDING: 'queued',
  FAILED: 'failed',
};

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function relativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day ago`;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const [
      totalSubtitles,
      subtitlesThisWeek,
      totalDuration,
      durationThisWeek,
      completedToday,
      completedYesterday,
      totalVideos,
      completedVideos,
      createdThisWeek,
      completedThisWeek,
      recentJobs,
      languageCounts,
    ] = await Promise.all([
      this.prisma.subtitle.count({ where: { video: { userId } } }),
      this.prisma.subtitle.count({
        where: { video: { userId }, createdAt: { gte: startOfWeek } },
      }),
      this.prisma.video.aggregate({
        where: { userId },
        _sum: { duration: true },
      }),
      this.prisma.video.aggregate({
        where: { userId, status: 'COMPLETED', updatedAt: { gte: startOfWeek } },
        _sum: { duration: true },
      }),
      this.prisma.video.count({
        where: { userId, status: 'COMPLETED', updatedAt: { gte: startOfToday } },
      }),
      this.prisma.video.count({
        where: {
          userId,
          status: 'COMPLETED',
          updatedAt: { gte: startOfYesterday, lt: startOfToday },
        },
      }),
      this.prisma.video.count({ where: { userId } }),
      this.prisma.video.count({ where: { userId, status: 'COMPLETED' } }),
      this.prisma.video.count({ where: { userId, createdAt: { gte: startOfWeek } } }),
      this.prisma.video.count({
        where: { userId, createdAt: { gte: startOfWeek }, status: 'COMPLETED' },
      }),
      this.prisma.subtitleJob.findMany({
        where: { video: { userId } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { video: true },
      }),
      this.prisma.subtitle.groupBy({
        by: ['languageCode'],
        where: { video: { userId } },
        _count: { _all: true },
      }),
    ]);

    const totalHours = (totalDuration._sum.duration ?? 0) / 3600;
    const weekHours = (durationThisWeek._sum.duration ?? 0) / 3600;
    const accuracyRate = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
    const recentRate = createdThisWeek > 0 ? (completedThisWeek / createdThisWeek) * 100 : null;
    const accuracyDelta = recentRate === null ? 0 : recentRate - accuracyRate;
    const completedDelta = completedToday - completedYesterday;

    const stats: DashboardStat[] = [
      {
        key: 'totalSubtitles',
        label: 'Total Subtitles',
        value: totalSubtitles,
        change: `+${totalSubtitles > 0 ? Math.round((subtitlesThisWeek / totalSubtitles) * 100) : 0}%`,
        trend: subtitlesThisWeek > 0 ? 'up' : 'down',
      },
      {
        key: 'hoursProcessed',
        label: 'Hours Processed',
        value: Math.round(totalHours * 10) / 10,
        change: `+${totalHours > 0 ? Math.round((weekHours / totalHours) * 100) : 0}%`,
        trend: weekHours > 0 ? 'up' : 'down',
      },
      {
        key: 'accuracyRate',
        label: 'Accuracy Rate',
        value: Math.round(accuracyRate * 10) / 10,
        change: `${accuracyDelta >= 0 ? '+' : '-'}${Math.abs(Math.round(accuracyDelta * 10) / 10)}%`,
        trend: accuracyDelta >= 0 ? 'up' : 'down',
      },
      {
        key: 'completedToday',
        label: 'Completed Today',
        value: completedToday,
        change: `${completedDelta >= 0 ? '+' : '-'}${Math.abs(completedDelta)}`,
        trend: completedDelta >= 0 ? 'up' : 'down',
      },
    ];

    const recentJobsResult = recentJobs.map((job): RecentJob => ({
      id: job.id,
      title: job.video.filename,
      lang: job.languageCode ?? '—',
      duration: formatDuration(job.video.duration ?? 0),
      status: JOB_STATUS_MAP[job.status] ?? 'queued',
      time:
        job.status === 'PROCESSING'
          ? 'In progress'
          : job.status === 'PENDING'
            ? 'Queued'
            : relativeTime(job.createdAt),
    }));

    const totalLanguage = languageCounts.reduce((sum, entry) => sum + entry._count._all, 0);
    const sorted = [...languageCounts].sort((a, b) => b._count._all - a._count._all);
    const top = sorted.slice(0, 4);
    const restCount = sorted
      .slice(4)
      .reduce((sum, entry) => sum + entry._count._all, 0);
    const toPct = (count: number) =>
      totalLanguage > 0 ? Math.round((count / totalLanguage) * 100) : 0;

    const languages = [
      ...top.map((entry) => ({
        name: entry.languageCode || 'Unknown',
        pct: toPct(entry._count._all),
      })),
      ...(restCount > 0 ? [{ name: 'Other', pct: toPct(restCount) }] : []),
    ];

    return { stats, recentJobs: recentJobsResult, languages };
  }
}