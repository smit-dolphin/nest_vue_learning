import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JobService, type ListJobsQuery } from './job.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { ok } from '../common/response/response.js';

@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  getJobsByUserId(@Req() req: any, @Query() query: ListJobsQuery) {
    return this.jobService.getJobByUserId(req.user?.sub, query);
  }

  @Get(':jobId')
  async getJobById(@Req() req: any, @Param('jobId') jobId: string) {
    const job = await this.jobService.getJobById(req.user?.sub, jobId);

    return ok('Job fetched successfully', job);
  }
}
