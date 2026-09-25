import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthRequest } from '../auth/types/auth-request.js';
import { SettingsService } from './settings.service.js';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto.js';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('user')
  getUserSettingPrefrence(@Req() req: AuthRequest) {
    return this.settingsService.getUserSettingPrefrence(req.user.sub);
  }

  @Patch('user')
  updateUserSettingPrefrencce(
    @Req() req: AuthRequest,
    @Body() body: UpdateUserSettingsDto,
  ) {
    return this.settingsService.updateUserPrefrenceSettings(req.user.sub, body);
  }
}
