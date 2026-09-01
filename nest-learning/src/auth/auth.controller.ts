import {
    Body,
    Controller,
    Post,
    Get,
    Req,
    UseGuards,
    Res,
} from '@nestjs/common';

import type {
    Request,
    Response,
} from 'express';

import { AuthService } from './auth.service.js';

import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

import type { AuthRequest } from './types/auth-request.js';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    // =========================
    // LOGIN
    // =========================

    @Post('login')
    async loginUser(
        @Body() body: LoginDto,
        @Res({ passthrough: true })
        res: Response,
    ) {
        const result =
            await this.authService.loginUser(body);

        res.cookie(
            'refreshToken',
            result.refreshToken,
            {
                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    'production',

                sameSite: 'strict',

                maxAge:
                    7 *
                    24 *
                    60 *
                    60 *
                    1000,
            },
        );

        return {
            message: result.message,

            user: result.user,

            accessToken: result.accessToken,
        };
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
        const result =
            await this.authService.registerUser(body);

        res.cookie(
            'refreshToken',
            result.refreshToken,
            {
                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    'production',

                sameSite: 'strict',

                maxAge:
                    7 *
                    24 *
                    60 *
                    60 *
                    1000,
            },
        );

        return {
            message: result.message,

            user: result.user,

            accessToken: result.accessToken,
        };
    }

    // =========================
    // GET MY PROFILE
    // =========================

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMyProfile(
        @Req() request: AuthRequest,
    ) {
        return this.authService.getMyProfile(
            request.user.sub,
        );
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
        const result =
            await this.authService.refreshAccessToken(
                request,
            );

        // Replace old refresh token
        // with the new one

        res.cookie(
            'refreshToken',
            result.refreshToken,
            {
                httpOnly: true,

                secure:
                    process.env.NODE_ENV ===
                    'production',

                sameSite: 'strict',

                maxAge:
                    7 *
                    24 *
                    60 *
                    60 *
                    1000,
            },
        );

        return {
            message: result.message,

            accessToken: result.accessToken,
        };
    }

@Post('logout') 
logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');

    return {
        msg: 'user logged out successfully'
    };
}
}