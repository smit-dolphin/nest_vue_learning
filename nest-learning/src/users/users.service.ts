import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '../../generated/prisma/enums.js';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import {
  paginationHelper,
  searchHelper,
  enumFilter,
  dateRangeFilter,
  type PrismaWhere,
} from '../common/query/query.helpers.js';
import { ok } from '../common/response/response.js';

export interface ListUsersQuery {
  page?: string | number;
  limit?: string | number;
  search?: string;
  role?: string;
  from?: string;
  to?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(query: ListUsersQuery = {}) {
    const where: PrismaWhere = {};

    searchHelper(where, query.search, ['email', 'username']);
    enumFilter(where, 'role', query.role, UserRole);
    dateRangeFilter(where, 'createdAt', query.from, query.to);

    const totalData = await this.prisma.user.count({ where });
    const { skip, take, meta } = paginationHelper(query, totalData, 10);

    const users = await this.prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        profileImage: true,
        googleId: true,
        settings: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return ok('Users fetched successfully', users, meta);
  }

  async getSingleUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user;
    return rest;
  }

  async createUser(body: { email: string; password: string }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: body.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(body.password, 10);
    const user = await this.prisma.user.create({
      data: { email: body.email, password: hashed },
    });

    const { password, ...rest } = user;
    return rest;
  }

  async updateUser(
    id: string,
    body: Partial<{ email: string; password: string }>,
  ) {
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }
    const user = await this.prisma.user.update({ where: { id }, data: body });
    const { password, ...rest } = user;
    return rest;
  }

  async deleteUser(id: string) {
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User deleted successfully' };
  }
}
