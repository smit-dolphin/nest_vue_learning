import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { JobService } from './job.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('jobs')
 @UseGuards(JwtAuthGuard)
export class JobController {
    constructor(private readonly jobService: JobService,
    ) { }

    

    @Get()
    getJobsByUserId(@Req() req:any) {
        return this.jobService.getJobByUserId(req.user?.sub)
    }

    @Get(':jobId')
    getJobById(
        @Req() req:any, 
        @Param('jobId') jobId: string
    ) {
        return this.jobService.getJobById(req.user?.sub, jobId);
    }

    





}
