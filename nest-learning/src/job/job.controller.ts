import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JobService, type ListJobsQuery } from './job.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('jobs')
 @UseGuards(JwtAuthGuard)
export class JobController {
    constructor(private readonly jobService: JobService,
    ) { }

    

    @Get()
    getJobsByUserId(@Req() req:any, @Query() query: ListJobsQuery) {
        return this.jobService.getJobByUserId(req.user?.sub, query)
    }

    @Get(':jobId')
    getJobById(
        @Req() req:any, 
        @Param('jobId') jobId: string
    ) {
        return this.jobService.getJobById(req.user?.sub, jobId);
    }

    // @Post(':jobId/cancel')
    // cancelJobById(@Req() req:any, @Param('jobId') jobId: string){
    //     return this.jobService.cancelJobById(req.user?.sub, jobId)
    // }

    





}
