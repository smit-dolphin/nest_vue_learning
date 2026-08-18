import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { VideosModule } from './videos/videos.module.js';
import { SubtitleModule } from './subtitle/subtitle.module.js';
import { GuardsModule } from './guards/guards.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtModule } from '@nestjs/jwt';
import { FfmpegModule } from './ffmpeg/ffmpeg.module.js';
import { TranscriptionModule } from './transcription/transcription.module.js';
import { CaptionsModule } from './captions/captions.module.js';
import { AuthMiddleware } from './auth/auth/auth.middleware.js';

@Module({
    imports: [JwtModule.register({
        global:true,
        secret:process.env.JWT_SECRET,
        signOptions: { expiresIn: '5h' },

    }), PrismaModule, UsersModule, VideosModule, SubtitleModule, GuardsModule, AuthModule, FfmpegModule, TranscriptionModule, CaptionsModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule implements NestModule{
    configure(consumer:MiddlewareConsumer){
        consumer
        .apply(AuthMiddleware)
        .forRoutes(
            'users'
        );
    }
}
