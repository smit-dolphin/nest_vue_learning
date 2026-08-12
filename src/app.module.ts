import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { VideosModule } from './videos/videos.module.js';

@Module({
    imports: [PrismaModule, UsersModule, VideosModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
