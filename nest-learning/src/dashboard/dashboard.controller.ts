import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthRequest } from '../auth/types/auth-request.js';
import { ok } from '../common/response/response.js';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboard(@Req() req: AuthRequest) {
    const data = await this.dashboardService.getDashboard(req.user.sub);
    return ok('Dashboard fetched successfully', data);
  }
}
