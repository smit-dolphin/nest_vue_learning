import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';

import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './google.strategy.js';

@Module({
    imports: [
    PassportModule,
  ],
  providers: [AuthService, GoogleStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
