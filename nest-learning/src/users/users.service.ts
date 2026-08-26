import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {

    constructor(private readonly prisma: PrismaService) {}

    async getUsers() {
        const users = await this.prisma.user.findMany();
        return users.map(({ password, ...user }) => user);
    }

    async getSingleUser(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) throw new NotFoundException('User not found');
        const { password, ...rest } = user;
        return rest;
    }

    async createUser(body: { email: string; password: string }) {
        const existing = await this.prisma.user.findUnique({ where: { email: body.email } });
        if (existing) throw new ConflictException('Email already in use');

        const hashed = await bcrypt.hash(body.password, 10);
        const user = await this.prisma.user.create({
            data: { email: body.email, password: hashed },
        });

        const { password, ...rest } = user;
        return rest;
    }

    async updateUser(id: string, body: Partial<{ email: string; password: string }>) {
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
