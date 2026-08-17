import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async loginUser(dto: CreateUserDto) {

    // 1. Find the user
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // 2. User doesn't exist
    if (!user) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // 3. Compare password with bcrypt
    const passwordCorrect = await bcrypt.compare(dto.password, user.password);

    if (!passwordCorrect) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 4. Login successful
    return {
      message: 'Login successful',
      user: { id: user.id, email: user.email },
    };
  }
}