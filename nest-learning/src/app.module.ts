import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { VideosModule } from './videos/videos.module.js';
import { SubtitleModule } from './subtitle/subtitle.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtModule } from '@nestjs/jwt';
import { FfmpegModule } from './ffmpeg/ffmpeg.module.js';
import { TranscriptionModule } from './transcription/transcription.module.js';
import { BullModule } from '@nestjs/bullmq';
import { JobModule } from './job/job.module.js';
import { AgentModule } from './agent/agent.module.js';
import { StorageModule } from './storage/storage.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SettingsModule } from './settings/settings.module.js';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        // host: process.env.REDIS_HOST,
        // port: process.env.REDIS_PORT,
        // password: process.env.REDIS_PASSWORD,
        url: process.env.REDIS_URL,
      },
    }),

    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), '..', 'frontend', 'dist'),
      serveRoot: '/',
      exclude: ['/api', '/api/{*path}'],
    }),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '5h' },
    }),
    PrismaModule,
    UsersModule,
    VideosModule,
    SubtitleModule,
    AuthModule,
    FfmpegModule,
    TranscriptionModule,
    JobModule,
    AgentModule,
    StorageModule,
    NotificationsModule,
    DashboardModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
