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
import { AuthMiddleware } from './auth/auth/auth.middleware.js';
import { BullModule } from '@nestjs/bullmq';
import { JobModule } from './job/job.module.js';

@Module({
    imports: [
        BullModule.forRoot(
            {

              connection: {
                    host: process.env.REDIS_HOST,
                    port: process.env.REDIS_PORT,
                    password: process.env.REDIS_PASSWORD,
                }
            }
        ),
        
        JwtModule.register({
        global:true,
        secret:process.env.JWT_SECRET,
        signOptions: { expiresIn: '5h' },

    }), PrismaModule, UsersModule, VideosModule, SubtitleModule, AuthModule, FfmpegModule, TranscriptionModule, JobModule],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule{}
// export class AppModule implements NestModule{
//     configure(consumer:MiddlewareConsumer){
//         consumer
//         .apply(AuthMiddleware)
//         .forRoutes(
//             'users'
//             ,'auth/me'
//         );
//     }
// }
