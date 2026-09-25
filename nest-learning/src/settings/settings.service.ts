import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto.js';
import { ok } from '../common/response/response.js';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserSettingPrefrence(userId: string) {
    return this.prisma.userSettings.findUnique({
      where: { userId },
    });
  }

  async updateUserPrefrenceSettings(
    userId: string,
    body: UpdateUserSettingsDto,
  ) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      create: { userId, ...body },
      update: body,
    });

    return ok('User preference updated successfully', settings);
  }
}
