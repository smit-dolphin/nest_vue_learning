import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import type { Request } from 'express';

import { PrismaService } from '../prisma/prisma.service.js';

import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  // =========================
  // CREATE REFRESH TOKEN
  // =========================

  async createRefreshToken(
    userId: string,
    email: string,
  ) {
    const refreshToken =
      await this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          expiresIn: '7d',
        },
      );

    return refreshToken;
  }

  // =========================
  // LOGIN
  // =========================

  async loginUser(dto: LoginDto) {
    // 1. Find user
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

    // 3. Check password
    const passwordCorrect =
      await bcrypt.compare(
        dto.password,
        user.password,
      );

    if (!passwordCorrect) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    // 4. Create access token
    const accessToken =
      await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          expiresIn: '15m',
        },
      );

    // 5. Create refresh token
    const refreshToken =
      await this.createRefreshToken(
        user.id,
        user.email,
      );

    // 6. Return result
    return {
      message: 'Login successful',

      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },

      accessToken,
      refreshToken,
    };
  }

  // =========================
  // REGISTER
  // =========================

  async registerUser(dto: RegisterDto) {
    // 1. Check existing user
    const existing =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Email already in use',
      );
    }

    // 2. Hash password
    const hashedPassword =
      await bcrypt.hash(dto.password, 10);

    // 3. Create user
    const user =
      await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          password: hashedPassword,
        },
      });

    // 4. Create access token
    const accessToken =
      await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          expiresIn: '15m',
        },
      );

    // 5. Create refresh token
    const refreshToken =
      await this.createRefreshToken(
        user.id,
        user.email,
      );

    // 6. Return
    return {
      message: 'Registration successful',

      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },

      accessToken,
      refreshToken,
    };
  }

  // =========================
  // REFRESH ACCESS TOKEN
  // =========================

  async refreshAccessToken(
    request: Request,
  ) {
    // 1. Get refresh token from cookie

    const refreshToken =
      request.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token not found',
      );
    }

    // 2. Verify refresh token

    let payload: {
      sub: string;
      email: string;
    };

    try {
      payload =
        await this.jwtService.verifyAsync(
          refreshToken,
        );
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired refresh token',
      );
    }

    // 3. Find user using token's user ID

    const user =
      await this.prisma.user.findUnique({
        where: {
          id: payload.sub,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Invalid refresh token',
      );
    }

    // 4. Create new access token

    const accessToken =
      await this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
        },
        {
          expiresIn: '15m',
        },
      );

    // 5. Create new refresh token

    const newRefreshToken =
      await this.createRefreshToken(
        user.id,
        user.email,
      );

    // 6. Return tokens

    return {
      message:
        'Token generated successfully',

      accessToken,

      refreshToken: newRefreshToken,
    };
  }

  // =========================
  // GET MY PROFILE
  // =========================

  async getMyProfile(userId: string) {
    return await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  }
}