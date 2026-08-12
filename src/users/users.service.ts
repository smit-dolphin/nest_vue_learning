import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getUsers() {
    return this.prisma.user.findMany();
  }

  async getSingleUser(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(body: { email: string; password: string }) {
    return this.prisma.user.create({
      data: body,
    });
  }

  async updateUser(
    id: string,
    body: Partial<{ email: string; password: string }>,
  ) {
    return this.prisma.user.update({
      where: { id },
      data: body,
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({
      where: { id },
    });
  }
}