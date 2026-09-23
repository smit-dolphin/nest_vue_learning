import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthRequest } from '../auth/types/auth-request.js';
import { NotificationsService, type ListNotificationsQuery } from './notifications.service.js';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findMine(
    @Req() request: AuthRequest,
    @Query() query: ListNotificationsQuery,
  ) {
    return this.notificationsService.findForUser(request.user.sub, query);
  }

  @Get('unread-count')
  async unreadCount(@Req() request: AuthRequest) {
    const count = await this.notificationsService.countUnread(request.user.sub);
    return { count };
  }

  @Patch('read-all')
  async markAllAsRead(@Req() request: AuthRequest) {
    const result = await this.notificationsService.markAllAsRead(
      request.user.sub,
    );
    return { updated: result.count };
  }

  @Patch(':id/read')
  async markAsRead(
    @Req() request: AuthRequest,
    @Param('id') notificationId: string,
  ) {
    const result = await this.notificationsService.markAsRead(
      request.user.sub,
      notificationId,
    );
    return { updated: result.count };
  }
}