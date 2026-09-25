import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService, type ListUsersQuery } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { AuthRequest } from '../auth/types/auth-request.js';
import { ok } from '../common/response/response.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(@Query() query: ListUsersQuery) {
    return this.usersService.getUsers(query);
  }

  @Get(':id')
  async getSingleUser(@Param('id') id: string, @Req() req: AuthRequest) {
    if (id !== req.user.sub) {
      throw new ForbiddenException(
        'You do not have permission to access this user',
      );
    }
    const user = await this.usersService.getSingleUser(id);
    return ok('User fetched successfully', user);
  }

  @Post()
  async createUser(@Body() body: { email: string; password: string }) {
    const user = await this.usersService.createUser(body);
    return ok('User created successfully', user);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() body: Partial<{ email: string; password: string }>,
    @Req() req: AuthRequest,
  ) {
    if (id !== req.user.sub) {
      throw new ForbiddenException(
        'You do not have permission to update this user',
      );
    }
    const user = await this.usersService.updateUser(id, body);
    return ok('User updated successfully', user);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Req() req: AuthRequest) {
    if (id !== req.user.sub) {
      throw new ForbiddenException(
        'You do not have permission to delete this user',
      );
    }
    await this.usersService.deleteUser(id);
    return ok('User deleted successfully');
  }
}
