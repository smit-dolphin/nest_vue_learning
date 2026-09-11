import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { SubtitleService } from './subtitle.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { FfmpegService } from '../ffmpeg/ffmpeg.service.js';
import { TranscriptionService } from '../transcription/transcription.service.js';
import { AgentService } from '../agent/agent.service.js';

describe('SubtitleService', () => {
  let service: SubtitleService;
  let prisma: {
    subtitle: {
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      subtitle: {
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubtitleService,
        { provide: PrismaService, useValue: prisma },
        { provide: FfmpegService, useValue: {} },
        { provide: TranscriptionService, useValue: {} },
        { provide: AgentService, useValue: {} },
      ],
    }).compile();

    service = module.get<SubtitleService>(SubtitleService);
  });

  it('should delete the actual subtitle file from disk', async () => {
    const root = process.cwd();
    const subtitleDir = path.join(root, 'uploads', 'subtitle');
    const subtitlePath = path.join(subtitleDir, 'delete-check.srt');
    const storedPath = path.relative(root, subtitlePath).split(path.sep).join('/');

    await fs.mkdir(subtitleDir, { recursive: true });
    await fs.writeFile(subtitlePath, 'subtitle content');

    prisma.subtitle.findUnique.mockResolvedValue({
      id: 'subtitle-1',
      path: storedPath,
      videoId: 'video-1',
      mimeType: 'application/x-subrip',
    });

    prisma.subtitle.delete.mockResolvedValue({
      id: 'subtitle-1',
      path: storedPath,
      videoId: 'video-1',
      mimeType: 'application/x-subrip',
    });

    const result = await service.deleteSubtitleById('subtitle-1');

    expect(result.result.id).toBe('subtitle-1');
    await expect(fs.access(subtitlePath)).rejects.toThrow();
  });
});
