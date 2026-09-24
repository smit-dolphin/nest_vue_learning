import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateNotificationDto } from './dto/create-notification.dto.js';
import {
  paginationHelper,
  searchHelper,
  enumFilter,
  dateRangeFilter,
  type PrismaWhere,
} from '../common/query/query.helpers.js';
import { ok } from '../common/response/response.js';

export interface ListNotificationsQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  unreadOnly?: string;
  type?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, notification: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data as Prisma.InputJsonValue | undefined,
      },
    });
  }

  async findForUser(userId: string, query: ListNotificationsQuery = {}) {
    const where: PrismaWhere = { userId };

    if (query.unreadOnly === 'true') {
      where['readAt'] = null;
    }

    searchHelper(where, query.search, ['title', 'message']);
    enumFilter(where, 'type', query.type);
    dateRangeFilter(where, 'createdAt', query.from, query.to);

    const totalData = await this.prisma.notification.count({
      where,
    });
    const { skip, take, meta } = paginationHelper(query, totalData, 10);

    const notifications = await this.prisma.notification.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });

    return ok('Notifications fetched successfully', notifications, meta);
  }

  countUnread(userId: string) {
    return this.prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  markAsRead(userId: string, notificationId: string) {
    return this.prisma.notification.updateMany({
      where: { id: notificationId, userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
