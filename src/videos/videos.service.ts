import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class VideosService {

    constructor(private readonly prisma: PrismaService) {}

    async saveVideo(file: Express.Multer.File, userId: string) {
        return await this.prisma.video.create({
            data: {
                filename: file.filename,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size,
                userId,
            },
        });
    }

    async getVideos() {
        return await this.prisma.video.findMany({ include: { user:{select:{email:true}} } });
    }

    async getUserVideos(userId: string) {
        return await this.prisma.video.findMany({ where: { userId } });
    }
}
