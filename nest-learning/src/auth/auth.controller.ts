import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  BadRequestException,
  NotFoundException,
  StreamableFile,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { createReadStream } from 'fs';

import type { Request, Response } from 'express';

import { AuthService } from './auth.service.js';

import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { ChangePasswordDto } from './dto/change-password.dto.js';
import { UpdateSettingsDto } from './dto/update-settings.dto.js';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { StreamAuthGuard } from './guards/stream-auth.guard.js';
import { StorageService } from '../storage/storage.service.js';

import type { AuthRequest } from './types/auth-request.js';

import { GoogleAuthGuard } from './google-auth.guard.js';

import { ok } from '../common/response/response.js';

type GoogleProfile = {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
  photos?: Array<{ value: string }>;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly storageService: StorageService,
  ) {}

  // =========================
  // LOGIN
  // =========================

  @Post('login')
  async loginUser(
    @Body() body: LoginDto,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const result = await this.authService.loginUser(body);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,

      secure: process.env.NODE_ENV === 'production',

      sameSite: 'strict',

      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ok(result.message, {
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  // =========================
  // REGISTER
  // =========================

  @Post('register')
  async registerUser(
    @Body() body: RegisterDto,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const result = await this.authService.registerUser(body);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,

      secure: process.env.NODE_ENV === 'production',

      sameSite: 'strict',

      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ok(result.message, {
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  // =========================
  // GET MY PROFILE
  // =========================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyProfile(@Req() request: AuthRequest) {
    const user = await this.authService.getMyProfile(request.user.sub);

    return ok('Profile fetched successfully', user);
  }

  // =========================
  // UPDATE MY PROFILE
  // =========================

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Req() request: AuthRequest,
    @Body() body: UpdateProfileDto,
  ) {
    const user = await this.authService.updateProfile(request.user.sub, body);

    return ok('Profile updated successfully', user);
  }

  // =========================
  // CHANGE PASSWORD
  // =========================

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() request: AuthRequest,
    @Body() body: ChangePasswordDto,
  ) {
    const result = await this.authService.changePassword(
      request.user.sub,
      body,
    );

    return ok(result.message);
  }

  // =========================
  // PROFILE IMAGE
  // =========================

  @Post('profile-image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 2 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

        const valid = allowed.includes(file.mimetype);
        if (!valid) {
          return cb(
            new BadRequestException('Only image files are allowed'),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  async uploadProfileImage(
    @Req() request: AuthRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = await this.authService.uploadProfileImage(
      request.user.sub,
      file,
    );

    return ok('Profile image uploaded successfully', user);
  }

  // =========================
  // PROFILE IMAGE STREAM
  // =========================

  @Get('profile-image')
  @UseGuards(StreamAuthGuard)
  async getProfileImage(@Req() request: AuthRequest) {
    const user = await this.authService.getMyProfile(request.user.sub);

    if (!user?.profileImage) {
      throw new NotFoundException('Profile image not found');
    }

    const { localPath } = await this.storageService.getLocalCopy(
      user.profileImage,
    );

    return new StreamableFile(createReadStream(localPath));
  }

  // =========================
  // USER SETTINGS
  // =========================

  @Get('settings')
  @UseGuards(JwtAuthGuard)
  async getSettings(@Req() request: AuthRequest) {
    const settings = await this.authService.getSettings(request.user.sub);

    return ok('Settings fetched successfully', settings);
  }

  @Patch('settings')
  @UseGuards(JwtAuthGuard)
  async updateSettings(
    @Req() request: AuthRequest,
    @Body() body: UpdateSettingsDto,
  ) {
    const settings = await this.authService.updateSettings(
      request.user.sub,
      body,
    );

    return ok('Settings updated successfully', settings);
  }

  // =========================
  // REFRESH
  // =========================

  @Post('refresh')
  async refreshAccessToken(
    @Req() request: Request,
    @Res({ passthrough: true })
    res: Response,
  ) {
    const result = await this.authService.refreshAccessToken(request);

    // Replace old refresh token
    // with the new one

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,

      secure: process.env.NODE_ENV === 'production',

      sameSite: 'strict',

      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ok(result.message, {
      accessToken: result.accessToken,
    });
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Passport handles the redirect
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req() req: Request & { user: GoogleProfile },
    @Res({ passthrough: true }) res: Response,
  ) {
    const profile = req.user;
    const result = await this.authService.loginWithGoogle(
      profile.id,
      profile.emails[0].value,
      profile.displayName,
      profile.photos?.[0]?.value,
    );

    const code = await this.authService.createGoogleAuthCode(result.user.id);

    const origin = `${req.protocol}://${req.get('host')}`;

    return res.redirect(
      `${origin}/auth/google/callback?code=${encodeURIComponent(code)}`,
    );
  }

  @Post('google/exchange')
  async exchangeGoogleCode(
    @Body('code') code: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.exchangeGoogleAuthCode(code);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return ok(result.message, {
      user: result.user,
      accessToken: result.accessToken,
    });
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');

    return ok('User logged out successfully');
  }
}
