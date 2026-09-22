import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthRequest } from '../auth/types/auth-request.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

    @Get()
    getUsers() {
        return this.usersService.getUsers();
    }

    @Get(':id')
    getSingleUser(@Param('id') id: string, @Req() req: AuthRequest) {
        if (id !== req.user.sub) {
            throw new ForbiddenException('You do not have permission to access this user');
        }
        return this.usersService.getSingleUser(id);
    }

    @Post()
    createUser(@Body() body: { email: string; password: string }) {
        return this.usersService.createUser(body);
    }

    @Patch(':id')
    updateUser(@Param('id') id: string, @Body() body: Partial<{ email: string; password: string }>, @Req() req: AuthRequest) {
        if (id !== req.user.sub) {
            throw new ForbiddenException('You do not have permission to update this user');
        }
        return this.usersService.updateUser(id, body);
    }

    @Delete(':id')
    deleteUser(@Param('id') id: string, @Req() req: AuthRequest) {
        if (id !== req.user.sub) {
            throw new ForbiddenException('You do not have permission to delete this user');
        }
        return this.usersService.deleteUser(id);
    }
}
